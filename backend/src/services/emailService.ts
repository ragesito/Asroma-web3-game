import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("❌ RESEND_API_KEY no definida");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  code: string
) {
 try {
    await resend.emails.send({
      from: "Asroma <no-reply@asroma.app>",
      to: email,
      subject: "Verify your Asroma account",
      html: `
<!DOCTYPE html>
<html>
  <body style="
    margin:0;
    padding:0;
    background-color:#0b0b0f;
    font-family:Arial, Helvetica, sans-serif;
    color:#111827;
  ">

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 16px;">

          <!-- Card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="
            max-width:520px;
            background:#ffffff;
            border-radius:12px;
            padding:32px;
          ">

            <!-- Header -->
            <tr>
              <td style="text-align:center;">
                <h1 style="
                  margin:0;
                  color:#f97316;
                  letter-spacing:1px;
                ">
                  Asroma
                </h1>
                
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td>
                <h2 style="
                  margin:0 0 12px;
                  font-size:20px;
                  color:#111827;
                ">
                  Verify your email
                </h2>

                <p style="
                  margin:0 0 20px;
                  font-size:14px;
                  line-height:1.6;
                  color:#374151;
                ">
                  Use the verification code below to activate your Asroma account.
                </p>

                <!-- Code box -->
                <div style="
                  background:#0b0b0f;
                  border-radius:10px;
                  padding:16px;
                  text-align:center;
                  margin-bottom:20px;
                ">
                  <span style="
                    font-size:32px;
                    font-weight:bold;
                    letter-spacing:6px;
                    color:#f97316;
                  ">
                    ${code}
                  </span>
                </div>

                <p style="
                  margin:0 0 16px;
                  font-size:13px;
                  color:#6b7280;
                ">
                  This code expires in <strong>10 minutes</strong>.
                </p>

                <!-- Security -->
                <p style="
                  margin:0;
                  font-size:13px;
                  color:#6b7280;
                ">
                  If you didn’t create an account, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="
                border-top:1px solid #e5e7eb;
                padding-top:16px;
                margin-top:24px;
              ">
                <p style="
                  margin:0;
                  font-size:11px;
                  color:#9ca3af;
                  text-align:center;
                ">
                  © ${new Date().getFullYear()} Asroma. All rights reserved.<br/>
                  This is an automated message, please do not reply.
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
</html>
      `,
    });
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw new Error("Email send failed");
  }
}


export async function sendResetPasswordEmail(
  email: string,
  code: string
) {
  try {
    await resend.emails.send({
      from: "Asroma Security <security@asroma.app>",
      to: email,
      subject: "Reset your Asroma password",
      html: `
<!DOCTYPE html>
<html>
  <body style="
    margin:0;
    padding:0;
    background-color:#0b0b0f;
    font-family:Arial, Helvetica, sans-serif;
  ">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="
            max-width:520px;
            background:#ffffff;
            border-radius:12px;
            padding:32px;
          ">
            <tr>
              <td style="text-align:center;">
                <h1 style="color:#f97316;margin:0;">Asroma</h1>
                <p style="color:#6b7280;font-size:13px;">
                  Account Security
                </p>
              </td>
            </tr>

            <tr>
              <td>
                <h2 style="color:#111827;">
                  Reset your password
                </h2>

                <p style="color:#374151;font-size:14px;">
                  We received a request to reset your Asroma password.
                </p>

                <p style="color:#374151;font-size:14px;">
                  Use the code below to continue:
                </p>

                <div style="
                  background:#0b0b0f;
                  padding:16px;
                  text-align:center;
                  border-radius:8px;
                  margin:20px 0;
                ">
                  <span style="
                    font-size:28px;
                    font-weight:bold;
                    letter-spacing:6px;
                    color:#f97316;
                  ">
                    ${code}
                  </span>
                </div>

                <p style="font-size:13px;color:#6b7280;">
                  This code expires in <strong>15 minutes</strong>.
                </p>

                <p style="font-size:13px;color:#6b7280;">
                  If you didn’t request this, ignore this email.
                </p>
              </td>
            </tr>

            <tr>
              <td style="border-top:1px solid #e5e7eb;padding-top:16px;">
                <p style="font-size:11px;color:#9ca3af;text-align:center;">
                  © ${new Date().getFullYear()} Asroma. Security notification.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
      `,
    });
  } catch (error) {
    console.error("❌ Error sending reset password email:", error);
    throw new Error("Reset password email failed");
  }
}
