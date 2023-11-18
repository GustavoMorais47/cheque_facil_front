import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { OpcoesRoutesList } from "../../../routes/opcoes.routes";
import { useContext, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import Card from "../../../components/card";
import Button from "../../../components/button";
import { DadosContext } from "../../../contexts/dados";
import CheckBox from "../../../components/checkBox";
import Input from "../../../components/input";
import { showMessage } from "react-native-flash-message";
import services from "../../../services";
import { AuthContext } from "../../../contexts/auth";
import { EPermissaoAcesso } from "../../../types/enum";

export default function GerenciarPermissoesCriarEditar() {
  const navigation = useNavigation<NavigationProp<OpcoesRoutesList>>();
  const { params } =
    useRoute<RouteProp<OpcoesRoutesList, "GerenciarPermissoesAddEdit">>();
  const { setToken, setUsuario } = useContext(AuthContext);
  const { getAcessos } = useContext(DadosContext);

  const [nome, setNome] = useState<string>(params.acesso.nome);
  const [email, setEmail] = useState<string>(params.acesso.email);
  const [gerenciarAcessos, setGerenciarAcessos] = useState<boolean>(
    params.acesso.permissoes.includes(EPermissaoAcesso.GERENCIAR_ACESSOS)
  );
  const [gerenciarPermissoes, setGerenciarPermissoes] = useState<boolean>(
    params.acesso.permissoes.includes(EPermissaoAcesso.GERENCIAR_PERMISSOES)
  );
  const [gerenciarResponsaveis, setGerenciarResponsaveis] = useState<boolean>(
    params.acesso.permissoes.includes(EPermissaoAcesso.GERENCIAR_RESPONSAVEIS)
  );
  const [gerenciarBancos, setGerenciarBancos] = useState<boolean>(
    params.acesso.permissoes.includes(EPermissaoAcesso.GERENCIAR_BANCOS)
  );
  const [gerenciarContasBancarias, setGerenciarContasBancarias] =
    useState<boolean>(
      params.acesso.permissoes.includes(
        EPermissaoAcesso.GERENCIAR_CONTAS_BANCARIAS
      )
    );
  const [gerenciarCheques, setGerenciarCheques] = useState<boolean>(
    params.acesso.permissoes.includes(EPermissaoAcesso.GERENCIAR_CHEQUES)
  );
  const [gerenciarDatasBloqueadas, setGerenciarDatasBloqueadas] =
    useState<boolean>(
      params.acesso.permissoes.includes(
        EPermissaoAcesso.GERENCIAR_DATAS_BLOQUEADAS
      )
    );
  const [visualizacaoTotal, setVisualizacaoTotal] = useState<boolean>(
    params.acesso.permissoes.includes(EPermissaoAcesso.VISUALIZACAO_TOTAL)
  );
  const [permissoesAcesso, setPermissoesAcesso] = useState<EPermissaoAcesso[]>(
    params.acesso.permissoes
  );

  const [loading, setLoading] = useState<boolean>(false);

  const permissoes = [
    {
      label: "Gerenciar Acessos",
      value: gerenciarAcessos,
      setValue: setGerenciarAcessos,
    },
    {
      label: "Gerenciar Permissões",
      value: gerenciarPermissoes,
      setValue: setGerenciarPermissoes,
    },
    {
      label: "Gerenciar Responsáveis",
      value: gerenciarResponsaveis,
      setValue: setGerenciarResponsaveis,
    },
    {
      label: "Gerenciar Bancos",
      value: gerenciarBancos,
      setValue: setGerenciarBancos,
    },
    {
      label: "Gerenciar Contas Bancárias",
      value: gerenciarContasBancarias,
      setValue: setGerenciarContasBancarias,
    },
    {
      label: "Gerenciar Cheques",
      value: gerenciarCheques,
      setValue: setGerenciarCheques,
    },
    {
      label: "Gerenciar Datas Bloqueadas",
      value: gerenciarDatasBloqueadas,
      setValue: setGerenciarDatasBloqueadas,
    },
    {
      label: "Visualização Total",
      value: visualizacaoTotal,
      setValue: setVisualizacaoTotal,
    },
  ];

  async function atualizar() {
    setLoading(true);
    await services
      .put<
        { mensagem: string },
        {
          permissoes: EPermissaoAcesso[];
        }
      >({
        route: "permissao/",
        id: params.acesso.id,
        data: {
          permissoes: permissoesAcesso,
        },
        props: {
          setToken,
          setUsuario,
        },
      })
      .then(async (response) => {
        showMessage({
          type: "success",
          icon: "success",
          message: "Sucesso",
          description: response.mensagem,
        });
        await getAcessos().finally(() => {
          navigation.goBack();
        });
      })
      .catch((error) => {
        showMessage({
          type: "danger",
          icon: "danger",
          message: "Ops!",
          description: error as string,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    if (gerenciarAcessos) {
      setPermissoesAcesso([
        ...permissoesAcesso,
        EPermissaoAcesso.GERENCIAR_ACESSOS,
      ]);
    } else {
      setPermissoesAcesso(
        permissoesAcesso.filter(
          (permissao) => permissao !== EPermissaoAcesso.GERENCIAR_ACESSOS
        )
      );
    }
  }, [gerenciarAcessos]);

  useEffect(() => {
    if (gerenciarPermissoes) {
      setPermissoesAcesso([
        ...permissoesAcesso,
        EPermissaoAcesso.GERENCIAR_PERMISSOES,
      ]);
    } else {
      setPermissoesAcesso(
        permissoesAcesso.filter(
          (permissao) => permissao !== EPermissaoAcesso.GERENCIAR_PERMISSOES
        )
      );
    }
  }, [gerenciarPermissoes]);

  useEffect(() => {
    if (gerenciarResponsaveis) {
      setPermissoesAcesso([
        ...permissoesAcesso,
        EPermissaoAcesso.GERENCIAR_RESPONSAVEIS,
      ]);
    } else {
      setPermissoesAcesso(
        permissoesAcesso.filter(
          (permissao) => permissao !== EPermissaoAcesso.GERENCIAR_RESPONSAVEIS
        )
      );
    }
  }, [gerenciarResponsaveis]);

  useEffect(() => {
    if (gerenciarBancos) {
      setPermissoesAcesso([
        ...permissoesAcesso,
        EPermissaoAcesso.GERENCIAR_BANCOS,
      ]);
    } else {
      setPermissoesAcesso(
        permissoesAcesso.filter(
          (permissao) => permissao !== EPermissaoAcesso.GERENCIAR_BANCOS
        )
      );
    }
  }, [gerenciarBancos]);

  useEffect(() => {
    if (gerenciarContasBancarias) {
      setPermissoesAcesso([
        ...permissoesAcesso,
        EPermissaoAcesso.GERENCIAR_CONTAS_BANCARIAS,
      ]);
    } else {
      setPermissoesAcesso(
        permissoesAcesso.filter(
          (permissao) =>
            permissao !== EPermissaoAcesso.GERENCIAR_CONTAS_BANCARIAS
        )
      );
    }
  }, [gerenciarContasBancarias]);

  useEffect(() => {
    if (gerenciarCheques) {
      setPermissoesAcesso([
        ...permissoesAcesso,
        EPermissaoAcesso.GERENCIAR_CHEQUES,
      ]);
    } else {
      setPermissoesAcesso(
        permissoesAcesso.filter(
          (permissao) => permissao !== EPermissaoAcesso.GERENCIAR_CHEQUES
        )
      );
    }
  }, [gerenciarCheques]);

  useEffect(() => {
    if (gerenciarDatasBloqueadas) {
      setPermissoesAcesso([
        ...permissoesAcesso,
        EPermissaoAcesso.GERENCIAR_DATAS_BLOQUEADAS,
      ]);
    } else {
      setPermissoesAcesso(
        permissoesAcesso.filter(
          (permissao) =>
            permissao !== EPermissaoAcesso.GERENCIAR_DATAS_BLOQUEADAS
        )
      );
    }
  }, [gerenciarDatasBloqueadas]);

  useEffect(() => {
    if (visualizacaoTotal) {
      setPermissoesAcesso([
        ...permissoesAcesso,
        EPermissaoAcesso.VISUALIZACAO_TOTAL,
      ]);
    } else {
      setPermissoesAcesso(
        permissoesAcesso.filter(
          (permissao) => permissao !== EPermissaoAcesso.VISUALIZACAO_TOTAL
        )
      );
    }
  }, [visualizacaoTotal]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, gap: 10 }}
    >
      <Card titulo="Dados" subTitulo="Dados do acesso">
        <View style={{ gap: 10 }}>
          <Input
            disabled={true}
            title="Nome"
            text={nome}
            onChangeText={(text) => setNome(text.replace(/[^a-zA-Z ]/g, ""))}
            placeholder="Informe o nome do usuário"
          />
          <Input
            disabled={true}
            title="E-mail"
            text={email}
            onChangeText={setEmail}
            placeholder="Informe o e-mail do usuário"
          />
        </View>
      </Card>
      <Card
        titulo="Permissões"
        subTitulo="Selecione as permissões que o usuário terá acesso"
      >
        <View style={{ gap: 10 }}>
          {permissoes
            .sort((a, b) => {
              if (a.label < b.label) return -1;
              if (a.label > b.label) return 1;
              return 0;
            })
            .map((permissao) => (
              <CheckBox
                key={permissao.label}
                disabled={loading}
                label={permissao.label}
                checked={permissao.value}
                setChecked={permissao.setValue}
              />
            ))}
        </View>
      </Card>
      <View style={{ gap: 10 }}>
        <Button loading={loading} titulo={"Salvar"} onPress={atualizar} />
        <Button
          titulo={"Cancelar"}
          onPress={navigation.goBack}
          type="secondary"
        />
      </View>
    </ScrollView>
  );
}
