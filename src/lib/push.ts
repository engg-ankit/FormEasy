import { prisma } from '@/lib/prisma';

/**
 * Sends an Expo push notification to all devices registered by a user.
 * Uses the plain Expo HTTP API (no extra dependency needed).
 * Invalid tokens (device uninstalled the app) are removed.
 */
export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    const tokens = await prisma.pushToken.findMany({ where: { userId } });
    if (tokens.length === 0) return;

    const messages = tokens.map((t) => ({
      to: t.token,
      sound: 'default' as const,
      title,
      body,
      data: data || {},
    }));

    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });

    if (!res.ok) return;

    // Remove tokens that Expo reports as invalid (app uninstalled)
    const result = (await res.json()) as {
      data?: { status?: string; details?: { error?: string } }[];
    };
    if (Array.isArray(result.data)) {
      const invalid = tokens.filter(
        (t, i) =>
          result.data?.[i]?.status === 'error' ||
          result.data?.[i]?.details?.error === 'DeviceNotRegistered'
      );
      if (invalid.length > 0) {
        await prisma.pushToken.deleteMany({
          where: { id: { in: invalid.map((t) => t.id) } },
        });
      }
    }
  } catch (error) {
    console.error('Push send error:', error);
  }
}