import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { OpcoesRoutesList } from "../../../routes/opcoes.routes";
import { useContext, useEffect, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import Card from "../../../components/card";
import Button from "../../../components/button";
import { DadosContext } from "../../../contexts/dados";
import { IResponsavel } from "../../../types/interfaces";
import CheckBox from "../../../components/checkBox";
import Input from "../../../components/input";
import mascaraCPF from "../../../utils/mascaraCPF";
import { showMessage } from "react-native-flash-message";
import services from "../../../services";
import { AuthContext } from "../../../contexts/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Switch from "../../../components/switch";

export default function GerenciarAcessosCriarEditar() {
  const navigation = useNavigation<NavigationProp<OpcoesRoutesList>>();
  const { params } =
    useRoute<RouteProp<OpcoesRoutesList, "GerenciarAcessosAddEdit">>();
  const { setToken, setUsuario } = useContext(AuthContext);
  const { responsaveis, getAcessos } = useContext(DadosContext);

  const [nome, setNome] = useState<string>("");
  const [cpf, setCpf] = useState<string>("");
  const [responsavel, setResponsavel] = useState<IResponsavel | undefined>();
  const [status, setStatus] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);

  async function cadastrar() {
    if (nome.trim().length < 3 || cpf.trim().length < 11) {
      showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção",
        description: "Preencha todos os campos para continuar",
      });
      return;
    }

    if (cpf.length !== 11) {
      showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção",
        description: "Informe um CPF válido",
      });
      return;
    }

    setLoading(true);
    await services
      .post<
        { mensagem: string },
        {
          nome: string;
          cpf: string;
          id_responsavel?: number;
        }
      >({
        route: "acesso/",
        data: {
          nome,
          cpf,
          id_responsavel: responsavel ? responsavel.id : undefined,
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
        setCpf("");
        setStatus(true);
        setResponsavel(undefined);
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

  async function atualizar() {
    if (nome.trim().length < 3 || cpf.trim().length < 11) {
      showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção",
        description: "Preencha todos os campos para continuar",
      });
      return;
    }

    setLoading(true);
    params.acesso &&
      (await services
        .put<
          { mensagem: string },
          {
            nome: string;
            status: boolean;
            id_responsavel?: number;
          }
        >({
          route: "acesso/",
          id: params.acesso.id,
          data: {
            nome,
            status,
            id_responsavel: responsavel ? responsavel.id : undefined,
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
        }));
  }

  useEffect(() => {
    if (params.acesso) {
      navigation.setOptions({
        title: "Editar Acesso",
        headerRight: () => (
          <TouchableOpacity
            disabled={loading}
            onPress={() =>
              Alert.alert(
                "Atenção",
                "Você deseja resetar a senha do usuário?",
                [
                  {
                    text: "Não",
                    style: "default",
                  },
                  {
                    text: "Sim",
                    onPress: async () => {
                      Alert.alert(
                        "Atenção",
                        `A senha do usuário ${
                          params.acesso!.nome
                        } foi resetada com sucesso! A nova senha é os primeiros 9 dígitos do CPF do usuário.`
                      );
                    },
                  },
                ],
                { cancelable: false }
              )
            }
            style={{
              padding: 5,
              paddingRight: 0,
            }}
          >
            <MaterialCommunityIcons
              name="lock-reset"
              size={24}
              color="#399b53"
            />
          </TouchableOpacity>
        ),
      });
      setNome(params.acesso.nome);
      setCpf(params.acesso.cpf);
      setStatus(params.acesso.status);
      setResponsavel(
        responsaveis.filter((r) => r.id === params.acesso?.id_responsavel)[0]
      );
    }
  }, []);
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, gap: 10 }}
    >
      <Card titulo="Dados" subTitulo="Informe os dados do acesso">
        <View style={{ gap: 10 }}>
          <Input
            disabled={loading}
            title="Nome"
            text={nome}
            onChangeText={(text) => setNome(text.replace(/[^a-zA-Z ]/g, ""))}
            placeholder="Informe o nome do usuário"
          />
          <Input
            disabled={loading || params.acesso !== undefined}
            title="CPF"
            text={mascaraCPF(cpf)}
            onChangeText={(text) => setCpf(text.replace(/[^0-9]/g, ""))}
            placeholder="Informe o CPF do usuário"
            keyboardType="numeric"
          />
          {!params.acesso && (
            <Text
              style={{
                fontWeight: "bold",
                color: "#399b53",
                fontSize: 12,
                textAlign: "center",
              }}
            >
              Atenção:{" "}
              <Text
                style={{
                  fontWeight: "300",
                  color: "#666",
                }}
              >
                A senha será os primeiros 9 dígitos do CPF do usuário
              </Text>
            </Text>
          )}
          {params.acesso && (
            <CheckBox
              disabled={loading}
              label="Liberar acesso"
              checked={status}
              setChecked={setStatus}
            />
          )}
        </View>
      </Card>
      <Switch
        titulo="Responsável"
        subTitulo="Vincule um responsável ao acesso"
        disabled={loading}
        desmarcar
        opcoes={responsaveis.map((r) => ({ label: r.nome, value: r.id }))}
        selecionado={responsaveis.findIndex((r) => r.id === responsavel?.id)}
        setSelecionado={(index) => {
          if (index !== null) {
            setResponsavel(responsaveis[index]);
            !params.acesso && setNome(responsaveis[index].nome);
          } else {
            setResponsavel(undefined);
            !params.acesso && setNome("");
          }
        }}
      />
      <View style={{ gap: 10 }}>
        <Button
          loading={loading}
          titulo={params.acesso ? "Salvar" : "Cadastrar"}
          onPress={params.acesso ? atualizar : cadastrar}
        />
        <Button
          titulo={params.acesso ? "Cancelar" : "Voltar"}
          onPress={navigation.goBack}
          type="secondary"
        />
      </View>
    </ScrollView>
  );
}
