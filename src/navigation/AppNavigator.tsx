import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../theme';
import type { RootStackParamList, TabParamList } from './types';

import HomeScreen from '../screens/HomeScreen';

import ListaCadastrosScreen from '../screens/ListaCadastrosScreen';
import PessoaFisicaFormScreen from '../screens/PessoaFisicaFormScreen';
import PessoaJuridicaFormScreen from '../screens/PessoaJuridicaFormScreen';
import DocumentosScreen from '../screens/DocumentosScreen';
import DetalheCadastroScreen from '../screens/DetalheCadastroScreen';


const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown:false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarLabelStyle: {
          fontFamily: 'Poppins_500Medium',
          fontSize: 11,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={route.name === 'Home' ? 'add-circle-outline' : 'list-outline'}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Lista" component={ListaCadastrosScreen} options={{ title: 'Cadastros' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
            headerTitleStyle: {
              fontFamily: 'Poppins_600SemiBold',
              fontSize: 18,
            },
            headerTintColor: theme.colors.text,
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerBackTitleStyle: {
              fontFamily: 'Poppins_400Regular',
            },
          }}
        >
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="PessoaFisicaForm" component={PessoaFisicaFormScreen} options={{ title: 'Pessoa Física' }} />
        <Stack.Screen name="PessoaJuridicaForm" component={PessoaJuridicaFormScreen} options={{ title: 'Pessoa Jurídica' }} />
        <Stack.Screen name="Documentos" component={DocumentosScreen} options={{ title: 'Documentos' }} />
        <Stack.Screen name="DetalheCadastro" component={DetalheCadastroScreen} options={{ title: 'Detalhes' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}