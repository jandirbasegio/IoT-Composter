import { StatusBar } from 'expo-status-bar';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import { DashboardScreen } from './src/screens/DashboardScreen';

export default function App() {
  usePushNotifications();

  return (
    <>
      <DashboardScreen />
      <StatusBar style="light" />
    </>
  );
}
