import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { Cadastro, DOCUMENTOS_EXIGIDOS, nomeDe, docDe } from '../types/cadastro';

interface Props {
  cadastro: Cadastro;
  onPress: () => void;
}

export default function CadastroCard({ cadastro, onPress }: Props) {
  const exigidos = DOCUMENTOS_EXIGIDOS[cadastro.tipo].length;
  const enviados = cadastro.documentos.length;
  const completo = enviados >= exigidos;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Ionicons
        name={cadastro.tipo === 'PF' ? 'person-circle-outline' : 'business-outline'}
        size={34}
        color={theme.colors.primary}
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.nome} numberOfLines={1}>{nomeDe(cadastro)}</Text>
        <Text style={styles.doc}>{docDe(cadastro)}</Text>
        <Text style={[styles.docs, { color: completo ? theme.colors.success : theme.colors.muted }]}>
          Documentos: {enviados}/{exigidos}
        </Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{cadastro.tipo}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm + 2,
  },
  nome: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  doc: { fontSize: 13, color: theme.colors.muted, marginTop: 2 },
  docs: { fontSize: 12, marginTop: 4 },
  badge: { backgroundColor: theme.colors.background, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '700', color: theme.colors.primary },
});