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
import Input from "../../../components/input";
import { showMessage } from "react-native-flash-message";
import services from "../../../services";
import { AuthContext } from "../../../contexts/auth";

export default function GerenciarBancosCriarEditar() {
  const navigation = useNavigation<NavigationProp<OpcoesRoutesList>>();
  const { params } =
    useRoute<RouteProp<OpcoesRoutesList, "GerenciarBancosAddEdit">>();
  const { setToken, setUsuario } = useContext(AuthContext);
  const { getBancos } = useContext(DadosContext);

  const [codigo, setCodigo] = useState<string>("");
  const [nome, setNome] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  async function cadastrar() {
    setLoading(true);
    await services
      .post<
        { mensagem: string },
        {
          nome: string;
          codigo: string;
        }
      >({
        route: "banco/",
        data: {
          codigo,
          nome,
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
        setNome("");
        setCodigo("");
        await getBancos().finally(() => {
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
    if (nome.trim().length < 3 || codigo.trim().length < 3) {
      showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção",
        description: "Preencha todos os campos para continuar",
      });
      return;
    }

    setLoading(true);
    params.banco &&
      (await services
        .put<
          { mensagem: string },
          {
            nome: string;
            codigo: string;
          }
        >({
          route: "banco/",
          id: params.banco.id,
          data: {
            nome,
            codigo,
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
          await getBancos().finally(() => {
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
    params.banco && navigation.setOptions({ title: "Editar Banco" });
    params.banco && setNome(params.banco.nome);
    params.banco && setCodigo(params.banco.codigo);
  }, []);
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, gap: 10 }}
    >
      <Card titulo="Dados" subTitulo="Informe os dados do banco">
        <View style={{ gap: 10 }}>
        <Input
            disabled={loading || params.banco !== undefined}
            title="Código"
            text={codigo}
            onChangeText={(text) => setCodigo(text.replace(/[^0-9]/g, ""))}
            placeholder="Informe o código do banco"
            keyboardType="numeric"
            maxLength={3}
          />
          <Input
            disabled={loading}
            title="Nome"
            text={nome}
            onChangeText={setNome}
            placeholder="Informe o nome do usuário"
          />          
        </View>
      </Card>
      <View style={{ gap: 10 }}>
        <Button
          loading={loading}
          titulo={params.banco ? "Salvar" : "Cadastrar"}
          onPress={params.banco ? atualizar : cadastrar}
        />
        <Button
          titulo={params.banco ? "Cancelar" : "Voltar"}
          onPress={navigation.goBack}
          type="secondary"
        />
      </View>
    </ScrollView>
  );
}
