import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';  //id unico
import type { Cadastro, Documento } from '../types/cadastro';

const KEY = '@cadastros';  //constante pra indentificar onde os cadastros estao armazenados, poder usar em varios lugares no codigo 

export const novoId = () => Crypto.randomUUID(); //permitir que cada registro tenha uma indetificação propria

export async function listarCadastros(): Promise<Cadastro[]> {  //recupera cadastros armazenados
  const raw = await AsyncStorage.getItem(KEY);      // retorna um arrey de cadastro
  return raw ? JSON.parse(raw) : [];
}

async function gravar(lista: Cadastro[]) { //salvar a lista no AsyncStorage
  await AsyncStorage.setItem(KEY, JSON.stringify(lista));  // Transforma o array de objetos em texto JSON, que é o formato utilizado para armazenar os dados.
}   //(setitem) Salva esse texto na chave @cadastros.

export async function buscarCadastro(id: string) { //funçao que procura cadastro especifico pelo id
  const lista = await listarCadastros();
  return lista.find((c) => c.id === id);
}

export async function salvarCadastro(cadastro: Cadastro) {  //Ela serve tanto para cadastrar uma pessoa nova quanto para editar uma pessoa que já existe.
  const lista = await listarCadastros();  
  const idx = lista.findIndex((c) => c.id === cadastro.id); // (findIndex)procura id se ja existe 
  if (idx >= 0) lista[idx] = cadastro;
  else lista.push(cadastro);
  await gravar(lista);
}

export async function removerCadastro(id: string) { // exclui o cadastro pelo id
  const lista = await listarCadastros();
  await gravar(lista.filter((c) => c.id !== id));  // retorna somente a lista tirando o id do excluido  

}

export async function salvarDocumento(cadastroId: string, doc: Documento) {  //Essa função salva um documento dentro de um cadastro específico.
  const lista = await listarCadastros();                                      // Localiza o cadastro, Procura o cadastro que receberá o documento.
  const cadastro = lista.find((c) => c.id === cadastroId);                    //
  if (!cadastro) return;                                                       //
  cadastro.documentos = [...cadastro.documentos.filter((d) => d.tipo !== doc.tipo), doc];
  await gravar(lista);
}

export async function removerDocumento(cadastroId: string, docId: string) { // encontra o cadastro.
  const lista = await listarCadastros();                             //Depois, utiliza o .filter() para manter somente os documentos cujo ID seja diferente do documento que queremos excluir.
  const cadastro = lista.find((c) => c.id === cadastroId);           //Por último, grava a lista atualizada.
  if (!cadastro) return;
  cadastro.documentos = cadastro.documentos.filter((d) => d.id !== docId);
  await gravar(lista);
}