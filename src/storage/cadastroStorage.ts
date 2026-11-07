import { API_URL, API_KEY } from '../config';
import type { Cadastro, Documento, PessoaFisica, PessoaJuridica } from '../types/cadastro';
import * as FileSystem from 'expo-file-system/legacy';
export type EntradaPF = Omit<PessoaFisica, 'id' | 'documentos' | 'criadoEm'>;
export type EntradaPJ = Omit<PessoaJuridica, 'id' | 'documentos' | 'criadoEm'>;
export type Entrada = EntradaPF | EntradaPJ;

// O Render gratuito pode levar cerca de 1 minuto para "acordar"
const TIMEOUT = 75_000;
const TIMEOUT_UPLOAD = 90_000;

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function req<T>(path: string, options: RequestInit = {}, timeoutMs = TIMEOUT): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = {
      'x-api-key': API_KEY,
      ...((options.headers as Record<string, string>) ?? {}),
    };
    // Em FormData o fetch define o Content-Type (com boundary) sozinho
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_URL}${path}`, { ...options, headers, signal: controller.signal });

    if (!res.ok) {
      let msg = 'Erro ao comunicar com o servidor.';
      if (res.status === 401) msg = 'Acesso não autorizado ao servidor.';
      else if (res.status === 400) msg = 'Dados inválidos. Confira os campos e tente novamente.';
      else {
        try {
          const json = await res.json();
          if (json?.erro) msg = json.erro;
        } catch {}
      }
      throw new ApiError(msg, res.status);
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (e: any) {
    if (typeof e?.status === 'number') throw e;
    if (e?.name === 'AbortError') {
      throw new ApiError('O servidor demorou para responder. Tente novamente em instantes.', 0);
    }
    throw new ApiError('Não foi possível conectar ao servidor. Verifique sua internet.', 0);
  } finally {
    clearTimeout(timer);
  }
}

// O servidor devolve a uri do arquivo relativa (/uploads/xxx): deixamos absoluta
function normalizar(c: Cadastro): Cadastro {
  return {
    ...c,
    documentos: c.documentos.map((d) => ({
      ...d,
      uri: d.uri.startsWith('http') ? d.uri : `${API_URL}${d.uri}`,
    })),
  };
}

// Chamada leve para "acordar" o servidor ao abrir o app
export function acordarServidor() {
  fetch(`${API_URL}/saude`).catch(() => {});
}

export async function listarCadastros(): Promise<Cadastro[]> {
  const lista = await req<Cadastro[]>('/cadastros');
  return lista.map(normalizar);
}

export async function buscarCadastro(id: string): Promise<Cadastro | undefined> {
  try {
    return normalizar(await req<Cadastro>(`/cadastros/${id}`));
  } catch (e: any) {
    if (e?.status === 404) return undefined;
    throw e;
  }
}

// Sem id: cria (POST). Com id: atualiza (PUT). Devolve o cadastro salvo.
export async function salvarCadastro(dados: Entrada, id?: string): Promise<Cadastro> {
  const salvo = await req<Cadastro>(id ? `/cadastros/${id}` : '/cadastros', {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(dados),
  });
  return normalizar(salvo);
}

export async function removerCadastro(id: string): Promise<void> {
  await req<void>(`/cadastros/${id}`, { method: 'DELETE' });
}

function descobrirMime(nome: string, mime?: string) {
  if (mime && mime !== 'application/octet-stream') return mime;
  const ext = nome.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'webp') return 'image/webp';
  return 'application/octet-stream';
}

export async function enviarDocumento(
  cadastroId: string,
  arquivo: { tipo: string; nome: string; uri: string; mimeType?: string }
): Promise<Documento> {
  let resposta: FileSystem.FileSystemUploadResult;

  try {
    resposta = await FileSystem.uploadAsync(
      `${API_URL}/cadastros/${cadastroId}/documentos`,
      arquivo.uri,
      {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'arquivo',
        mimeType: descobrirMime(arquivo.nome, arquivo.mimeType),
        parameters: { tipo: arquivo.tipo, nome: arquivo.nome },
        headers: { 'x-api-key': API_KEY },
      }
    );
  } catch (e: any) {
    console.log('Falha no upload:', e?.message);
    throw new ApiError(
      'Não foi possível enviar o arquivo. Verifique sua internet e tente novamente.',
      0
    );
  }

  if (resposta.status === 401) throw new ApiError('Acesso não autorizado ao servidor.', 401);
  if (resposta.status === 404) throw new ApiError('Cadastro não encontrado.', 404);
    if (resposta.status < 200 || resposta.status >= 300) {
    console.log('Upload recusado:', resposta.status, resposta.body);
  }

  const doc = JSON.parse(resposta.body) as Documento;
  return { ...doc, uri: `${API_URL}${doc.uri}` };
}

export async function removerDocumento(cadastroId: string, docId: string): Promise<void> {
  await req<void>(`/cadastros/${cadastroId}/documentos/${docId}`, { method: 'DELETE' });
}