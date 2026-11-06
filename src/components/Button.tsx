import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}

export default function Button({ title, onPress, variant = 'primary', loading, disabled }: Props) {
  const isPrimary = variant === 'primary';
  const color = variant === 'danger' ? theme.colors.danger : theme.colors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        isPrimary ? { backgroundColor: color } : { borderWidth: 1, borderColor: color },
        (disabled || loading) && { opacity: 0.6 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : color} />
      ) : (
        <Text style={[styles.text, { color: isPrimary ? '#fff' : color }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  text: { fontSize: 16, fontWeight: '600' },
});