import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import { z } from "zod";
import { logger } from "../utils/logger";
import { sendResetPasswordEmail, sendVerificationEmail } from "../services/emailService";
import { authRateLimiter } from "../middleware/rateLimit";
import { createInternalWalletForUser } from "../services/walletService";


const router = express.Router();
router.use(authRateLimiter);
/* -------------------------------------------------------------------------- */
/* (Zod)                                                                      */
/* -------------------------------------------------------------------------- */
const registerSchema = z.object({
  username: z.string().min(3, "The username must be at least 3 characters long."),
  email: z
    .string()
    .regex(
      /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/,
      "Email inválido"
    ),
  password: z.string().min(6, "The password must be at least 6 characters long."),
});

const loginSchema = z.object({
  email: z
    .string()
    .regex(
      /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/,
      "Email inválido"
    ),
  password: z.string().min(6, "Password is too short"),
});

const verifyEmailSchema = z.object({
  email: z
    .string()
    .regex(
      /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/,
      "Email inválido"
    ),
  code: z.string().length(6, "invalid code"),
  password: z.string().min(6, "password required"),
});


/**
 * Math.random() is not a CSPRNG: V8 uses xorshift128+, whose state can be
 * recovered from observed outputs, and these codes gate account access.
 */
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/* -------------------------------------------------------------------------- */
/* Brute-force protection for the emailed 6-digit codes                        */
/* -------------------------------------------------------------------------- */
const MAX_CODE_ATTEMPTS = 5;
const CODE_LOCK_MS = 15 * 60 * 1000;

/**
 * True while the account is locked out. Clears a stale counter once the lock
 * expires — otherwise verificationAttempts stays at 5 and the next single
 * wrong code re-locks immediately, since the counter is only reset on success.
 * Mutates the user; the caller saves.
 */
const isCodeLocked = (user: any): boolean => {
  if (!user.verificationLockedUntil) return false;

  if (user.verificationLockedUntil > new Date()) return true;

  user.verificationLockedUntil = undefined;
  user.verificationAttempts = 0;
  return false;
};

/** Count a wrong code and lock the account once the limit is hit. */
const registerFailedCodeAttempt = async (user: any) => {
  const attempts = Number(user.verificationAttempts ?? 0) + 1;
  user.verificationAttempts = attempts;

  if (attempts >= MAX_CODE_ATTEMPTS) {
    user.verificationLockedUntil = new Date(Date.now() + CODE_LOCK_MS);
  }

  await user.save();
};

/** Clear the counter after a correct code. Mutates the user; caller saves. */
const clearCodeAttempts = (user: any) => {
  user.verificationAttempts = 0;
  user.verificationLockedUntil = undefined;
};

/** As isCodeLocked, for the password-reset code namespace. */
const isResetLocked = (user: any): boolean => {
  if (!user.resetPasswordLockedUntil) return false;

  if (user.resetPasswordLockedUntil > new Date()) return true;

  user.resetPasswordLockedUntil = undefined;
  user.resetPasswordAttempts = 0;
  return false;
};

/**
 * Count a wrong reset code. Past the limit the code is discarded outright, not
 * just locked: the guessing window is 15 minutes, so leaving it alive would
 * hand the attacker the rest of that window once the lock lapses.
 */
const registerFailedResetAttempt = async (user: any) => {
  const attempts = Number(user.resetPasswordAttempts ?? 0) + 1;
  user.resetPasswordAttempts = attempts;

  if (attempts >= MAX_CODE_ATTEMPTS) {
    user.resetPasswordLockedUntil = new Date(Date.now() + CODE_LOCK_MS);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
  }

  await user.save();
};

