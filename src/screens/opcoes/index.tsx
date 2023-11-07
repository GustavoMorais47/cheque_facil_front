import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../components/button";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showMessage } from "react-native-flash-message";
import Card from "../../components/card";
import { EPermissaoAcesso } from "../../types/enum";
import { FontAwesome } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { OpcoesRoutesList } from "../../routes/opcoes.routes";
import permissao from "../../utils/permissao";
import useExpoToken from "../../hooks/useExpoToken";
import services from "../../services";
import moment from "moment";
import pkg from "../../../package.json";
import "moment/locale/pt-br";

moment.locale("pt-br");

interface IListPermissao {
  permissao: EPermissaoAcesso;
  descricao: string;
  tela: keyof OpcoesRoutesList;
}

const listPermissao: IListPermissao[] = [
  {
    permissao: EPermissaoAcesso.GERENCIAR_ACESSOS,
    descricao: "Gerencie os acessos da sua conta",
    tela: "GerenciarAcessos",
  },
  {
    permissao: EPermissaoAcesso.GERENCIAR_BANCOS,
    descricao: "Gerencie os bancos da sua conta",
    tela: "GerenciarBancos",
  },
  {
    permissao: EPermissaoAcesso.GERENCIAR_CONTAS_BANCARIAS,
    descricao: "Gerencie as contas bancárias da sua conta",
    tela: "GerenciarContasBancarias",
  },
  {
    permissao: EPermissaoAcesso.GERENCIAR_RESPONSAVEIS,
    descricao: "Gerencie os responsáveis pelos cheques da sua conta",
    tela: "GerenciarResponsaveis",
  },
  {
    permissao: EPermissaoAcesso.GERENCIAR_PERMISSOES,
    descricao: "Gerencie as permissões dos acessos",
    tela: "GerenciarPermissoes",
  },
  // {
  //   permissao: EPermissaoAcesso.GERENCIAR_DATAS_BLOQUEADAS,
  //   descricao:
  //     "Gerencie as datas bloqueadas para emissão e vencimento de cheques",
  //   tela: "GerenciarResponsaveis",
  // },
];

function PermissoesButton({
  titulo,
  descricao,
  tela,
  navigation,
}: {
  titulo: string;
  descricao: string;
  navigation: NavigationProp<OpcoesRoutesList>;
  tela: keyof OpcoesRoutesList;
}) {
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate(tela as never);
      }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      <View
        style={{
          flex: 1,
          gap: 2,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            textTransform: "capitalize",
          }}
        >
          {titulo.replace("GERENCIAR_", "").replace("_", " ")}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: "#666",
            fontWeight: "300",
          }}
        >
          {descricao}
        </Text>
      </View>
      <FontAwesome name="chevron-right" size={16} color="rgba(0, 0, 0, 0.1)" />
    </TouchableOpacity>
  );
}

export default function Opcoes() {
  const navigation = useNavigation<NavigationProp<OpcoesRoutesList>>();
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const { setToken, setUsuario, usuario } = useContext(AuthContext);
  const sair = async () => {
    Alert.alert(
      "Atenção",
      "Você deseja desconectar da sua conta?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Desconectar",
          onPress: async () => {
            await services
              .get({
                route: "logout",
                props: { setToken, setUsuario, expotoken: expoPushToken },
              })
              .then(async () => {
                try {
                  await AsyncStorage.removeItem("token");
                  await AsyncStorage.removeItem("usuario");
                  setToken(null);
                  setUsuario(null);
                } catch (error) {
                  showMessage({
                    type: "danger",
                    icon: "danger",
                    message: "Erro ao realizar logout!",
                  });
                }
              })
              .catch((error) => {
                showMessage({
                  type: "danger",
                  icon: "danger",
                  message: "Ops!",
                  description: error as string,
                });
              });
          },
        },
      ],
      { cancelable: false }
    );
  };

  const setExpoToken = async () => {
    setExpoPushToken(await useExpoToken());
  };

  useEffect(() => {
    setExpoToken();
  }, []);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          gap: 10,
        }}
      >
        <Card>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            {/* <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 50,
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
              }}
            ></View> */}
            <View
              style={{
                gap: 3,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  {usuario!.nome}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: "#666",
                  fontWeight: "300",
                }}
              >
                {usuario!.email}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#666",
                  fontWeight: "300",
                }}
              >
                Desde {moment(usuario!.criado_em).format("DD/MMMM/YYYY")}
              </Text>
            </View>
          </View>
        </Card>
        {permissao.algumaPermissao(
          [
            EPermissaoAcesso.GERENCIAR_ACESSOS,
            EPermissaoAcesso.GERENCIAR_PERMISSOES,
            EPermissaoAcesso.GERENCIAR_BANCOS,
            EPermissaoAcesso.GERENCIAR_CONTAS_BANCARIAS,
            EPermissaoAcesso.GERENCIAR_RESPONSAVEIS,
            EPermissaoAcesso.GERENCIAR_DATAS_BLOQUEADAS,
          ],
          usuario!.permissoes
        ) && (
          <Card titulo="Gerenciar" subTitulo="Gerencie os dados da conta">
            <View style={{ gap: 10 }}>
              {listPermissao
                .sort((a, b) => {
                  if (a.permissao < b.permissao) return -1;
                  if (a.permissao > b.permissao) return 1;
                  return 0;
                })
                .map((item, index) => {
                  return (
                    permissao.todasPermissoes(
                      [item.permissao],
                      usuario!.permissoes
                    ) && (
                      <PermissoesButton
                        key={index}
                        titulo={item.permissao}
                        descricao={item.descricao}
                        navigation={navigation}
                        tela={item.tela}
                      />
                    )
                  );
                })}
            </View>
          </Card>
        )}
        {/* <Card>
              Alterar dados
              Alterar senha
              Sobre
              Ajuda
              Termos de uso
              Política de privacidade
        </Card> */}
        <Button titulo="Sair" onPress={sair} />
        <Text
          style={{
            fontSize: 12,
            color: "#666",
            fontWeight: "300",
            textAlign: "center",
            marginTop: 3,
          }}
        >
          Versão {pkg.version}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
