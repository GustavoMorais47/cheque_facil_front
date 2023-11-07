import { createContext, useContext, useEffect, useState } from "react";
import {
  IAcesso,
  IBanco,
  ICheque,
  IContaBancaria,
  IResponsavel,
} from "../types/interfaces";
import services from "../services";
import { AuthContext } from "./auth";
import { showMessage } from "react-native-flash-message";
import moment from "moment";
import permissao from "../utils/permissao";
import { EPermissaoAcesso } from "../types/enum";

type DadosContextType = {
  acessos: IAcesso[];
  getAcessos: () => Promise<void>;
  responsaveis: IResponsavel[];
  getResponsaveis: () => Promise<void>;
  bancos: IBanco[];
  getBancos: () => Promise<void>;
  contas: IContaBancaria[];
  getContasBancarias: () => Promise<void>;
  cheques: ICheque[];
  getCheques: () => Promise<void>;
  datas: {
    inicio: Date;
    fim: Date;
  };
  setDatas: React.Dispatch<
    React.SetStateAction<{
      inicio: Date;
      fim: Date;
    }>
  >;
  filtro: "emissao" | "vencimento";
  setFiltro: React.Dispatch<React.SetStateAction<"emissao" | "vencimento">>;
};

export const DadosContext = createContext<DadosContextType>(null!);

export default function DadosProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { setToken, setUsuario, usuario } = useContext(AuthContext);
  const [acessos, setAcessos] = useState<IAcesso[]>([]);
  const [responsaveis, setResponsaveis] = useState<IResponsavel[]>([]);
  const [bancos, setBancos] = useState<IBanco[]>([]);
  const [contas, setContas] = useState<IContaBancaria[]>([]);
  const [cheques, setCheques] = useState<ICheque[]>([]);
  const [datas, setDatas] = useState<{
    inicio: Date;
    fim: Date;
  }>({
    inicio: moment().toDate(),
    fim: moment().toDate(),
  });
  const [filtro, setFiltro] = useState<"emissao" | "vencimento">("emissao");

  async function getAcessos() {
    await services
      .get<IAcesso[]>({
        route: "/acesso/",
        props: {
          setToken,
          setUsuario,
        },
      })
      .then((response) => {
        setAcessos(response.sort((a, b) => a.nome.localeCompare(b.nome)));
      })
      .catch((error) => {
        setAcessos([]);
        showMessage({
          type: "danger",
          icon: "danger",
          message: "Ops!",
          description: error as string,
        });
      });
  }

  async function getResponsaveis() {
    await services
      .get<IResponsavel[]>({
        route: "/responsavel/",
        props: {
          setToken,
          setUsuario,
        },
      })
      .then((response) => {
        setResponsaveis(response.sort((a, b) => a.nome.localeCompare(b.nome)));
      })
      .catch((error) => {
        setResponsaveis([]);
        showMessage({
          type: "danger",
          icon: "danger",
          message: "Ops!",
          description: error as string,
        });
      });
  }

  async function getBancos() {
    await services
      .get<IBanco[]>({
        route: "/banco/",
        props: {
          setToken,
          setUsuario,
        },
      })
      .then((response) => {
        setBancos(response.sort((a, b) => a.nome.localeCompare(b.nome)));
      })
      .catch((error) => {
        setBancos([]);
        showMessage({
          type: "danger",
          icon: "danger",
          message: "Ops!",
          description: error as string,
        });
      });
  }

  async function getContasBancarias() {
    await services
      .get<IContaBancaria[]>({
        route: "/conta/",
        props: {
          setToken,
          setUsuario,
        },
      })
      .then((res) => {
        setContas(res);
      })
      .catch((error) => {
        setContas([]);
        showMessage({
          type: "danger",
          icon: "danger",
          message: "Ops!",
          description: error as string,
        });
      });
  }

  async function getCheques() {
    await services
      .get<
        ICheque[],
        {
          inicio: Date;
          fim: Date;
          filtro: "emissao" | "vencimento";
        }
      >({
        route: "/cheque/",
        props: {
          setToken,
          setUsuario,
        },
        params: {
          inicio: datas.inicio,
          fim: datas.fim,
          filtro,
        },
      })
      .then((res) => {
        setCheques(res);
      })
      .catch((error) => {
        setCheques([]);
        showMessage({
          type: "danger",
          icon: "danger",
          message: "Ops!",
          description: error as string,
        });
      });
  }

  useEffect(() => {
    (async () => {
      // setExpoToken(await useExpoToken());
    })();
  }, []);

  useEffect(() => {
    getResponsaveis();
    getBancos();
    getContasBancarias();
    permissao.todasPermissoes(
      [EPermissaoAcesso.GERENCIAR_ACESSOS],
      usuario!.permissoes
    ) && getAcessos();
    getCheques();
  }, [datas, filtro]);
  return (
    <DadosContext.Provider
      value={{
        acessos,
        getAcessos,
        responsaveis,
        getResponsaveis,
        bancos,
        getBancos,
        contas,
        getContasBancarias,
        cheques,
        getCheques,
        datas,
        setDatas,
        filtro,
        setFiltro,
      }}
    >
      {children}
    </DadosContext.Provider>
  );
}
