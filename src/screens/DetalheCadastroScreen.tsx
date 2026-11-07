import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { Cadastro, DOCUMENTOS_EXIGIDOS, nomeDe } from '../types/cadastro';
import { buscarCadastro, removerCadastro } from '../storage/cadastroStorage';
import SectionTitle from '../components/SectionTitle';
import DocumentoItem from '../components/DocumentoItem';
import Button from '../components/Button';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function Linha({ label, valor }: { label: string; valor?: string }) {
  return (
    <View style={styles.linha}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.valor}>{valor && valor.trim() ? valor : '—'}</Text>
    </View>
  );
}

export default function DetalheCadastroScreen() {
  const navigation = useNavigation<Nav>();
  const { cadastroId } = useRoute<RouteProp<RootStackParamList, 'DetalheCadastro'>>().params;
  const [c, setC] = useState<Cadastro | null>(null);

  useFocusEffect(
    useCallback(() => {
      buscarCadastro(cadastroId)
        .then((r) => setC(r ?? null))
        .catch((e) => Alert.alert('Erro', e?.message ?? 'Não foi possível carregar o cadastro.'));
    }, [cadastroId])
  );

  function editar() {
    if (!c) return;
    navigation.navigate(c.tipo === 'PF' ? 'PessoaFisicaForm' : 'PessoaJuridicaForm', { cadastroId: c.id });
  }

  function excluir() {
    Alert.alert('Excluir cadastro', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await removerCadastro(cadastroId);
            navigation.goBack();
          } catch (e: any) {
            Alert.alert('Erro', e?.message ?? 'Não foi possível excluir o cadastro.');
          }
        },
      },
    ]);
  }

  if (!c) return null;

  const e = c.endereco;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            {c.tipo === 'PF' ? 'PESSOA FÍSICA' : 'PESSOA JURÍDICA'}
          </Text>

          <Text style={styles.title}>{nomeDe(c)}</Text>

          <Text style={styles.subtitle}>Confira os dados e documentos do cadastro.</Text>
        </View>

        <View style={styles.divider} />

        {c.tipo === 'PF' ? (
          <>
            <SectionTitle>Dados pessoais</SectionTitle>
            <Linha label="CPF" valor={c.cpf} />
            <Linha label="RG" valor={c.rg} />
            <Linha label="Data de nascimento" valor={c.dataNascimento} />
          </>
        ) : (
          <>
            <SectionTitle>Dados da empresa</SectionTitle>
            <Linha label="Nome fantasia" valor={c.nomeFantasia} />
            <Linha label="CNPJ" valor={c.cnpj} />
            <Linha label="Inscrição estadual" valor={c.inscricaoEstadual} />
            <Linha label="Data de abertura" valor={c.dataAbertura} />
          </>
        )}

        <SectionTitle>Contato</SectionTitle>
        <Linha label="E-mail" valor={c.email} />
        <Linha label="Telefone" valor={c.telefone} />

        <SectionTitle>Endereço</SectionTitle>
        <Linha label="CEP" valor={e.cep} />
        <Linha label="Logradouro" valor={`${e.logradouro}, ${e.numero}${e.complemento ? ' - ' + e.complemento : ''}`} />
        <Linha label="Bairro" valor={e.bairro} />
        <Linha label="Cidade/UF" valor={`${e.cidade} - ${e.uf}`} />

        {c.tipo === 'PJ' && (
          <>
            <SectionTitle>Representante legal</SectionTitle>
            <Linha label="Nome" valor={c.representante.nome} />
            <Linha label="CPF" valor={c.representante.cpf} />
            <Linha label="Cargo" valor={c.representante.cargo} />
            <Linha label="E-mail" valor={c.representante.email} />
            <Linha label="Telefone" valor={c.representante.telefone} />
          </>
        )}

        <SectionTitle>Documentos</SectionTitle>
        {DOCUMENTOS_EXIGIDOS[c.tipo].map((tipo) => (
          <DocumentoItem key={tipo} tipo={tipo} documento={c.documentos.find((d) => d.tipo === tipo)} />
        ))}

        <View style={styles.acoes}>
          <Button title="Gerenciar documentos" onPress={() => navigation.navigate('Documentos', { cadastroId: c.id })} />
          <Button title="Editar dados" variant="secondary" onPress={editar} />
          <Button title="Excluir cadastro" variant="danger" onPress={excluir} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
  },

  header: {
    marginTop: theme.spacing.md,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    color: theme.colors.primary,
    marginBottom: 5,
  },

  title: {
    fontSize: 30,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.text,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.muted,
    marginTop: 5,
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    width: '100%',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },

  linha: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },

  label: {
    fontSize: 11,
    fontFamily: theme.fonts.regular,
    color: theme.colors.muted,
  },

  valor: {
    fontSize: 14,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.text,
    marginTop: 3,
  },

  acoes: {
    marginTop: theme.spacing.md,
  },
});