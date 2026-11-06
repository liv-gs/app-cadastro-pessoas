import { useState } from 'react';
import { Alert } from 'react-native';
import { Control, Controller, UseFormSetValue, useWatch } from 'react-hook-form';
import FormField from './FormField';
import Select from './Select';
import Button from './Button';
import SectionTitle from './SectionTitle';
import { maskCEP } from '../utils/masks';
import { buscarCep, UFS } from '../utils/cep';
import type { Endereco } from '../types/cadastro';

type ComEndereco = { endereco: Endereco };

interface Props<T extends ComEndereco> {
  control: Control<T>;
  setValue: UseFormSetValue<T>;
}

export default function EnderecoFields<T extends ComEndereco>({ control, setValue }: Props<T>) {
  const [buscando, setBuscando] = useState(false);

  // Os helpers abaixo fazem o cast uma única vez, para não espalhar "as any" pelo componente
  const c = control as unknown as Control<ComEndereco>;
  const set = setValue as unknown as UseFormSetValue<ComEndereco>;
  const cep = useWatch({ control: c, name: 'endereco.cep' });

  async function preencherPeloCep() {
    try {
      setBuscando(true);
      const end = await buscarCep(cep ?? '');
      if (!end) {
        Alert.alert('CEP não encontrado', 'Confira o CEP ou preencha manualmente.');
        return;
      }
      const opts = { shouldValidate: true };
      set('endereco.logradouro', end.logradouro, opts);
      set('endereco.bairro', end.bairro, opts);
      set('endereco.cidade', end.cidade, opts);
      set('endereco.uf', end.uf, opts);
    } catch {
      Alert.alert('Erro', 'Não foi possível consultar o CEP. Verifique sua conexão.');
    } finally {
      setBuscando(false);
    }
  }

  return (
    <>
      <SectionTitle>Endereço</SectionTitle>
      <FormField control={c} name="endereco.cep" label="CEP" mask={maskCEP} keyboardType="numeric" placeholder="00000-000" />
      <Button title="Buscar endereço pelo CEP" variant="secondary" onPress={preencherPeloCep} loading={buscando} />
      <FormField control={c} name="endereco.logradouro" label="Logradouro" />
      <FormField control={c} name="endereco.numero" label="Número" keyboardType="numeric" />
      <FormField control={c} name="endereco.complemento" label="Complemento (opcional)" />
      <FormField control={c} name="endereco.bairro" label="Bairro" />
      <FormField control={c} name="endereco.cidade" label="Cidade" />
      <Controller
        control={c}
        name="endereco.uf"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <Select label="UF" value={value} options={UFS} onChange={onChange} error={error?.message} />
        )}
      />
    </>
  );
}