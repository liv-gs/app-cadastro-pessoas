import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import BoasVindas from './src/components/BoasVindas';
import {useFonts,Poppins_400Regular, Poppins_500Medium,Poppins_600SemiBold,Poppins_700Bold,} from '@expo-google-fonts/poppins';

export default function App() {
   const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppNavigator />
      <BoasVindas />
    </SafeAreaProvider>
  );
}