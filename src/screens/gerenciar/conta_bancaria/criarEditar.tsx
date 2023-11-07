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
import { IBanco } from "../../../types/interfaces";
import CheckBox from "../../../components/checkBox";
import Input from "../../../components/input";
import { showMessage } from "react-native-flash-message";
import services from "../../../services";
import { AuthContext } from "../../../contexts/auth";

export default function GerenciarContasBancariasCriarEditar() {
  const navigation = useNavigation<NavigationProp<OpcoesRoutesList>>();
  const { params } =
    useRoute<RouteProp<OpcoesRoutesList, "GerenciarContasBancariasAddEdit">>();
  const { setToken, setUsuario } = useContext(AuthContext);
  const { bancos, expotoken, getContasBancarias } = useContext(DadosContext);

  const [agencia, setAgencia] = useState<string>("");
  const [conta, setConta] = useState<string>("");
  const [banco, setBanco] = useState<IBanco | undefined>();
  const [status, setStatus] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);

  async function cadastrar() {
    if (agencia.trim().length === 0) {
      showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção!",
        description: "Informe a agência",
      });
      return;
    }

    if (conta.trim().length === 0) {
      showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção!",
        description: "Informe a conta",
      });
      return;
    }

    if (!banco) {
      showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção!",
        description: "Selecione um banco",
      });
      return;
    }

    setLoading(true);
    await services
      .post<
        { mensagem: string },
        {
          id_banco: number;
          agencia: string;
          numero: string;
        }
      >({
        route: "conta/",
        data: {
          id_banco: banco.id,
          agencia,
          numero: conta,
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
        setAgencia("");
        setConta("");
        setStatus(true);
        setBanco(undefined);
        await getContasBancarias().finally(() => {
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
    if (agencia.trim().length === 0) {
      showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção!",
        description: "Informe a agência",
      });
      return;
    }

    if (conta.trim().length === 0) {
      showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção!",
        description: "Informe a conta",
      });
      return;
    }

    if (!banco) {
      showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção!",
        description: "Selecione um banco",
      });
      return;
    }

    setLoading(true);
    params.conta &&
      (await services
        .put<
          { mensagem: string },
          {
            id_banco: number;
            agencia: string;
            numero: string;
            status: boolean;
          }
        >({
          route: "conta/",
          id: params.conta.id,
          data: {
            id_banco: banco.id,
            agencia,
            numero: conta,
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
          await getContasBancarias().finally(() => {
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
    params.conta && navigation.setOptions({ title: "Editar conta" });
    params.conta && setAgencia(params.conta.agencia);
    params.conta && setConta(params.conta.conta);
    params.conta &&
      setBanco(
        bancos[bancos.findIndex((bnc) => bnc.id === params.conta!.id_banco)]
      );
    params.conta && setStatus(params.conta.status);
  }, []);
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, gap: 10 }}
    >
      <Card titulo="Dados" subTitulo="Informe os dados da conta">
        <View style={{ gap: 10 }}>
          <Input
            disabled={loading}
            title="Agência"
            text={agencia}
            onChangeText={(text) => setAgencia(text.replace(/[^0-9]/g, ""))}
            placeholder="Informe a agência da conta"
            keyboardType="numeric"
          />
          <Input
            disabled={loading || params.conta !== undefined}
            title="Conta"
            text={conta}
            onChangeText={(text) => setConta(text.replace(/[^0-9]/g, ""))}
            placeholder="Informe o número da conta"
            keyboardType="numeric"
          />
          {params.conta && (
            <CheckBox
              disabled={loading}
              label="Ativar"
              checked={status}
              setChecked={setStatus}
            />
          )}
        </View>
      </Card>
      <Card titulo="Banco" subTitulo="Vincule sua conta a um banco">
        {bancos.length === 0 ? (
          <Text>Nenhum banco cadastrado</Text>
        ) : (
          <View
            style={{
              flexWrap: "wrap",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            {bancos.map((bnc) => (
              <TouchableOpacity
                key={bnc.id}
                onPress={() =>
                  banco?.id !== bnc.id ? setBanco(bnc) : setBanco(undefined)
                }
                style={{
                  padding: 10,
                  backgroundColor: bnc.id === banco?.id ? "#399b53" : "#f5f5f5",
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    color: bnc.id === banco?.id ? "white" : "black",
                    fontWeight: bnc.id === banco?.id ? "bold" : "normal",
                  }}
                >
                  {bnc.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>
      <View style={{ gap: 10 }}>
        <Button
          loading={loading}
          titulo={params.conta ? "Salvar" : "Cadastrar"}
          onPress={params.conta ? atualizar : cadastrar}
        />
        <Button
          loading={loading}
          titulo={params.conta ? "Cancelar" : "Voltar"}
          onPress={navigation.goBack}
          type="secondary"
        />
      </View>
    </ScrollView>
  );
}
