import { useEffect, useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { theme } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { pjSchema, PJFormData } from '../validators/schemas';
import { maskCNPJ, maskCPF, maskDate, maskPhone } from '../utils/masks';
import { buscarCadastro, salvarCadastro, novoId } from '../storage/cadastroStorage';
import type { PessoaJuridica } from '../types/cadastro';

import FormField from '../components/FormField';
import EnderecoFields from '../components/EnderecoFields';
import SectionTitle from '../components/SectionTitle';
import Button from '../components/Button';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const defaults: PJFormData = {
  razaoSocial: '', nomeFantasia: '', cnpj: '', inscricaoEstadual: '', dataAbertura: '',
  email: '', telefone: '',
  endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' },
  representante: { nome: '', cpf: '', cargo: '', email: '', telefone: '' },
};

export default function PessoaJuridicaFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'PessoaJuridicaForm'>>();
  const cadastroId = route.params?.cadastroId;
  const [salvando, setSalvando] = useState(false);

  const { control, handleSubmit, reset, setValue } = useForm<PJFormData>({
    resolver: zodResolver(pjSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (!cadastroId) return;
    buscarCadastro(cadastroId).then((c) => {
      if (c && c.tipo === 'PJ') {
        reset({
          razaoSocial: c.razaoSocial, nomeFantasia: c.nomeFantasia, cnpj: c.cnpj,
          inscricaoEstadual: c.inscricaoEstadual, dataAbertura: c.dataAbertura,
          email: c.email, telefone: c.telefone, endereco: c.endereco, representante: c.representante,
        });
      }
    });
  }, [cadastroId, reset]);

  async function onSubmit(data: PJFormData) {
    try {
      setSalvando(true);
      const existente = cadastroId ? await buscarCadastro(cadastroId) : undefined;
      const cadastro: PessoaJuridica = {
        ...data,
        id: cadastroId ?? novoId(),
        tipo: 'PJ',
        documentos: existente?.documentos ?? [],
        criadoEm: existente?.criadoEm ?? new Date().toISOString(),
      };
      await salvarCadastro(cadastro);
      if (cadastroId) navigation.goBack();
      else navigation.replace('Documentos', { cadastroId: cadastro.id });
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o cadastro.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <SectionTitle>Dados da empresa</SectionTitle>
        <FormField control={control} name="razaoSocial" label="Razão social" autoCapitalize="words" />
        <FormField control={control} name="nomeFantasia" label="Nome fantasia" autoCapitalize="words" />
        <FormField control={control} name="cnpj" label="CNPJ" mask={maskCNPJ} keyboardType="numeric" placeholder="00.000.000/0000-00" />
        <FormField control={control} name="inscricaoEstadual" label="Inscrição estadual (opcional)" />
        <FormField control={control} name="dataAbertura" label="Data de abertura" mask={maskDate} keyboardType="numeric" placeholder="dd/mm/aaaa" />

        <SectionTitle>Contato da empresa</SectionTitle>
        <FormField control={control} name="email" label="E-mail" keyboardType="email-address" autoCapitalize="none" />
        <FormField control={control} name="telefone" label="Telefone" mask={maskPhone} keyboardType="phone-pad" placeholder="(00) 00000-0000" />

        <EnderecoFields control={control} setValue={setValue} />

        <SectionTitle>Representante legal</SectionTitle>
        <FormField control={control} name="representante.nome" label="Nome completo" autoCapitalize="words" />
        <FormField control={control} name="representante.cpf" label="CPF" mask={maskCPF} keyboardType="numeric" placeholder="000.000.000-00" />
        <FormField control={control} name="representante.cargo" label="Cargo" />
        <FormField control={control} name="representante.email" label="E-mail" keyboardType="email-address" autoCapitalize="none" />
        <FormField control={control} name="representante.telefone" label="Telefone" mask={maskPhone} keyboardType="phone-pad" placeholder="(00) 00000-0000" />

        <Button title={cadastroId ? 'Salvar alterações' : 'Salvar e anexar documentos'} onPress={handleSubmit(onSubmit)} loading={salvando} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xl * 2, backgroundColor: theme.colors.background },
});