export const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY
export const PAYMONGO_PUBLIC_KEY = process.env.PAYMONGO_PUBLIC_KEY
export const PAYMONGO_WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET

// Base URL for PayMongo API
export const PAYMONGO_API_URL = 'https://api.paymongo.com/v1'

// OptiCore PH Plans
export const SUBSCRIPTION_PLANS = {
  pro: {
    name: 'Pro',
    priceCentavos: 14900, // ₱149.00
    description: 'Advanced insights and AI scanning for households'
  },
  business: {
    name: 'Business',
    priceCentavos: 79900, // ₱799.00
    description: 'Multi-property, bulk AI scanning, and advanced analytics for SMEs'
  }
}

/**
 * Helper to generate a basic auth header for PayMongo
 */
export function getPayMongoAuthHeaders() {
  const token = Buffer.from(`${PAYMONGO_SECRET_KEY}:`).toString('base64')
  return {
    Authorization: `Basic ${token}`,
    'Content-Type': 'application/json',
  }
}

/**
 * Creates a PayMongo Checkout Session
 */
export async function createCheckoutSession(
  amountCentavos,
  description,
  customerEmail,
  customerName,
  successUrl,
  cancelUrl,
  referenceNumber
) {
  const response = await fetch(`${PAYMONGO_API_URL}/checkout_sessions`, {
    method: 'POST',
    headers: getPayMongoAuthHeaders(),
    body: JSON.stringify({
      data: {
        attributes: {
          billing: {
            email: customerEmail,
            name: customerName,
          },
          line_items: [
            {
              amount: amountCentavos,
              currency: 'PHP',
              name: description,
              quantity: 1,
            },
          ],
          payment_method_types: ['card', 'gcash', 'paymaya', 'grab_pay'],
          success_url: successUrl,
          cancel_url: cancelUrl,
          reference_number: referenceNumber,
          description: description,
        },
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('PayMongo Checkout Error:', errorText)
    throw new Error('Failed to create checkout session')
  }

  return await response.json()
}
