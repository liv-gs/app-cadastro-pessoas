
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
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CADASTRO</Text>

        <Text style={styles.title}>Novo cadastro</Text>

        <Text style={styles.subtitle}>
          Escolha o tipo de pessoa que deseja cadastrar.
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('PessoaFisicaForm')}
          activeOpacity={0.75}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name="person-outline"
              size={34}
              color={theme.colors.primary}
            />
          </View>

          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Pessoa Física</Text>
            <Text style={styles.cardDesc}>
              CPF, RG, contato e endereço
            </Text>
          </View>

          <View style={styles.arrow}>
            <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('PessoaJuridicaForm')}
          activeOpacity={0.75}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name="business-outline"
              size={34}
              color={theme.colors.primary}
            />
          </View>

          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Pessoa Jurídica</Text>
            <Text style={styles.cardDesc}>
              CNPJ, empresa e representante legal
            </Text>
          </View>

          <View style={styles.arrow}>
            <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },

  title: {
  fontSize: 30,
  fontFamily: theme.fonts.semiBold,
  color: theme.colors.text,
  letterSpacing: -0.5,
},

subtitle: {
  fontSize: 14,
  fontFamily: theme.fonts.regular,
  color: theme.colors.muted,
  marginTop: 5,
},

  

  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    width: '100%',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },

  cardsContainer: {
    flex: 1,
    marginTop: 50,
    gap: theme.spacing.lg,
  },

  card: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 190,
    padding: theme.spacing.md,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  iconContainer: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#F0EAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardText: {
    alignItems: 'center',
    marginTop: 14,
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    fontFamily: theme.fonts.semiBold,
  },

  cardDesc: {
    fontSize: 13,
    color: theme.colors.muted,
    marginTop: 6,
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
  },

  arrow: {
    position: 'absolute',
    right: 16,
    bottom: 15,
  },
  header: {
  marginTop: theme.spacing.md,
},

eyebrow: {
  fontSize: 11,
  fontWeight: '800',
  letterSpacing: 2,
  color: theme.colors.primary,
  marginBottom: 5,
},


});
