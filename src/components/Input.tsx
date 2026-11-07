import { useState } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

const colors = {
  text: '#374151',       
  label: '#6B7280',       
  line: '#D1D5DB',        
  placeholder: '#9CA3AF', 
  focusBg: 'rgba(79, 70, 229, 0.05)',
};

export default function Input({ label, error, style, onFocus, onBlur, ...rest }: Props) {
  const [focado, setFocado] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, focado && styles.labelFocused]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.placeholder}
        style={[
          styles.input,
          focado && styles.inputFocused,
          error ? styles.inputError : null,
          style,
        ]}
        onFocus={(e) => {
          setFocado(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocado(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: theme.spacing.md },
  label: {
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    fontWeight: '600',
    color: colors.label,
    marginBottom: 2,
  },
  labelFocused: {
    color: theme.colors.primary,
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    borderRadius: 0,
    paddingHorizontal: 4,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.text,
    fontFamily: 'Poppins_400Regular',
  },
  inputFocused: {
    borderBottomColor: theme.colors.primary,
    borderBottomWidth: 2,
    backgroundColor: colors.focusBg,
  },
  inputError: {
    borderBottomColor: theme.colors.danger,
  },
  error: { color: theme.colors.danger, fontSize: 12, marginTop: 4 },
});