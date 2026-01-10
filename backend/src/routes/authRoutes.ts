import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import { z } from "zod";
import { logger } from "../uploads/utils/logger";
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


const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

  if (err.errors) {
    return res.status(400).json({ message: "Datos inválidos", details: err.errors });
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
    if (
  user.verificationLockedUntil &&
  user.verificationLockedUntil > new Date()
) {
  return res.status(429).json({
    message: "Account temporarily locked due to too many attempts",
  });
}

    if (!user.verificationCode || user.verificationCode !== code) {
  const attempts = Number(user.verificationAttempts ?? 0);
  const newAttempts = attempts + 1;

  user.verificationAttempts = newAttempts;

  if (newAttempts >= 5) {
    user.verificationLockedUntil = new Date(
      Date.now() + 15 * 60 * 1000 
    );
  }

  await user.save();
  
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
    user.verificationAttempts = 0;
    user.verificationLockedUntil = undefined;

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
    if (err.errors) {
      return res.status(400).json({ message: "Datos inválidos", details: err.errors });
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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: "If the email exists, a code was sent." });
    }

    const code = generateVerificationCode();

    user.resetPasswordCode = code;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendResetPasswordEmail(email, code);

    res.status(200).json({ message: "Reset code sent" });
  } catch (err) {
  const message =
    err instanceof Error ? err.message : JSON.stringify(err);

  logger.error(`❌ reset-password: ${message}`);
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
    if (
      !user ||
      user.resetPasswordCode !== code ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    res.status(200).json({ message: "Code verified" });
  } catch (err) {
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
    if (
      !user ||
      user.resetPasswordCode !== code ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password updated" });
  } catch (err) {
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

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(400).json({ message: "Incorrect password" });
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
    if (err.errors) {
      return res.status(400).json({ message: "Datos inválidos", details: err.errors });
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
    if (
      !user ||
      user.verificationCode !== code ||
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    user.lastStrongLoginAt = new Date();
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
    res.status(500).json({ message: "OTP login failed" });
  }
});

export default router;
