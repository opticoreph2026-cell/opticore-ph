import 'server-only';

/**
 * OptiCore PH - Security Utils
 * 
 * Includes Cloudflare Turnstile verification and other 
 * anti-bot/anti-tamper mechanisms.
 */

/**
 * Verifies a Cloudflare Turnstile CAPTCHA token.
 * 
 * @param {string} token - The token from the client-side Turnstile widget.
 * @param {string} [remoteIp] - Optional client IP for extra security.
 * @returns {Promise<boolean>} - True if verified.
 */
export async function verifyTurnstileToken(token, remoteIp) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';
  
  if (!token) return false;

  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (!data.success) {
      console.warn('[Security] Turnstile rejection:', data['error-codes']);
    }

    return data.success === true;
  } catch (error) {
    console.error('[Security] Turnstile API communication error:', error);
    return false;
  }
}
