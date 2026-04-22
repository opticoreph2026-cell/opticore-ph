/**
 * @file src/lib/paymongo.js
 * @description PayMongo payment gateway integration for OptiCore PH plan upgrades.
 * All PayMongo secret key calls are server-only.
 *
 * Docs: https://developers.paymongo.com
 */

import 'server-only';

const PAYMONGO_BASE = 'https://api.paymongo.com/v1';

/** Base64-encode the secret key for Basic Auth */
function authHeader() {
  const key = process.env.PAYMONGO_SECRET_KEY;
  if (!key) throw new Error('PAYMONGO_SECRET_KEY is not set.');
  return `Basic ${Buffer.from(`${key}:`).toString('base64')}`;
}

/**
 * Create a PayMongo Checkout Session for a plan upgrade.
 *
 * @param {object} params
 * @param {string} params.clientId    - Airtable client record ID (used in metadata)
 * @param {string} params.email       - Customer email
 * @param {string} params.plan        - 'pro' | 'business'
 * @param {string} params.successUrl  - URL to redirect after successful payment
 * @param {string} params.cancelUrl   - URL to redirect if cancelled
 * @returns {Promise<{ checkoutUrl: string; sessionId: string }>}
 */
export async function createCheckoutSession({ clientId, email, plan, successUrl, cancelUrl }) {
  // Fix: prices MUST match /pricing page exactly (₱199 / ₱999)
  // PayMongo amounts are in centavos: ₱199 = 19900, ₱999 = 99900
  const PRICES = {
    pro:      19900,  // ₱199.00/month
    business: 99900,  // ₱999.00/month
  };

  const DESCRIPTIONS = {
    pro:      'OptiCore PH — Pro Plan (₱199/month)',
    business: 'OptiCore PH — Business Plan (₱999/month)',
  };

  const amount = PRICES[plan];
  if (!amount) throw new Error(`Unknown plan: ${plan}`);

  const body = {
    data: {
      attributes: {
        billing: { email },
        line_items: [
          {
            name:        DESCRIPTIONS[plan],
            amount,
            currency:    'PHP',
            quantity:    1,
          },
        ],
        payment_method_types: ['card', 'gcash', 'grab_pay', 'paymaya'],
        success_url: successUrl,
        cancel_url:  cancelUrl,
        metadata: {
          client_id: clientId,
          plan,
        },
        send_email_receipt: true,
      },
    },
  };

  const res = await fetch(`${PAYMONGO_BASE}/checkout_sessions`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization:  authHeader(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`PayMongo error: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return {
    checkoutUrl: data.data.attributes.checkout_url,
    sessionId:   data.data.id,
  };
}

/**
 * Verify a PayMongo webhook signature.
 * PayMongo signs webhooks with HMAC-SHA256.
 *
 * @param {string} rawBody    - Raw request body string
 * @param {string} signature  - Value of the `paymongo-signature` header
 * @returns {Promise<boolean>}
 */
export async function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!secret) throw new Error('PAYMONGO_WEBHOOK_SECRET is not set.');

  // Signature format: "t=<timestamp>,te=<test_hash>,li=<live_hash>"
  const parts = Object.fromEntries(
    signature.split(',').map((part) => part.split('='))
  );

  const timestamp = parts['t'];
  const hash      = parts['te'] ?? parts['li'];  // test or live

  if (!timestamp || !hash) return false;

  const toSign = `${timestamp}.${rawBody}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(toSign));
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return computed === hash;
}
