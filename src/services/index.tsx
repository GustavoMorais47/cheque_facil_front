import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { EPermissaoAcesso } from "../types/enum";
import { IUsuario } from "../types/interfaces";
import React from "react";
import { EXPO_PUBLIC_API_URL } from "@env";

const server = axios.create({
  baseURL: EXPO_PUBLIC_API_URL,
});

interface IDefaultProps {
  setToken: (token: string | null) => void;
  setUsuario: React.Dispatch<React.SetStateAction<IUsuario | null>>;
  expotoken: string | undefined;
}

async function statusDeAutenticacao({
  status,
  props,
  permissoes,
}: {
  status: number;
  props?: IDefaultProps;
  permissoes?: EPermissaoAcesso[];
}) {
  if (props) {
    if (status === 401) {
      props.setToken(null);
      props.setUsuario(null);
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("usuario");
      return;
    }
    if (status === 403) {
      props.setUsuario((usuario) => {
        if (usuario) {
          usuario.permissoes = permissoes || [];
        }
        return usuario;
      });
      return;
    }
  }
}

function tratarErro(error: any, props?: IDefaultProps) {
  if (error.response) {
    const { data, status } = error.response;
    switch (status) {
      case 401:
        statusDeAutenticacao({ status, props });
        return data.mensagem;
      case 403:
        statusDeAutenticacao({ status, props, permissoes: data.permissoes });
        return data.mensagem;
      case 404:
        return data.mensagem || "Recurso não encontrado";
      default:
        return data.mensagem;
    }
  }
  return "Não foi possível conectar ao servidor";
}

async function login(
  cpf: string,
  senha: string,
  deslogar: boolean,
  expotoken: string | undefined
) {
  return new Promise<{ mensagem: string; token: string }>(
    async (resolve, reject) => {
      await server
        .post(
          "/login",
          { cpf, senha, deslogar },
          {
            headers: {
              expotoken,
            },
          }
        )
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => reject(tratarErro(error)));
    }
  );
}

async function registro(
  nome: string,
  cpf: string,
  email: string,
  senha: string,
  expotoken: string | undefined
) {
  return new Promise<string>(async (resolve, reject) => {
    await server
      .post(
        "/registro",
        { nome, cpf, email, senha },
        {
          headers: {
            expotoken,
          },
        }
      )
      .then((response) => {
        resolve(response.data.mensagem);
      })
      .catch((error) => reject(tratarErro(error)));
  });
}

async function get<T, P = any>({
  route,
  props,
  params,
}: {
  route:
    | "/me"
    | "/ping-auth"
    | "/logout"
    | "/"
    | "/acesso/"
    | "/responsavel/"
    | "/banco/"
    | "/conta/"
    | "/cheque/";
  props: IDefaultProps;
  params?: P;
}) {
  return new Promise<T>(async (resolve, reject) => {
    await server
      .get(route, {
        headers: {
          Authorization: "Bearer " + (await AsyncStorage.getItem("token")),
          expotoken: props.expotoken,
        },
        params,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => reject(tratarErro(error, props)));
  });
}

async function post<T, D>({
  route,
  data,
  props,
}: {
  route: "acesso/" | "responsavel/" | "banco/" | "conta/" | "cheque/";
  data: D;
  props: IDefaultProps;
}) {
  return new Promise<T>(async (resolve, reject) => {
    await server
      .post("/" + route, data, {
        headers: {
          Authorization: "Bearer " + (await AsyncStorage.getItem("token")),
          expotoken: props.expotoken,
        },
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => reject(tratarErro(error, props)));
  });
}

async function put<T, D>({
  route,
  id,
  data,
  props,
}: {
  route:
    | "acesso/"
    | "responsavel/"
    | "permissao/"
    | "banco/"
    | "conta/"
    | "cheque/";
  id: number;
  data: D;
  props: IDefaultProps;
}) {
  return new Promise<T>(async (resolve, reject) => {
    await server
      .put("/" + route + id, data, {
        headers: {
          Authorization: "Bearer " + (await AsyncStorage.getItem("token")),
          expotoken: props.expotoken,
        },
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => reject(tratarErro(error, props)));
  });
}

async function del<T>({
  route,
  id,
  props,
}: {
  route: "acesso/" | "responsavel/" | "banco/" | "conta/" | "cheque/";
  id: number;
  props: IDefaultProps;
}) {
  return new Promise<T>(async (resolve, reject) => {
    await server
      .delete("/" + route + id, {
        headers: {
          Authorization: "Bearer " + (await AsyncStorage.getItem("token")),
          expotoken: props.expotoken,
        },
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => reject(tratarErro(error, props)));
  });
}

export default {
  login,
  registro,
  get,
  post,
  put,
  del,
};
