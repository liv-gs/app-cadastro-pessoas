import { View, Text, Modal, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import type { PessoaFisica } from '../types/cadastro';
import CadastroCard from './CadastroCard';

interface Props {
  visible: boolean;
  pessoas: PessoaFisica[];
  selecionadoId: string | null;
  onSelecionar: (pessoa: PessoaFisica | null) => void;
  onFechar: () => void;
}

export default function RepresentanteModal({ visible, pessoas, selecionadoId, onSelecionar, onFechar }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onFechar}>
      <View style={styles.overlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onFechar} />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.titulo}>Representante legal</Text>
            <TouchableOpacity onPress={onFechar} hitSlop={10}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.sub}>Escolha uma pessoa já cadastrada ou informe outro representante.</Text>

          <FlatList
            data={pessoas}
            keyExtractor={(p) => p.id}
            contentContainerStyle={{ paddingBottom: theme.spacing.md }}
            ListHeaderComponent={
              <TouchableOpacity
                style={[styles.outro, selecionadoId === null && styles.selecionado]}
                onPress={() => onSelecionar(null)}
                activeOpacity={0.8}
              >
                <Ionicons name="person-add-outline" size={30} color={theme.colors.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.outroTitulo}>Outro representante</Text>
                  <Text style={styles.outroDesc}>Preencher os dados manualmente</Text>
                </View>
                {selecionadoId === null && (
                  <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            }
            renderItem={({ item }) => (
              <View style={item.id === selecionadoId ? styles.selecionado : undefined}>
                <CadastroCard cadastro={item} onPress={() => onSelecionar(item)} />
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    maxHeight: '80%',
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: theme.spacing.md,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titulo: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  sub: { fontSize: 13, color: theme.colors.muted, marginTop: 4, marginBottom: theme.spacing.md },
  outro: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm + 2,
  },
  outroTitulo: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  outroDesc: { fontSize: 13, color: theme.colors.muted, marginTop: 2 },
  selecionado: {},
});