/* -------------------------------------------------------------------------- */
/* Register user                                                              */
/* -------------------------------------------------------------------------- */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = registerSchema.parse(req.body);

    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });

    if (existingEmail) return res.status(400).json({ message: "This email is already verified" });
    if (existingUsername) return res.status(400).json({ message: "This username is already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = generateVerificationCode();
    

const user = await User.create({
  username,
  email,
  password: hashedPassword,
  isVerified: false,
  verificationCode,
  verificationCodeExpires: new Date(Date.now() + 15 * 60 * 1000),
  lastVerificationSentAt: new Date(), 
});

try {
  await sendVerificationEmail(email, verificationCode);
} catch (emailError) {
  logger.error(
    `❌ Error enviando email de verificación a ${email}: ${
      emailError instanceof Error ? emailError.message : String(emailError)
    }`
  );
}




    logger.info(`🟢 Nuevo usuario registrado: ${username}`);
    res.status(201).json({
  message: "Usuario registrado. Verificá tu email.",
});

 } catch (err: any) {
  console.error("❌ REGISTER ERROR FULL:", err);

  // instanceof, not err.errors: this project is on Zod 4, where the issue
  // list moved from .errors to .issues, so the old check silently missed
  // and returned 500 on invalid input.
  if (err instanceof z.ZodError) {
    return res.status(400).json({ message: "Datos inválidos", details: err.issues });
  }

  res.status(500).json({ message: "Internal server error" });
}
});
/* -------------------------------------------------------------------------- */
/* 📧 verify email                                                           */
/* -------------------------------------------------------------------------- */
router.post("/verify-email", async (req, res) => {
  try {
    const { email, code, password } = verifyEmailSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "The account is already verified" });
    }
    if (isCodeLocked(user)) {
      return res.status(429).json({
        message: "Account temporarily locked due to too many attempts",
      });
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      await registerFailedCodeAttempt(user);

      return res.status(400).json({
        message: "Incorrect code",
      });
    }

    if (
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      return res.status(400).json({ message: "code expired" });
    }

    user.isVerified = true;
    user.verifiedAt = new Date();
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    clearCodeAttempts(user);

    await user.save();
    const wallet =
  await createInternalWalletForUser(
    String(user._id),
    "AsromaWallet",
    { returnPrivateKey: true }
  );

    logger.info(`✅ Email verificado para: ${user.email}`);

    res.status(200).json({
      message: "Email successfully verified",
      wallet: {
        name: wallet.name,
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey, 
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Datos inválidos", details: err.issues });
    }
    logger.error("❌ Error en /verify-email:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
/* -------------------------------------------------------------------------- */
/* 📧 Resend Email                                                              */
/* -------------------------------------------------------------------------- */
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "The account is already verified" });
    }

    const now = new Date();

    if (
      user.lastVerificationSentAt &&
      now.getTime() - user.lastVerificationSentAt.getTime() < 60_000
    ) {
      return res.status(429).json({
        message: "Please wait 60 seconds before resending the code",
      });
    }

    const newCode = generateVerificationCode();

    user.verificationCode = newCode;
    user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.lastVerificationSentAt = now;

    await user.save();
    await sendVerificationEmail(email, newCode);

    res.status(200).json({ message: "New code sent" });
  } catch (err: unknown) {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const message =
    err instanceof Error ? err.message : JSON.stringify(err);

  logger.error(`❌ Error en /resend-verification: ${message}`);

  res.status(500).json({ message: "Internal error server" });
}
});

/* -------------------------------------------------------------------------- */
/* 📧 request password reset                                                 */
/* -------------------------------------------------------------------------- */
router.post("/request-password-reset", async (req, res) => {
  try {
    const { email } = z.object({
      email: z.string().email(),
    }).parse(req.body);

    // One response for every path below, so the endpoint can't be used to
    // test whether an address is registered.
    const genericResponse = { message: "If the email exists, a code was sent." };

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json(genericResponse);
    }

    // Per-account throttle, mirroring /resend-verification. Without it, the
    // route both floods the victim's inbox and rotates the code on every
    // call, so a legitimate user racing an attacker never gets a working one.
    if (
      user.lastResetSentAt &&
      Date.now() - user.lastResetSentAt.getTime() < 60 * 1000
    ) {
      return res.status(200).json(genericResponse);
    }

    const code = generateVerificationCode();

    user.resetPasswordCode = code;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.lastResetSentAt = new Date();
    // A fresh code starts a fresh attempt budget.
    user.resetPasswordAttempts = 0;
    user.resetPasswordLockedUntil = undefined;
    await user.save();

    await sendResetPasswordEmail(email, code);

    res.status(200).json(genericResponse);
  } catch (err) {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const message =
    err instanceof Error ? err.message : JSON.stringify(err);

  logger.error(`❌ request-password-reset: ${message}`);
  res.status(500).json({ message: "Password reset failed" });
}

});

