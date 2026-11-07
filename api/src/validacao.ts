import { z } from 'zod';

const onlyDigits = (v: string) => v.replace(/\D/g, '');

export function validarCPF(valor: string) {
  const c = onlyDigits(valor);
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  const calc = (n: number) => {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += Number(c[i]) * (n + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(c[9]) && calc(10) === Number(c[10]);
}

export function validarCNPJ(valor: string) {
  const c = onlyDigits(valor);
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
  const calc = (base: string) => {
    const pesos =
      base.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = base.split('').reduce((a, d, i) => a + Number(d) * pesos[i], 0);
    const r = soma % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(c.slice(0, 12)) === Number(c[12]) && calc(c.slice(0, 13)) === Number(c[13]);
}

const obrigatorio = z.string().trim().min(1, 'Campo obrigatório');
const email = z.string().trim().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'E-mail inválido');
const telefone = z.string().refine((v) => [10, 11].includes(onlyDigits(v).length), 'Telefone inválido');
const cpf = z.string().refine(validarCPF, 'CPF inválido');

const dataValida = (v: string) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  if (!m) return false;
  const [d, mo, y] = m.slice(1).map(Number);
  const dt = new Date(y, mo - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d && dt <= new Date();
};
const data = z.string().refine(dataValida, 'Data inválida (dd/mm/aaaa)');

const endereco = z.object({
  cep: z.string().refine((v) => onlyDigits(v).length === 8, 'CEP inválido'),
  logradouro: obrigatorio,
  numero: obrigatorio,
  complemento: z.string(),
  bairro: obrigatorio,
  cidade: obrigatorio,
  uf: z.string().length(2),
});

export const pfSchema = z.object({
  tipo: z.literal('PF'),
  nome: obrigatorio,
  cpf,
  rg: obrigatorio,
  dataNascimento: data,
  email,
  telefone,
  endereco,
});

export const pjSchema = z.object({
  tipo: z.literal('PJ'),
  razaoSocial: obrigatorio,
  nomeFantasia: obrigatorio,
  cnpj: z.string().refine(validarCNPJ, 'CNPJ inválido'),
  inscricaoEstadual: z.string(),
  dataAbertura: data,
  email,
  telefone,
  endereco,
  representante: z.object({
    nome: obrigatorio,
    cpf,
    cargo: obrigatorio,
    email,
    telefone,
  }),
});

export const cadastroSchema = z.discriminatedUnion('tipo', [pfSchema, pjSchema]);