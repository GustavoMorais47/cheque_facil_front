import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { OpcoesRoutesList } from "../../../routes/opcoes.routes";
import { useContext, useEffect, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
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

export default function GerenciarAcessosCriarEditar() {
  const navigation = useNavigation<NavigationProp<OpcoesRoutesList>>();
  const { params } =
    useRoute<RouteProp<OpcoesRoutesList, "GerenciarAcessosAddEdit">>();
  const { setToken, setUsuario } = useContext(AuthContext);
  const { responsaveis, getAcessos } = useContext(DadosContext);

  const [nome, setNome] = useState<string>("");
  const [cpf, setCpf] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [responsavel, setResponsavel] = useState<IResponsavel | undefined>();
  const [status, setStatus] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);

  async function cadastrar() {
    if (
      nome.trim().length < 3 ||
      cpf.trim().length < 11 ||
      email.trim().length < 3
    ) {
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
          cpf: string;
          email: string;
          id_responsavel?: number;
        }
      >({
        route: "acesso/",
        data: {
          nome,
          cpf,
          email,
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
        setEmail("");
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
    if (
      nome.trim().length < 3 ||
      cpf.trim().length < 11 ||
      email.trim().length < 3
    ) {
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
    params.acesso &&
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
          route: "acesso/",
          id: params.acesso.id,
          data: {
            nome,
            email,
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
    params.acesso && navigation.setOptions({ title: "Editar Acesso" });
    params.acesso && setNome(params.acesso.nome);
    params.acesso && setCpf(params.acesso.cpf);
    params.acesso && setEmail(params.acesso.email);
    params.acesso && setStatus(params.acesso.status);
    params.acesso &&
      setResponsavel(
        responsaveis.filter((r) => r.id === params.acesso?.id_responsavel)[0]
      );
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
          <Input
            disabled={loading}
            title="E-mail"
            text={email}
            onChangeText={setEmail}
            placeholder="Informe o e-mail do usuário"
            keyboardType="email-address"
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
      <Card titulo="Responsável" subTitulo="Vincule um responsável ao acesso">
        {responsaveis.length === 0 ? (
          <Text>Nenhum responsável cadastrado</Text>
        ) : (
          <View
            style={{
              flexWrap: "wrap",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            {responsaveis.map((resp) => (
              <TouchableOpacity
                key={resp.id}
                onPress={() =>
                  responsavel?.id !== resp.id
                    ? setResponsavel(resp)
                    : setResponsavel(undefined)
                }
                style={{
                  padding: 10,
                  backgroundColor:
                    resp.id === responsavel?.id ? "#399b53" : "#f5f5f5",
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    color: resp.id === responsavel?.id ? "white" : "black",
                    fontWeight: resp.id === responsavel?.id ? "bold" : "normal",
                  }}
                >
                  {resp.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>
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
