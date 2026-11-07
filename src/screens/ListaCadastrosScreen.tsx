
import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { Cadastro, TipoPessoa, nomeDe, docDe } from '../types/cadastro';
import { listarCadastros } from '../storage/cadastroStorage';
import { onlyDigits } from '../utils/masks';
import CadastroCard from '../components/CadastroCard';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Filtro = 'TODOS' | TipoPessoa;

const FILTROS: { id: Filtro; label: string }[] = [
  { id: 'TODOS', label: 'Todos' },
  { id: 'PF', label: 'Pessoa Física' },
  { id: 'PJ', label: 'Pessoa Jurídica' },
];

export default function ListaCadastrosScreen() {
  const navigation = useNavigation<Nav>();
  const [itens, setItens] = useState<Cadastro[]>([]);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('TODOS');

  useFocusEffect(
    useCallback(() => {
      listarCadastros().then(setItens);
    }, [])
  );

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const digitos = onlyDigits(busca);

    return itens
      .filter(c => filtro === 'TODOS' || c.tipo === filtro)
      .filter(
        c =>
          !q ||
          nomeDe(c).toLowerCase().includes(q) ||
          (digitos.length > 0 && onlyDigits(docDe(c)).includes(digitos))
      )
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  }, [itens, busca, filtro]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>GERENCIAMENTO</Text>
        <Text style={styles.title}>Cadastros</Text>
        <Text style={styles.subtitle}>
          Consulte e gerencie as pessoas cadastradas.
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={21}
          color={theme.colors.muted}
        />

        <TextInput
          style={styles.busca}
          placeholder="Buscar por nome, CPF ou CNPJ"
          placeholderTextColor={theme.colors.muted}
          value={busca}
          onChangeText={setBusca}
        />

        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca('')}>
            <Ionicons
              name="close-circle"
              size={20}
              color={theme.colors.muted}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtros}>
        {FILTROS.map(f => (
          <TouchableOpacity
            key={f.id}
            style={[
              styles.chip,
              filtro === f.id && styles.chipAtivo,
            ]}
            onPress={() => setFiltro(f.id)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.chipText,
                filtro === f.id && styles.chipTextAtivo,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={c => c.id}
        renderItem={({ item }) => (
          <CadastroCard
            cadastro={item}
            onPress={() =>
              navigation.navigate('DetalheCadastro', {
                cadastroId: item.id,
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="folder-open-outline"
              size={42}
              color={theme.colors.muted}
            />
            <Text style={styles.vazio}>
              {itens.length === 0
                ? 'Nenhum cadastro realizado ainda.'
                : 'Nenhum resultado encontrado.'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
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

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,
    color: theme.colors.muted,
    fontFamily: theme.fonts.regular,
    marginTop: 5,
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    width: '100%',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 13,
    marginBottom: 20,
    height: 50,
    gap: 9,
  },

  busca: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    paddingVertical: 0,
  },

  filtros: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },

  chipAtivo: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },

  chipText: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    
  },

  chipTextAtivo: {
    color: '#fff',
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  vazio: {
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
    color: theme.colors.muted,
    fontSize: 14,
  },

  listContent: {
    paddingBottom: theme.spacing.lg,
    flexGrow: 1,
  },
});
