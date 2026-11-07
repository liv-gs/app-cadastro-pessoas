import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import BoasVindas from './src/components/BoasVindas';
import { acordarServidor } from './src/storage/cadastroStorage';

export default function App() {
  // Enquanto o usuário lê a tela de boas-vindas, o servidor já acorda
  useEffect(() => {
    acordarServidor();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppNavigator />
      <BoasVindas />
    </SafeAreaProvider>
  );
}