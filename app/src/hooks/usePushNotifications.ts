import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { registrarToken } from '../services/api';

// Desde o SDK 53, push remoto no Android não funciona no Expo Go (precisa de development build).
// O expo-notifications é importado dinamicamente para nem ser carregado no Expo Go.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

async function obterExpoPushToken(): Promise<string | null> {
  if (isExpoGo && Platform.OS === 'android') {
    console.log('Push remoto indisponível no Expo Go (Android). Use um development build.');
    return null;
  }
  if (!Device.isDevice) {
    console.log('Push notifications exigem um dispositivo físico.');
    return null;
  }

  const Notifications = await import('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: atual } = await Notifications.getPermissionsAsync();
  let status = atual;
  if (status !== 'granted') {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') {
    console.log('Permissão de notificações negada.');
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const { data } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  return data;
}

/** Pede permissão, obtém o Expo Push Token e o envia silenciosamente para a API. */
export function usePushNotifications() {
  useEffect(() => {
    (async () => {
      try {
        const token = await obterExpoPushToken();
        if (token) await registrarToken(token);
      } catch (err) {
        console.log('Falha ao registrar push token:', err);
      }
    })();
  }, []);
}
