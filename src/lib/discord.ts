/**
 * Discord webhook notifier for critical admin events.
 * Set DISCORD_WEBHOOK_URL in .env to enable.
 */

type AlertLevel = 'info' | 'warning' | 'critical';

const LEVEL_COLORS: Record<AlertLevel, number> = {
  info:     0x06B6D4, // cyan
  warning:  0xF5A524, // amber
  critical: 0xF43F5E, // rose
};

const LEVEL_EMOJI: Record<AlertLevel, string> = {
  info:     'ℹ️',
  warning:  '⚠️',
  critical: '🔴',
};

export async function sendDiscordAlert(
  message: string,
  level: AlertLevel = 'info',
  fields?: Array<{ name: string; value: string; inline?: boolean }>
): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return; // silently no-op if not configured

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            title: `${LEVEL_EMOJI[level]} OptiCore PH Admin Alert`,
            description: message,
            color: LEVEL_COLORS[level],
            fields: fields ?? [],
            footer: { text: 'OptiCore PH Admin System' },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  } catch (err) {
    // Never throw — Discord alerts are fire-and-forget
    console.error('[discord] webhook failed:', err);
  }
}
