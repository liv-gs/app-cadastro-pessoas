export type TipoPessoa = 'PF' | 'PJ';

export interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface Documento {
  id: string;
  tipo: string;
  nome: string;
  uri: string;
  mimeType?: string;
}

export interface RepresentanteLegal {
  nome: string;
  cpf: string;
  cargo: string;
  email: string;
  telefone: string;
}

//em comum
interface CadastroBase {
  id: string;
  email: string;
  telefone: string;
  endereco: Endereco;
  documentos: Documento[];
  criadoEm: string;
}

export interface PessoaFisica extends CadastroBase {
  tipo: 'PF';
  nome: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
}

export interface PessoaJuridica extends CadastroBase {
  tipo: 'PJ';
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  dataAbertura: string;
  representante: RepresentanteLegal;
}

export type Cadastro = PessoaFisica | PessoaJuridica;

export const DOCUMENTOS_EXIGIDOS: Record<TipoPessoa, string[]> = {
  PF: ['RG ou CNH (frente)', 'RG ou CNH (verso)', 'Comprovante de residência'],
  PJ: [
    'Cartão CNPJ',
    'Contrato social',
    'Documento do representante legal',
    'Comprovante de endereço',
  ],
};

export const nomeDe = (c: Cadastro) => (c.tipo === 'PF' ? c.nome : c.razaoSocial);
export const docDe = (c: Cadastro) => (c.tipo === 'PF' ? c.cpf : c.cnpj);