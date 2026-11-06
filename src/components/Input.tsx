import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export default function Input({ label, error, style, ...rest }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.colors.muted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: theme.spacing.md },
  label: { fontSize: 13,fontFamily:theme.fonts.regular, fontWeight: '600', color: theme.colors.text, marginBottom: 6 },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: 'Poppins_400Regular',
    
  },
  inputError: { borderColor: theme.colors.danger,fontFamily: 'Poppins_400Regular', },
  error: { color: theme.colors.danger, fontSize: 12, marginTop: 4 },
});