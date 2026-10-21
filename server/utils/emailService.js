import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });



/**
 * Send custom branded OTP verification email for Password Reset via Resend
 * @param {string} toEmail - Recipient email
 * @param {string} otpCode - 6-digit verification code
 * @param {string} userName - Optional user full name
 */
export async function sendPasswordResetOtpEmail(toEmail, otpCode, userName = 'Student') {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Clubs@studymyte.tech';

  if (!apiKey || apiKey === 're_your_api_key_here') {
    console.warn('\n⚠️ [Resend Alert]: RESEND_API_KEY is missing or unconfigured in .env');
    console.warn(`🔑 [DEV FALLBACK OTP for ${toEmail}]: ====> [ ${otpCode} ] <==== (Valid for 10 min)\n`);
    return {
      success: false,
      error: 'RESEND_API_KEY is missing in server/.env. Please configure your Resend API key (re_xxxxxxxxx).',
      devOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
    };
  }

  const resend = new Resend(apiKey);

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code - The Clubs</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
          
          <!-- Sleek Branded Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #07111f 0%, #0f274a 50%, #2463ff 100%); padding: 36px 32px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; padding: 6px 16px; border-radius: 9999px; background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.25); color: #93c5fd; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 12px;">
                      Campus Club Network
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;">
                      THE CLUBS
                    </h1>
                    <p style="margin: 6px 0 0; color: #cbd5e1; font-size: 13px;">
                      StudyMyte Unified Student Portal
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td style="padding: 36px 32px 28px;">
              <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 700;">
                Password Reset Verification
              </h2>
              <p style="margin: 0 0 20px; color: #475569; font-size: 14px; line-height: 1.6;">
                Hello${userName ? ' ' + userName : ''},<br>
                We received a request to reset your password for your <strong>The Clubs</strong> student account. Use the 6-digit verification code below to verify your identity:
              </p>

              <!-- Prominent OTP Code Container -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <div style="background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); border: 2px dashed #93c5fd; border-radius: 16px; padding: 22px 32px; text-align: center; display: inline-block; min-width: 260px;">
                      <span style="font-family: 'Courier New', Courier, monospace, sans-serif; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #1d4ed8; display: block; margin-right: -10px;">
                        ${otpCode}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Notice and Expiry info -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px 16px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #1e40af; font-size: 12px; line-height: 1.5;">
                      ⏱ <strong>Expiration:</strong> This verification code is single-use and will automatically expire in <strong>10 minutes</strong>.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Security Checklist -->
              <p style="margin: 0 0 8px; color: #64748b; font-size: 12px; line-height: 1.5;">
                🔒 <strong>Security Advice:</strong> Never share this code with anyone. StudyMyte or The Clubs administrators will never contact you asking for your verification code or password.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                If you did not request this password reset, you can safely disregard this email. Your current password remains secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0 0 6px; color: #94a3b8; font-size: 11px;">
                This automated security email was sent to <a href="mailto:${toEmail}" style="color: #64748b; text-decoration: none;">${toEmail}</a>.
              </p>
              <p style="margin: 0; color: #cbd5e1; font-size: 11px;">
                © 2026 The Clubs • StudyMyte Campus Ecosystem. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `${otpCode} is your The Clubs verification code`,
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      // If error is related to unverified domain in free tier, log clear troubleshooting
      if (error.message && error.message.includes('domain')) {
        console.warn('💡 Tip: In Resend free plan, verify your custom domain "studymyte.tech" in resend.com/domains or use onboarding@resend.dev during testing.');
      }
      return { success: false, error: error.message };
    }

    console.log(`✅ [Resend Success]: Password reset OTP sent to ${toEmail} (ID: ${data?.id})`);
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('❌ Exception in sendPasswordResetOtpEmail:', err);
    return { success: false, error: err.message };
  }
}
