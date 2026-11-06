import { useCallback, useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      .filter((c) => filtro === 'TODOS' || c.tipo === filtro)
      .filter(
        (c) =>
          !q ||
          nomeDe(c).toLowerCase().includes(q) ||
          (digitos.length > 0 && onlyDigits(docDe(c)).includes(digitos))
      )
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  }, [itens, busca, filtro]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Cadastros</Text>

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
          >
            <Text style={[styles.chipText, filtro === f.id && { color: '#fff' }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <CadastroCard cadastro={item} onPress={() => navigation.navigate('DetalheCadastro', { cadastroId: item.id })} />
        )}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            {itens.length === 0 ? 'Nenhum cadastro realizado ainda.' : 'Nenhum resultado encontrado.'}
          </Text>
        }
        contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.md },
  title: { fontSize: 26, fontWeight: '700', color: theme.colors.text, marginTop: theme.spacing.md, marginBottom: theme.spacing.md },
  busca: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm + 4,
  },
  filtros: { flexDirection: 'row', gap: 8, marginBottom: theme.spacing.md },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card },
  chipAtivo: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  vazio: { textAlign: 'center', color: theme.colors.muted, marginTop: theme.spacing.xl },
});