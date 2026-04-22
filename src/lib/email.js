/**
 * @file src/lib/email.js
 * @description Transactional email via Gmail REST API (HTTPS).
 * This replaces the SMTP-based Nodemailer setup to bypass DNS and Port blocks.
 * 
 * Requires: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN in .env
 */

import 'server-only';
import { google } from 'googleapis';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMultilineHtml(value) {
  return escapeHtml(value).replace(/\r?\n/g, '<br />');
}

function getEmailErrorMessage(error) {
  return error?.response?.data?.error?.message || error?.message || 'Failed to send email.';
}

/**
 * Initialize the Google OAuth2 Client.
 */
function getOAuth2Client() {
  const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_REDIRECT_URI } = process.env;

  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
    console.error('[OptiCore Email] CRITICAL: Gmail API OAuth2 credentials missing in .env');
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    GMAIL_REDIRECT_URI || 'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });
  return oauth2Client;
}

/**
 * Helper to send an email via the Gmail REST API.
 * Bypasses SMTP and connects via Port 443 (HTTPS).
 * 
 * @param {object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 */
async function sendGmailApiEmail({ to, subject, html }) {
  const recipient = typeof to === 'string' ? to.trim() : '';
  if (!recipient) {
    throw new Error('Email recipient is required.');
  }

  const auth = getOAuth2Client();
  if (!auth) {
    throw new Error('Email transport is not configured.');
  }

  const gmail = google.gmail({ version: 'v1', auth });
  const fromName = 'OptiCore PH';
  const fromEmail = process.env.GMAIL_USER || 'noreply@gmail.com';

  // Construct the MIME message
  const str = [
    `Content-Type: text/html; charset="UTF-8"`,
    `MIME-Version: 1.0`,
    `Content-Transfer-Encoding: 7bit`,
    `to: ${recipient}`,
    `from: "${fromName}" <${fromEmail}>`,
    `subject: ${subject}`,
    "",
    html
  ].join("\n");

  // Base64URL encode the message
  const encodedMail = Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  try {
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMail,
      },
    });
    return res.data;
  } catch (err) {
    throw new Error(getEmailErrorMessage(err));
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

/**
 * Send a One-Time Password (OTP) for identity verification.
 */
export async function sendOTPEmail({ email, otp }) {
  const safeOtp = escapeHtml(otp);
  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Verification Code — OptiCore PH</title></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Arial,sans-serif;color:#f1f0ef;">
  <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="background:#0a0a0f;">
    <tr><td align="center" style="padding:48px 16px;">
      <table role="presentation" cellspacing="0" cellpadding="0" width="480" style="background:#1a1a24;border-radius:20px;border:1px solid rgba(245,158,11,0.15);overflow:hidden;">
        <tr>
          <td style="padding:40px;text-align:center;">
             <div style="display:inline-block;padding:12px;background:rgba(245,158,11,0.1);border-radius:12px;margin-bottom:24px;">
               <span style="color:#fbbf24;font-size:24px;font-weight:bold;">⚡</span>
             </div>
             <h1 style="color:#f1f0ef;font-size:22px;margin:0 0 12px;font-weight:bold;">Verification Code</h1>
             <p style="color:#a09e9b;font-size:14px;margin:0 0 32px;line-height:1.6;">
               Your One-Time Password (OTP) for OptiCore PH is below. 
               This code will expire in 10 minutes.
             </p>
             
             <div style="background:#0a0a0f;border-radius:16px;padding:24px;border:1px solid rgba(255,255,255,0.05);letter-spacing:10px;font-size:32px;font-weight:bold;color:#fbbf24;margin-bottom:32px;">
               ${safeOtp}
             </div>
             
             <p style="color:#6b6967;font-size:12px;margin:0;">
               If you didn't request this code, please ignore this email.
             </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();

  return sendGmailApiEmail({
    to: email,
    subject: `Your Verification Code: ${otp}`,
    html,
  });
}

/**
 * Send a welcome email to a newly registered user.
 */
export async function sendWelcomeEmail({ name, email }) {
  const firstName = escapeHtml(name?.split(' ')[0] ?? 'there');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://opticoreph.com';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Welcome to OptiCore PH</title></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Arial,sans-serif;color:#f1f0ef;">
  <div style="max-width:600px;margin:20px auto;background:#1a1a24;border-radius:12px;padding:40px;border:1px solid #f59e0b26;text-align:center;">
    <h1 style="color:#fbbf24;margin-top:0;">Welcome, ${firstName}! 🎉</h1>
    <p style="color:#a09e9b;line-height:1.6;margin-bottom:32px;">
      Thank you for joining OptiCore PH. Your account is ready, and you can now start tracking your utility usage with AI-powered insights.
    </p>
    <a href="${appUrl}/dashboard" style="display:inline-block;background:#f59e0b;color:#0a0a0f;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:bold;">
      Visit Dashboard
    </a>
  </div>
</body>
</html>
  `.trim();

  return sendGmailApiEmail({
    to: email,
    subject: `Welcome to OptiCore PH, ${firstName}!`,
    html,
  });
}

/**
 * Send a password-reset email.
 */
export async function sendPasswordResetEmail({ name, email, resetUrl }) {
  const firstName = escapeHtml(name?.split(' ')[0] ?? 'there');
  const safeResetUrl = escapeHtml(resetUrl);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Reset Your Password — OptiCore PH</title></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Arial,sans-serif;color:#f1f0ef;">
  <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="background:#0a0a0f;">
    <tr><td align="center" style="padding:48px 16px;">
      <table role="presentation" cellspacing="0" cellpadding="0" width="520" style="background:#1a1a24;border-radius:20px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
        <tr>
          <td style="padding:36px 40px;text-align:center;">
            <h1 style="color:#fbbf24;font-size:22px;margin:0 0 8px;">Reset Your Password</h1>
            <p style="color:#a09e9b;font-size:14px;margin:0 0 24px;">Hi ${firstName}, we received a request to reset your password.</p>
            <a href="${safeResetUrl}" style="background:#f59e0b;color:#0a0a0f;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:12px;display:inline-block;">
              Reset Password
            </a>
            <p style="color:#6b6967;font-size:12px;margin:20px 0 0;">
              This link expires in 1 hour.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();

  return sendGmailApiEmail({
    to: email,
    subject: 'Reset your OptiCore PH password',
    html,
  });
}

export async function sendMonthlyDigestEmail({ email, name, readingDate, summary, recommendations }) {
  const firstName = escapeHtml(name?.split(' ')[0] ?? 'there');
  const safeReadingDate = escapeHtml(readingDate);
  const safeSummary = formatMultilineHtml(summary);
  const safeRecommendations = formatMultilineHtml(recommendations);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://opticoreph.com';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Your Monthly Digest — OptiCore PH</title></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Arial,sans-serif;color:#f1f0ef;">
  <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="background:#0a0a0f;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" cellspacing="0" cellpadding="0" width="560" style="background:#171720;border-radius:20px;border:1px solid rgba(245,158,11,0.14);overflow:hidden;">
        <tr>
          <td style="padding:36px 40px;">
            <h1 style="margin:0 0 10px;color:#fbbf24;font-size:24px;">Monthly Utility Digest</h1>
            <p style="margin:0 0 24px;color:#d6d3d1;font-size:14px;line-height:1.6;">
              Hi ${firstName}, here is your OptiCore PH summary for <strong>${safeReadingDate}</strong>.
            </p>
            <div style="background:#0f0f16;border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:20px;margin-bottom:18px;">
              <p style="margin:0 0 8px;color:#f1f0ef;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">Summary</p>
              <p style="margin:0;color:#d6d3d1;font-size:14px;line-height:1.7;">${safeSummary}</p>
            </div>
            <div style="background:#0f0f16;border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:20px;">
              <p style="margin:0 0 8px;color:#f1f0ef;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">Recommendations</p>
              <p style="margin:0;color:#d6d3d1;font-size:14px;line-height:1.7;">${safeRecommendations}</p>
            </div>
            <div style="padding-top:24px;">
              <a href="${appUrl}/dashboard" style="display:inline-block;background:#f59e0b;color:#0a0a0f;text-decoration:none;padding:13px 26px;border-radius:12px;font-size:14px;font-weight:700;">
                Open Dashboard
              </a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();

  return sendGmailApiEmail({
    to: email,
    subject: `Your OptiCore PH Monthly Digest for ${readingDate}`,
    html,
  });
}

/**
 * Send an active anomaly alert.
 */
export async function sendAnomalyAlertEmail({ email, name, title, message, severity }) {
  const firstName = escapeHtml(name?.split(' ')[0] ?? 'there');
  const safeTitle = escapeHtml(title);
  const safeMessage = formatMultilineHtml(message);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://opticoreph.com';

  const isCritical = severity === 'critical' || severity === 'CRITICAL';
  const colorHex = isCritical ? '#f87171' : '#fb923c'; // red-400 or orange-400
  const bgHex = isCritical ? 'rgba(248,113,113,0.1)' : 'rgba(251,146,60,0.1)';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Alert: ${safeTitle} — OptiCore PH</title></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Arial,sans-serif;color:#f1f0ef;">
  <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="background:#0a0a0f;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" cellspacing="0" cellpadding="0" width="560" style="background:#171720;border-radius:20px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
        <tr>
          <td style="padding:36px 40px;">
            <div style="display:inline-block;padding:12px;background:${bgHex};border-radius:12px;margin-bottom:20px;">
               <span style="color:${colorHex};font-size:24px;font-weight:bold;">⚠️</span>
            </div>
            <h1 style="margin:0 0 10px;color:${colorHex};font-size:22px;">${safeTitle}</h1>
            <p style="margin:0 0 24px;color:#d6d3d1;font-size:14px;line-height:1.6;">
              Hi ${firstName}, our AI Auditor detected an anomaly in your latest utility reading upload.
            </p>
            <div style="background:#0f0f16;border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:20px;">
              <p style="margin:0;color:#d6d3d1;font-size:14px;line-height:1.7;">${safeMessage}</p>
            </div>
            <div style="padding-top:28px;">
              <a href="${appUrl}/dashboard/alerts" style="display:inline-block;background:#f59e0b;color:#0a0a0f;text-decoration:none;padding:13px 26px;border-radius:12px;font-size:14px;font-weight:700;">
                Review in Dashboard
              </a>
            </div>
            <p style="color:#6b6967;font-size:12px;margin:28px 0 0;">
              You received this alert because Notification Preferences are enabled in your OptiCore Settings.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();

  return sendGmailApiEmail({
    to: email,
    subject: `OptiCore Alert: ${title}`,
    html,
  });
}

