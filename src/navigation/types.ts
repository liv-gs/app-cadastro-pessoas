import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Lista: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  PessoaFisicaForm: { cadastroId?: string } | undefined;
  PessoaJuridicaForm: { cadastroId?: string } | undefined;
  Documentos: { cadastroId: string };
  DetalheCadastro: { cadastroId: string };
};