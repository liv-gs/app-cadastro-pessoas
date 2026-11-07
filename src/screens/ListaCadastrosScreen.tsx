import { useCallback, useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { Cadastro, TipoPessoa, nomeDe, docDe } from '../types/cadastro';
import { listarCadastros } from '../storage/cadastroStorage';
import { onlyDigits } from '../utils/masks';
import CadastroCard from '../components/CadastroCard';
import Button from '../components/Button';

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
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      setItens(await listarCadastros());
    } catch (e: any) {
      setErro(e?.message ?? 'Não foi possível carregar os cadastros.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const digitos = onlyDigits(busca);
    return itens
      .filter((c) => filtro === 'TODOS' || c.tipo === filtro)
      .filter(
        (c) =>
          !q ||
          nomeDe(c).toLowerCase().includes(q) ||
          (digitos.length > 0 && onlyDigits(docDe(c)).includes(digitos))
      )
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  }, [itens, busca, filtro]);

  function vazio() {
    if (carregando) {
      return (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.vazio}>
            Conectando ao servidor...{'\n'}Na primeira vez pode levar até 1 minuto.
          </Text>
        </View>
      );
    }
    if (erro) {
      return (
        <View style={styles.centro}>
          <Text style={[styles.vazio, { color: theme.colors.danger }]}>{erro}</Text>
          <Button title="Tentar novamente" onPress={() => { setCarregando(true); carregar(); }} />
        </View>
      );
    }
    return (
      <Text style={styles.vazio}>
        {itens.length === 0 ? 'Nenhum cadastro realizado ainda.' : 'Nenhum resultado encontrado.'}
      </Text>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>LISTAGEM</Text>

        <Text style={styles.title}>Cadastros</Text>

        <Text style={styles.subtitle}>
          Busque e consulte os cadastros realizados.
        </Text>
      </View>

      <View style={styles.divider} />

      <TextInput
        style={styles.busca}
        placeholder="Buscar por nome, CPF ou CNPJ"
        placeholderTextColor={theme.colors.muted}
        value={busca}
        onChangeText={setBusca}
      />

      <View style={styles.filtros}>
        {FILTROS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.chip, filtro === f.id && styles.chipAtivo]}
            onPress={() => setFiltro(f.id)}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipText, filtro === f.id && styles.chipTextAtivo]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <CadastroCard cadastro={item} onPress={() => navigation.navigate('DetalheCadastro', { cadastroId: item.id })} />
        )}
        ListEmptyComponent={vazio}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => { setAtualizando(true); carregar(); }}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: theme.spacing.xl * 2 }}
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
    marginBottom: theme.spacing.lg,
  },

  busca: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm + 4,
  },

  filtros: { flexDirection: 'row', gap: 8, marginBottom: theme.spacing.md },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  chipAtivo: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 13, fontFamily: theme.fonts.semiBold, color: theme.colors.text },
  chipTextAtivo: { color: '#fff' },

  centro: { alignItems: 'center', marginTop: theme.spacing.xl, paddingHorizontal: theme.spacing.md },
  vazio: {
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
    color: theme.colors.muted,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
});