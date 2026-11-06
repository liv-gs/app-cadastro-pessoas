import { z } from 'zod';
import { validarCPF } from './cpf';
import { validarCNPJ } from './cnpj';
import { onlyDigits } from '../utils/masks';


const obrigatorio = (msg = 'Campo obrigatório') => z.string().trim().min(1, msg);
const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const dataValida = (v: string) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  if (!m) return false;
  const [d, mo, y] = m.slice(1).map(Number);
  const dt = new Date(y, mo - 1, d);
  return (
    dt.getFullYear() === y &&
    dt.getMonth() === mo - 1 &&
    dt.getDate() === d &&
    dt <= new Date()
  );
};

const email = z.string().trim().regex(emailRx, 'E-mail inválido');
const telefone = z
  .string()
  .refine((v) => [10, 11].includes(onlyDigits(v).length), 'Telefone inválido');
const cpf = z.string().refine(validarCPF, 'CPF inválido');
const data = z.string().refine(dataValida, 'Data inválida (dd/mm/aaaa)');



export const enderecoSchema = z.object({
  cep: z.string().refine((v) => onlyDigits(v).length === 8, 'CEP inválido'),
  logradouro: obrigatorio(),
  numero: obrigatorio(),
  complemento: z.string(),
  bairro: obrigatorio(),
  cidade: obrigatorio(),
  uf: z.string().length(2, 'Selecione a UF'),
});


//pessoa fisica
export const pfSchema = z.object({
  nome: obrigatorio('Informe o nome completo'),
  cpf,
  rg: obrigatorio('Informe o RG'),
  dataNascimento: data,
  email,
  telefone,
  endereco: enderecoSchema,
});

//pessoa juridica
export const pjSchema = z.object({
  razaoSocial: obrigatorio('Informe a razão social'),
  nomeFantasia: obrigatorio('Informe o nome fantasia'),
  cnpj: z.string().refine(validarCNPJ, 'CNPJ inválido'),
  inscricaoEstadual: z.string(),
  dataAbertura: data,
  email,
  telefone,
  endereco: enderecoSchema,
  representante: z.object({
    nome: obrigatorio('Informe o nome do representante'),
    cpf,
    cargo: obrigatorio('Informe o cargo'),
    email,
    telefone,
  }),
});

export type PFFormData = z.infer<typeof pfSchema>;
export type PJFormData = z.infer<typeof pjSchema>;