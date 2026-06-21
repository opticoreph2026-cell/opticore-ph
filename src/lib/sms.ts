/**
 * @file src/lib/sms.ts
 * @description SMS notification provider — stub for Phase 1.
 *
 * Implements a no-op provider with the same function signature
 * that Semaphore (PH SMS gateway) will use in production.
 * Real implementation: swap the body of `sendSms` to call
 * https://api.semaphore.co/api/v4/messages with the API key.
 *
 * Usage:
 *   import { sendSms } from '@/lib/sms';
 *   await sendSms({ to: '+639171234567', message: 'Site visit confirmed.' });
 */

export interface SmsOptions {
  /** E.164 format: +63XXXXXXXXXX */
  to: string;
  message: string;
  /** Optional: sender name registered with Semaphore (max 11 chars) */
  senderName?: string;
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
  stubbed: boolean;
}

/**
 * Send an SMS notification.
 *
 * Phase 1: NO-OP stub — logs the message but does not transmit.
 * Production: uncomment the Semaphore fetch block below and set SEMAPHORE_API_KEY.
 */
export async function sendSms(options: SmsOptions): Promise<SmsResult> {
  const { to, message, senderName = 'OptiCore' } = options;

  // ── STUB (Phase 1) ─────────────────────────────────────────────────────────
  // Log only — no network call.
  console.log(
    `[SMS STUB] to=${to} sender=${senderName} message="${message.slice(0, 80)}${message.length > 80 ? '...' : ''}"`,
  );

  return {
    success: true,
    messageId: `stub-${Date.now()}`,
    stubbed: true,
  };

  // ── PRODUCTION (uncomment when Semaphore key is available) ─────────────────
  // const apiKey = process.env.SEMAPHORE_API_KEY;
  // if (!apiKey) {
  //   console.error('[SMS] SEMAPHORE_API_KEY not set');
  //   return { success: false, error: 'SEMAPHORE_API_KEY not configured', stubbed: false };
  // }
  // try {
  //   const res = await fetch('https://api.semaphore.co/api/v4/messages', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       apikey: apiKey,
  //       number: to,
  //       message,
  //       sendername: senderName,
  //     }),
  //   });
  //   if (!res.ok) {
  //     const body = await res.text();
  //     return { success: false, error: `Semaphore error ${res.status}: ${body}`, stubbed: false };
  //   }
  //   const data = await res.json();
  //   return { success: true, messageId: data[0]?.message_id, stubbed: false };
  // } catch (err) {
  //   return { success: false, error: String(err), stubbed: false };
  // }
}

/**
 * Convenience: send site-visit confirmation SMS.
 */
export async function sendSiteVisitConfirmation(params: {
  phone: string;
  customerName: string;
  dateFormatted: string;
  technicianName: string;
}): Promise<SmsResult> {
  return sendSms({
    to: params.phone,
    message:
      `Hi ${params.customerName}! OptiCore Energy Solutions confirms your site visit on ${params.dateFormatted}. ` +
      `Your engineer: ${params.technicianName}. Questions? Reply to this number or call us.`,
  });
}

/**
 * Convenience: send installation schedule SMS.
 */
export async function sendInstallationSchedule(params: {
  phone: string;
  customerName: string;
  dateFormatted: string;
}): Promise<SmsResult> {
  return sendSms({
    to: params.phone,
    message:
      `Hi ${params.customerName}! Your Neovolt ESS installation by OptiCore is scheduled for ${params.dateFormatted}. ` +
      `Ensure site access is available. For changes, contact us ASAP. Maraming salamat!`,
  });
}
