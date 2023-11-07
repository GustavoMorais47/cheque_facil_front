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

export default function GerenciarResponsaveisCriarEditar() {
  const navigation = useNavigation<NavigationProp<OpcoesRoutesList>>();
  const { params } =
    useRoute<RouteProp<OpcoesRoutesList, "GerenciarResponsaveisAddEdit">>();
  const { setToken, setUsuario } = useContext(AuthContext);
  const { expotoken, getResponsaveis } = useContext(DadosContext);

  const [nome, setNome] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);

  async function cadastrar() {
    if (nome.trim().length < 3 || email.trim().length < 3) {
      showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção",
        description: "Preencha todos os campos para continuar",
      });
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção",
        description: "Informe um e-mail válido",
      });
      return;
    }

    setLoading(true);
    await services
      .post<
        { mensagem: string },
        {
          nome: string;
          email: string;
        }
      >({
        route: "responsavel/",
        data: {
          nome,
          email,
        },
        props: {
          expotoken,
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
        setNome("");
        setEmail("");
        setStatus(true);
        await getResponsaveis().finally(() => {
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

  async function atualizar() {
    if (nome.trim().length < 3 || email.trim().length < 3) {
      showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção",
        description: "Preencha todos os campos para continuar",
      });
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção",
        description: "Informe um e-mail válido",
      });
      return;
    }

    if (!expotoken) {
      showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção",
        description:
          "Não foi possível identificar o token do dispositivo. Aguade alguns segundos e tente novamente",
      });
      return;
    }

    setLoading(true);
    params.responsavel &&
      (await services
        .put<
          { mensagem: string },
          {
            nome: string;
            email: string;
            status: boolean;
            id_responsavel?: number;
          }
        >({
          route: "responsavel/",
          id: params.responsavel.id,
          data: {
            nome,
            email,
            status,
          },
          props: {
            expotoken,
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
          await getResponsaveis().finally(() => {
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
        }));
  }

  useEffect(() => {
    params.responsavel &&
      navigation.setOptions({ title: "Editar Responsável" });
    params.responsavel && setNome(params.responsavel.nome);
    params.responsavel && setEmail(params.responsavel.email || "");
    params.responsavel && setStatus(params.responsavel.status);
  }, []);
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, gap: 10 }}
    >
      <Card titulo="Dados" subTitulo="Informe os dados do responsavel">
        <View style={{ gap: 10 }}>
          <Input
            disabled={loading}
            title="Nome"
            text={nome}
            onChangeText={(text) => setNome(text.replace(/[^a-zA-Z ]/g, ""))}
            placeholder="Informe o nome do usuário"
          />
          <Input
            disabled={loading}
            title="E-mail"
            text={email}
            onChangeText={setEmail}
            placeholder="Informe o e-mail do usuário"
            keyboardType="email-address"
          />
          {params.responsavel && (
            <CheckBox
              disabled={loading}
              label="Ativo"
              checked={status}
              setChecked={setStatus}
            />
          )}
        </View>
      </Card>
      <View style={{ gap: 10 }}>
        <Button
          loading={loading}
          titulo={params.responsavel ? "Salvar" : "Cadastrar"}
          onPress={params.responsavel ? atualizar : cadastrar}
        />
        <Button
          loading={loading}
          titulo={params.responsavel ? "Cancelar" : "Voltar"}
          onPress={navigation.goBack}
          type="secondary"
        />
      </View>
    </ScrollView>
  );
}
