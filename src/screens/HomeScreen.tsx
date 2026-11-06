import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Novo cadastro</Text>
      <Text style={styles.subtitle}>Escolha o tipo de pessoa que deseja cadastrar.</Text>

      <View style={styles.divider} />


      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('PessoaFisicaForm')}
        >
          <Ionicons name="person-outline" size={52} color={theme.colors.primary} />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Pessoa Física</Text>
            <Text style={styles.cardDesc}>CPF, RG, contato e endereço</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('PessoaJuridicaForm')}
        >
          <Ionicons name="business-outline" size={52} color={theme.colors.primary} />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Pessoa Jurídica</Text>
            <Text style={styles.cardDesc}>CNPJ, empresa e representante legal</Text>
          </View>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg },
  title: { 
    fontSize: 30, 
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.text, 
    marginTop: theme.spacing.md 
  },

  subtitle: { 
    fontSize: 13, 
    fontFamily: theme.fonts.regular,
    color: theme.colors.muted ,
    
  },

  card: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 190,
    padding: theme.spacing.md,
  },
  cardText: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
  },
  cardDesc: {
    fontSize: 14,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
    marginBottom:15,
    textAlign: 'center',
  },
  divider: {
    height: 1.5,
    backgroundColor: theme.colors.border,
    width: '100%',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  cardsContainer: {
  flex: 1,
  marginTop:50,
  gap: theme.spacing.lg,
},

});