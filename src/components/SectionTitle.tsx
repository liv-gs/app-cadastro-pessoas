import { Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

export default function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.title}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    fontFamily: 'Poppins_600SemiBold',
  },
});