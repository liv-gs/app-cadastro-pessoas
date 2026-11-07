import { useEffect, useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { theme } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { pfSchema, PFFormData } from '../validators/schemas';
import { maskCPF, maskDate, maskPhone } from '../utils/masks';
import { buscarCadastro, salvarCadastro, novoId } from '../storage/cadastroStorage';
import type { PessoaFisica } from '../types/cadastro';

import FormField from '../components/FormField';
import EnderecoFields from '../components/EnderecoFields';
import SectionTitle from '../components/SectionTitle';
import Button from '../components/Button';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const defaults: PFFormData = {  //(PFFormData) esse tipo foi gerado a partir do schema do Zod, utilizando z.infer, como estudamos anteriormente.
  nome: '', cpf: '', rg: '', dataNascimento: '', email: '', telefone: '',
  endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' },
};

export default function PessoaFisicaFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'PessoaFisicaForm'>>();
  const cadastroId = route.params?.cadastroId; // recebo um id, e indentifico se é uma edicao ou um novo cadastro
  const [salvando, setSalvando] = useState(false);

  const { control, handleSubmit, reset, setValue } = useForm<PFFormData>({
    resolver: zodResolver(pfSchema),  //verificar se os dados sao validos
    defaultValues: defaults,
  });

  useEffect(() => {
    if (!cadastroId) return;
    buscarCadastro(cadastroId).then((c) => {
      if (c && c.tipo === 'PF') {
        reset({
          nome: c.nome, cpf: c.cpf, rg: c.rg, dataNascimento: c.dataNascimento,
          email: c.email, telefone: c.telefone, endereco: c.endereco,
        });
      }
    });
  }, [cadastroId, reset]);

  async function onSubmit(data: PFFormData) {
    try {
      setSalvando(true);
      const existente = cadastroId ? await buscarCadastro(cadastroId) : undefined;
      const cadastro: PessoaFisica = {
        ...data,
        id: cadastroId ?? novoId(),
        tipo: 'PF',
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
    <KeyboardAwareScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={20}
    >
      <SectionTitle>Dados pessoais</SectionTitle>
      <FormField control={control} name="nome" label="Nome completo" autoCapitalize="words" />
      <FormField control={control} name="cpf" label="CPF" mask={maskCPF} keyboardType="numeric" placeholder="000.000.000-00" />
      <FormField control={control} name="rg" label="RG" />
      <FormField control={control} name="dataNascimento" label="Data de nascimento" mask={maskDate} keyboardType="numeric" placeholder="dd/mm/aaaa" />

      <SectionTitle>Contato</SectionTitle>
      <FormField control={control} name="email" label="E-mail" keyboardType="email-address" autoCapitalize="none" />
      <FormField control={control} name="telefone" label="Telefone" mask={maskPhone} keyboardType="phone-pad" placeholder="(00) 00000-0000" />

      <EnderecoFields control={control} setValue={setValue} />

      <Button
        title={cadastroId ? 'Salvar alterações' : 'Salvar e anexar documentos'}
        onPress={handleSubmit(onSubmit)}
        loading={salvando}
      />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xl * 2, backgroundColor: theme.colors.background },
});