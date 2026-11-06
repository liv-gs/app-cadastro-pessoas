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

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PessoaFisicaForm')}
      >
        <Ionicons name="person-outline" size={32} color={theme.colors.primary} />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Pessoa Física</Text>
          <Text style={styles.cardDesc}>CPF, RG, contato e endereço</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PessoaJuridicaForm')}
      >
        <Ionicons name="business-outline" size={32} color={theme.colors.primary} />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Pessoa Jurídica</Text>
          <Text style={styles.cardDesc}>CNPJ, empresa e representante legal</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg },
  title: { fontSize: 26, fontWeight: '700', color: theme.colors.text, marginTop: theme.spacing.md },
  subtitle: { fontSize: 15, color: theme.colors.muted, marginBottom: theme.spacing.lg, marginTop: theme.spacing.xs },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  cardText: { flex: 1, marginLeft: theme.spacing.md },
  cardTitle: { fontSize: 17, fontWeight: '600', color: theme.colors.text },
  cardDesc: { fontSize: 13, color: theme.colors.muted, marginTop: 2 },
});