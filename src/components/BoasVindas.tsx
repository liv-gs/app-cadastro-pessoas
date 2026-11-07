import { useEffect, useRef, useState } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';

// false = aparece toda vez que o app abre
// true  = aparece só na primeira vez que o app é aberto
const SOMENTE_PRIMEIRA_VEZ = false;
const KEY = '@boas_vindas_visto';

const PASSOS = [
  {
    icone: 'person-add-outline' as const,
    titulo: 'Cadastre',
    texto: 'Escolha entre pessoa física ou jurídica e preencha os dados. Na jurídica, inclua o representante legal.',
  },
  {
    icone: 'document-attach-outline' as const,
    titulo: 'Anexe os documentos',
    texto: 'Envie os documentos exigidos por foto.',
  },
  {
    icone: 'list-outline' as const,
    titulo: 'Consulte quando quiser',
    texto: 'Na aba Cadastros você busca, filtra, edita e vê tudo o que já foi registrado.',
  },
];

export default function BoasVindas() {
  const [visivel, setVisivel] = useState(!SOMENTE_PRIMEIRA_VEZ);
  const opacidade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!SOMENTE_PRIMEIRA_VEZ) return;
    AsyncStorage.getItem(KEY).then((visto) => setVisivel(!visto));
  }, []);

  function fechar() {
    Animated.timing(opacidade, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      setVisivel(false);
      if (SOMENTE_PRIMEIRA_VEZ) AsyncStorage.setItem(KEY, '1');
    });
  }

  if (!visivel) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, { opacity: opacidade }]}>
      <SafeAreaView style={styles.container}>
        <View style={styles.topo}>
          <Ionicons name="people-circle-outline" size={72} color="#fff" />
          <Text style={styles.titulo}>Bem-vindo(a)!</Text>
          <Text style={styles.subtitulo}>Veja como o app funciona:</Text>
        </View>

        <View style={styles.passos}>
          {PASSOS.map((p, i) => (
            <View key={p.titulo} style={styles.passo}>
              <View style={styles.icone}>
                <Ionicons name={p.icone} size={24} color={theme.colors.lilasEscuro} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.passoTitulo}>{i + 1}. {p.titulo}</Text>
                <Text style={styles.passoTexto}>{p.texto}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.botao} onPress={fechar} activeOpacity={0.85}>
          <Text style={styles.botaoTexto}>Vamos lá</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
  backgroundColor: '#776ef1',
  zIndex: 999,
  elevation: 999,
},
  container: { flex: 1, padding: theme.spacing.lg, justifyContent: 'space-between' },
  topo: { alignItems: 'center', marginTop: theme.spacing.xl },
  titulo: { fontSize: 30, fontWeight: '800', color: '#fff', marginTop: theme.spacing.sm },
  subtitulo: { fontSize: 16, color: '#fff', opacity: 0.9, marginTop: 4 },
  passos: { gap: 14 },
  passo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  icone: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passoTitulo: { fontSize: 16, fontWeight: '700', color: theme.colors.lilasEscuro },
  passoTexto: { fontSize: 13, color: theme.colors.lilasEscuro, marginTop: 2 },
  botao: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  botaoTexto: { fontSize: 18, fontWeight: '700', color: theme.colors.lilasEscuro },
});