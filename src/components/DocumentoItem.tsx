import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import type { Documento } from '../types/cadastro';

interface Props {
  tipo: string;
  documento?: Documento;
  onAnexar?: () => void;
  onRemover?: () => void;
}

export default function DocumentoItem({ tipo, documento, onAnexar, onRemover }: Props) {
  const isImagem = documento?.mimeType?.startsWith('image/');

  return (
    <View style={styles.card}>
      <View style={styles.thumb}>
        {documento && isImagem ? (
          <Image source={{ uri: documento.uri }} style={styles.image} />
        ) : (
          <Ionicons
            name={documento ? 'document-text' : 'cloud-upload-outline'}
            size={26}
            color={documento ? theme.colors.success : theme.colors.muted}
          />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.tipo}>{tipo}</Text>
        <Text style={[styles.status, { color: documento ? theme.colors.success : theme.colors.muted }]} numberOfLines={1}>
          {documento ? documento.nome : 'Pendente'}
        </Text>
      </View>

      {onAnexar ? (
        <TouchableOpacity onPress={onAnexar} style={styles.action}>
          <Text style={styles.actionText}>{documento ? 'Trocar' : 'Anexar'}</Text>
        </TouchableOpacity>
      ) : null}
      {documento && onRemover ? (
        <TouchableOpacity onPress={onRemover} style={{ padding: 6 }}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
        </TouchableOpacity>
      ) : null}
    </View>
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
    padding: theme.spacing.sm + 4,
    marginBottom: theme.spacing.sm + 2,
    gap: 12,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: 48, height: 48 },
  tipo: { fontSize: 14,fontFamily: theme.fonts.regular, fontWeight: '600', color: theme.colors.text },
  status: { fontSize: 12, fontFamily: theme.fonts.regular, marginTop: 2 },
  action: { paddingHorizontal: 10, paddingVertical: 6 },
  actionText: { color: theme.colors.primary,fontFamily: theme.fonts.regular, fontWeight: '600' },
});