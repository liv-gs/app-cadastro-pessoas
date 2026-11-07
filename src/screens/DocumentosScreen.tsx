import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Modal, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { Cadastro, Documento, DOCUMENTOS_EXIGIDOS, nomeDe } from '../types/cadastro';
import { buscarCadastro, enviarDocumento, removerDocumento } from '../storage/cadastroStorage';
import DocumentoItem from '../components/DocumentoItem';
import Button from '../components/Button';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Origem = 'camera' | 'galeria';
type Arquivo = { tipo: string; nome: string; uri: string; mimeType?: string };

export default function DocumentosScreen() {
  const navigation = useNavigation<Nav>();
  const { cadastroId } = useRoute<RouteProp<RootStackParamList, 'Documentos'>>().params;
  const [cadastro, setCadastro] = useState<Cadastro | null>(null);
  const [tipoSelecionado, setTipoSelecionado] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      setCadastro((await buscarCadastro(cadastroId)) ?? null);
    } catch (e: any) {
      setErro(e?.message ?? 'Não foi possível carregar os documentos.');
    }
  }, [cadastroId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function anexar(tipo: string, origem: Origem) {
    setTipoSelecionado(null);
    let arquivo: Arquivo | null = null;

    try {
      if (origem === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permissão negada', 'Autorize o uso da câmera nas configurações do aparelho.');
          return;
        }
        const r = await ImagePicker.launchCameraAsync({ quality: 0.7 });
        if (!r.canceled) {
          const a = r.assets[0];
          arquivo = { tipo, nome: a.fileName ?? `${tipo}.jpg`, uri: a.uri, mimeType: a.mimeType ?? 'image/jpeg' };
        }
      } else {
        const r = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
        if (!r.canceled) {
          const a = r.assets[0];
          arquivo = { tipo, nome: a.fileName ?? `${tipo}.jpg`, uri: a.uri, mimeType: a.mimeType ?? 'image/jpeg' };
        }
      }

      if (arquivo) {
        setEnviando(true);
        await enviarDocumento(cadastroId, arquivo);
        await carregar();
      }
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível anexar o documento.');
    } finally {
      setEnviando(false);
    }
  }

  function confirmarRemocao(doc: Documento) {
    Alert.alert('Remover documento', `Remover "${doc.tipo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await removerDocumento(cadastroId, doc.id);
            await carregar();
          } catch (e: any) {
            Alert.alert('Erro', e?.message ?? 'Não foi possível remover o documento.');
          }
        },
      },
    ]);
  }

  if (erro) {
    return (
      <View style={[styles.container, styles.centro]}>
        <Text style={styles.erro}>{erro}</Text>
        <Button title="Tentar novamente" onPress={carregar} />
      </View>
    );
  }

  if (!cadastro) {
    return (
      <View style={[styles.container, styles.centro]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.sub}>Conectando ao servidor...</Text>
      </View>
    );
  }

  const exigidos = DOCUMENTOS_EXIGIDOS[cadastro.tipo];
  const enviados = cadastro.documentos.length;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md }}>
        <Text style={styles.titulo}>{nomeDe(cadastro)}</Text>
        <Text style={styles.sub}>{enviados} de {exigidos.length} documentos anexados</Text>

        {exigidos.map((tipo) => {
          const doc = cadastro.documentos.find((d) => d.tipo === tipo);
          return (
            <DocumentoItem
              key={tipo}
              tipo={tipo}
              documento={doc}
              onAnexar={enviando ? undefined : () => setTipoSelecionado(tipo)}
              onRemover={doc && !enviando ? () => confirmarRemocao(doc) : undefined}
            />
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Concluir"
          disabled={enviando}
          onPress={() => navigation.navigate('Tabs', { screen: 'Lista' })}
        />
      </View>

      {enviando && (
        <View style={styles.enviando}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.enviandoTexto}>Enviando documento...</Text>
        </View>
      )}

      <Modal visible={!!tipoSelecionado} transparent animationType="slide" onRequestClose={() => setTipoSelecionado(null)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setTipoSelecionado(null)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{tipoSelecionado}</Text>
            {([
              ['camera', 'camera-outline', 'Tirar foto'],
              ['galeria', 'image-outline', 'Escolher da galeria'],
            ] as const).map(([origem, icone, label]) => (
              <TouchableOpacity key={origem} style={styles.option} onPress={() => anexar(tipoSelecionado!, origem)}>
                <Ionicons name={icone} size={22} color={theme.colors.primary} />
                <Text style={styles.optionText}>{label}</Text>
              </TouchableOpacity>
            ))}
            <Button title="Cancelar" variant="secondary" onPress={() => setTipoSelecionado(null)} />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centro: { alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg },
  erro: { color: theme.colors.danger, textAlign: 'center', marginBottom: theme.spacing.md },
  titulo: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
  sub: { fontSize: 14, color: theme.colors.muted, marginBottom: theme.spacing.md, marginTop: 4 },
  footer: { padding: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.card },
  enviando: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  enviandoTexto: { color: '#fff', marginTop: 12, fontSize: 15, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: theme.colors.card, padding: theme.spacing.md, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.sm },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  optionText: { fontSize: 16, color: theme.colors.text },
});