/* -------------------------------------------------------------------------- */
/* 📧 verify password reset                                                  */
/* -------------------------------------------------------------------------- */
router.post("/verify-password-reset", async (req, res) => {
  try {
    const { email, code } = z.object({
      email: z.string().email(),
      code: z.string().length(6),
    }).parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    if (isResetLocked(user)) {
      return res.status(429).json({
        message: "Too many attempts. Try again later.",
      });
    }

    if (
      !user.resetPasswordCode ||
      user.resetPasswordCode !== code ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      await registerFailedResetAttempt(user);
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    res.status(200).json({ message: "Code verified" });
  } catch (err) {
    // Zod rejections are the client's fault, not the server's.
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid request" });
    }
    res.status(500).json({ message: "Verification failed" });
  }
});
/* -------------------------------------------------------------------------- */
/* 📧 reset password                                                         */
/* -------------------------------------------------------------------------- */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = z.object({
      email: z.string().email(),
      code: z.string().length(6),
      newPassword: z.string().min(6),
    }).parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    if (isResetLocked(user)) {
      return res.status(429).json({
        message: "Too many attempts. Try again later.",
      });
    }

    if (
      !user.resetPasswordCode ||
      user.resetPasswordCode !== code ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      await registerFailedResetAttempt(user);
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    user.resetPasswordAttempts = 0;
    user.resetPasswordLockedUntil = undefined;

    await user.save();

    res.status(200).json({ message: "Password updated" });
  } catch (err) {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const message =
    err instanceof Error ? err.message : JSON.stringify(err);

  logger.error(`❌ reset-password: ${message}`);
  res.status(500).json({ message: "Password reset failed" });
}

});

/* -------------------------------------------------------------------------- */
/* 🔐 Login user                                                             */
/* -------------------------------------------------------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const STRONG_LOGIN_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
    const JUST_VERIFIED_GRACE_MS = 5 * 60 * 1000; 

    // One response for "no such account" and "wrong password". Distinct
    // replies turned this route into a membership oracle for the user base.
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ message: "Invalid credentials" });
    if (!user.isVerified) {
  return res.status(403).json({
    message: "Email no verificado",
    code: "EMAIL_NOT_VERIFIED",
  });
}

    if (!process.env.JWT_SECRET) throw new Error("❌ JWT_SECRET no definido");

    const now = Date.now();

const justVerified =
  user.verifiedAt &&
  now - new Date(user.verifiedAt).getTime() < JUST_VERIFIED_GRACE_MS;

const needsOtp =
  !justVerified &&
  (
    !user.lastStrongLoginAt ||
    now - new Date(user.lastStrongLoginAt).getTime() > STRONG_LOGIN_WINDOW_MS
  );


if (needsOtp) {
  const otp = generateVerificationCode();

  user.verificationCode = otp;
  user.verificationCodeExpires = new Date(now + 15 * 60 * 1000);
  user.lastVerificationSentAt = new Date();
  await user.save();

  await sendVerificationEmail(user.email, otp);

  return res.status(403).json({
    code: "OTP_REQUIRED",
    message: "OTP verification required",
  });
}

user.lastStrongLoginAt = new Date();
await user.save();

const token = jwt.sign(
  { id: user._id, username: user.username },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

res.status(200).json({
  message: "Login exitoso",
  id: user._id,
  username: user.username,
  token,
  avatar: user.avatar || "/uploads/default-avatar.jpg",
});


    logger.info(`🔑 Login correcto para usuario: ${user.username}`);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Datos inválidos", details: err.issues });
    }
    logger.error("❌ Error en /login:", err);
    res.status(500).json({ message: "Internal error server" });
  }
});

router.post("/verify-login-otp", async (req, res) => {
  try {
    const { email, code } = z.object({
      email: z.string().email(),
      code: z.string().length(6),
    }).parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    // This route issues a full 7-day session, so it needs the same gates as
    // /login and /verify-email. Without the isVerified check a registration
    // code could be redeemed here for a session on an unverified account —
    // which the cleanup cron then deletes 24h later, while the token lives on.
    if (!user.isVerified) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    if (isCodeLocked(user)) {
      return res.status(429).json({
        message: "Account temporarily locked due to too many attempts",
      });
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      await registerFailedCodeAttempt(user);
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    if (
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    user.lastStrongLoginAt = new Date();
    clearCodeAttempts(user);
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      id: user._id,
      username: user.username,
      token,
      avatar: user.avatar || "/uploads/default-avatar.jpg",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid request" });
    }
    res.status(500).json({ message: "OTP login failed" });
  }
});

export default router;
