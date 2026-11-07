import { useEffect, useState } from 'react';
import { StyleSheet, Alert, View, Text } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { theme } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { pjSchema, PJFormData } from '../validators/schemas';
import { maskCNPJ, maskCPF, maskDate, maskPhone } from '../utils/masks';
import { listarCadastros, salvarCadastro } from '../storage/cadastroStorage';
import type { PessoaFisica } from '../types/cadastro';

import FormField from '../components/FormField';
import EnderecoFields from '../components/EnderecoFields';
import SectionTitle from '../components/SectionTitle';
import Button from '../components/Button';
import CadastroCard from '../components/CadastroCard';
import RepresentanteModal from '../components/RepresentanteModal';

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
  const [pessoas, setPessoas] = useState<PessoaFisica[]>([]);
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  const { control, handleSubmit, reset, setValue } = useForm<PJFormData>({
    resolver: zodResolver(pjSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    async function carregar() {
      try {
        const lista = await listarCadastros();
        const pfs = lista.filter((c): c is PessoaFisica => c.tipo === 'PF');
        setPessoas(pfs);

        if (!cadastroId) return;
        const c = lista.find((x) => x.id === cadastroId);
        if (c && c.tipo === 'PJ') {
          reset({
            razaoSocial: c.razaoSocial, nomeFantasia: c.nomeFantasia, cnpj: c.cnpj,
            inscricaoEstadual: c.inscricaoEstadual, dataAbertura: c.dataAbertura,
            email: c.email, telefone: c.telefone, endereco: c.endereco, representante: c.representante,
          });
          const igual = pfs.find((p) => p.cpf === c.representante.cpf);
          if (igual) setSelecionadoId(igual.id);
        }
      } catch (e: any) {
        Alert.alert('Erro', e?.message ?? 'Não foi possível carregar os dados.');
      }
    }
    carregar();
  }, [cadastroId, reset]);;

  function escolherRepresentante(pf: PessoaFisica | null) {
    setModalAberto(false);
    const opts = { shouldValidate: true };

    if (!pf) {
      // Só limpa se havia uma pessoa cadastrada selecionada
      if (selecionadoId) {
        setValue('representante.nome', '', opts);
        setValue('representante.cpf', '', opts);
        setValue('representante.email', '', opts);
        setValue('representante.telefone', '', opts);
      }
      setSelecionadoId(null);
      return;
    }

    setSelecionadoId(pf.id);
    setValue('representante.nome', pf.nome, opts);
    setValue('representante.cpf', pf.cpf, opts);
    setValue('representante.email', pf.email, opts);
    setValue('representante.telefone', pf.telefone, opts);
  }

  async function onSubmit(data: PJFormData) {
    try {
      setSalvando(true);
      const salvo = await salvarCadastro({ ...data, tipo: 'PJ' }, cadastroId);
      if (cadastroId) navigation.goBack();
      else navigation.replace('Documentos', { cadastroId: salvo.id });
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível salvar o cadastro.');
    } finally {
      setSalvando(false);
    }
  }

  const pessoaSelecionada = pessoas.find((p) => p.id === selecionadoId);

  return (
    <>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
      >
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

        {pessoas.length > 0 && (
          <>
            {pessoaSelecionada ? (
              <>
                <CadastroCard cadastro={pessoaSelecionada} onPress={() => setModalAberto(true)} />
                <Text style={styles.dica}>Toque no card para trocar de representante.</Text>
              </>
            ) : (
              <Button
                title="Escolher pessoa já cadastrada"
                variant="secondary"
                onPress={() => setModalAberto(true)}
              />
            )}
          </>
        )}

        {pessoaSelecionada ? (
          <FormField control={control} name="representante.cargo" label="Cargo" />
        ) : (
          <>
            <FormField control={control} name="representante.nome" label="Nome completo" autoCapitalize="words" />
            <FormField control={control} name="representante.cpf" label="CPF" mask={maskCPF} keyboardType="numeric" placeholder="000.000.000-00" />
            <FormField control={control} name="representante.cargo" label="Cargo" />
            <FormField control={control} name="representante.email" label="E-mail" keyboardType="email-address" autoCapitalize="none" />
            <FormField control={control} name="representante.telefone" label="Telefone" mask={maskPhone} keyboardType="phone-pad" placeholder="(00) 00000-0000" />
          </>
        )}

        <Button
          title={cadastroId ? 'Salvar alterações' : 'Salvar e anexar documentos'}
          onPress={handleSubmit(onSubmit)}
          loading={salvando}
        />
      </KeyboardAwareScrollView>

      <RepresentanteModal
        visible={modalAberto}
        pessoas={pessoas}
        selecionadoId={selecionadoId}
        onSelecionar={escolherRepresentante}
        onFechar={() => setModalAberto(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xl * 2, backgroundColor: theme.colors.background },
  dica: { fontSize: 12, color: theme.colors.muted, marginBottom: theme.spacing.md, marginTop: -4 },
});