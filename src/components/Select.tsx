import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface Props {
  label: string;
  value?: string;
  options: string[];
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
}

export default function Select({ label, value, options, onChange, error, placeholder = 'Selecione' }: Props) {
  const [aberto, setAberto] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.input, error ? { borderColor: theme.colors.danger } : null]}
        onPress={() => setAberto(true)}
      >
        <Text style={{ color: value ? theme.colors.text : theme.colors.muted, fontSize: 15 }}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={aberto} transparent animationType="slide" onRequestClose={() => setAberto(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setAberto(false)}>
          <View style={styles.sheet}>
            <FlatList
              data={options}
              keyExtractor={(i) => i}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onChange(item);
                    setAberto(false);
                  }}
                >
                  <Text style={{ fontSize: 16, color: theme.colors.text }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: theme.spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: theme.colors.text, marginBottom: 6 },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
    
  },
  error: { color: theme.colors.danger, fontSize: 12, marginTop: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: theme.colors.card,
    maxHeight: '60%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  option: { padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
});