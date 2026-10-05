import { Expo, type ExpoPushMessage } from 'expo-server-sdk';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

const expo = new Expo();

/** Envia a mesma notificação para todos os tokens Expo válidos informados. */
export async function enviarPush(tokens: string[], payload: PushPayload): Promise<void> {
  const validos = tokens.filter((t) => Expo.isExpoPushToken(t));
  if (validos.length === 0) return;

  const messages: ExpoPushMessage[] = validos.map((to) => ({
    to,
    sound: 'default',
    priority: 'high',
    channelId: 'default',
    title: payload.title,
    body: payload.body,
    data: payload.data,
  }));

  for (const chunk of expo.chunkPushNotifications(messages)) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      for (const ticket of tickets) {
        if (ticket.status === 'error') console.error('Erro no ticket de push:', ticket.message);
      }
    } catch (err) {
      console.error('Falha ao enviar chunk de push:', err);
    }
  }
}
