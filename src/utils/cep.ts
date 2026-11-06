import { onlyDigits } from './masks'; 

export const UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB',
  'PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

export async function buscarCep(cep: string) {
  const d = onlyDigits(cep);
  if (d.length !== 8) return null;
  const res = await fetch(`https://viacep.com.br/ws/${d}/json/`);
  const json = await res.json();
  if (json.erro) return null;
  return {
    logradouro: json.logradouro ?? '',
    bairro: json.bairro ?? '',
    cidade: json.localidade ?? '',
    uf: json.uf ?? '',
  };
}