import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
  VirtualizedList,
} from "react-native";
import Card from "../../../components/card";
import { IBanco, IContaBancaria, IUsuario } from "../../../types/interfaces";
import services from "../../../services";
import { AuthContext } from "../../../contexts/auth";
import { showMessage } from "react-native-flash-message";
import { FontAwesome } from "@expo/vector-icons";
import { DadosContext } from "../../../contexts/dados";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { OpcoesRoutesList } from "../../../routes/opcoes.routes";

function Item({
  item,
  bancos,
  getContasBancarias,
  setToken,
  setUsuario,
  setLoading,
  navigation,
}: {
  item: IContaBancaria;
  bancos: IBanco[];
  getContasBancarias: () => Promise<void>;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  setUsuario: React.Dispatch<React.SetStateAction<IUsuario | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  navigation: NavigationProp<OpcoesRoutesList>;
}) {
  return (
    <Card>
      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            "Atenção",
            `O que deseja fazer com o acesso ${item.conta}?`,
            [
              {
                text: "Excluir",
                onPress: () => {
                  Alert.alert(
                    "Atenção",
                    "Tem certeza que deseja excluir esta conta?",
                    [
                      {
                        text: "Sim",
                        onPress: async () => {
                          await services
                            .del<{ mensagem: string }>({
                              route: "conta/",
                              id: item.id,
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
                              await getContasBancarias();
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
                        },
                        style: "destructive",
                      },
                      {
                        text: "Cancelar",
                        style: "cancel",
                      },
                    ],
                    {
                      cancelable: false,
                    }
                  );
                },
                style: "destructive",
              },
              {
                text: "Cancelar",
                style: "cancel",
              },
              {
                text: "Editar",
                onPress: () =>
                  navigation.navigate("GerenciarContasBancariasAddEdit", {
                    conta: item,
                  }),
              },
            ],
            {
              cancelable: false,
            }
          );
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            flex: 1,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>{bancos[bancos.findIndex(bnc => bnc.id === item.id_banco)].nome}</Text>
          <Text style={{ fontSize: 12, color: "#666" }}>Agência: {item.agencia}</Text>
          <Text style={{ fontSize: 12, color: "#666" }}>Conta: {item.conta}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text
            style={{
              fontSize: 12,
              color: item.status ? "#399b53" : "#f00",
            }}
          >
            {item.status ? "Ativo" : "Inativo"}
          </Text>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const renderItem = ({
  item,
  bancos,
  getContasBancarias,
  setToken,
  setUsuario,
  setLoading,
  navigation,
}: {
  item: IContaBancaria;
  bancos: IBanco[];
  getContasBancarias: () => Promise<void>;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  setUsuario: React.Dispatch<React.SetStateAction<IUsuario | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  navigation: NavigationProp<OpcoesRoutesList>;
}) => (
  <Item
    item={item}
    bancos={bancos}
    getContasBancarias={getContasBancarias}
    setToken={setToken}
    setUsuario={setUsuario}
    setLoading={setLoading}
    navigation={navigation}
  />
);

export default function GerenciarContaBancaria() {
  const navigation = useNavigation<NavigationProp<OpcoesRoutesList>>();
  const { setToken, setUsuario } = useContext(AuthContext);
  const { contas, bancos, getContasBancarias } = useContext(DadosContext);
  const [loading, setLoading] = useState<boolean>(false);

  async function atualizar() {
    setLoading(true);
    await getContasBancarias().finally(() => {
      setLoading(false);
    });
  }

  useEffect(() => {
    (async () => {
      await atualizar();
    })();
  }, []);

  return loading ? (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size={"large"} color={"#399b53"} />
    </View>
  ) : (
    <>
      <VirtualizedList
        data={contas.sort((a, b) => (a.conta > b.conta ? 1 : -1))}
        showsVerticalScrollIndicator={false}
        getItemCount={(data) => data.length}
        getItem={(data, index) => data[index]}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) =>
          renderItem({
            item,
            bancos,
            getContasBancarias: atualizar,
            setToken,
            setUsuario,
            setLoading,
            navigation,
          })
        }
        ListEmptyComponent={() => (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Nenhuma conta bancária encontrada
            </Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100,
        }}
        refreshing={false}
        onRefresh={atualizar}
      />
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("GerenciarContasBancariasAddEdit", { conta: undefined })
        }
        style={{
          backgroundColor: "#399b53",
          height: 55,
          width: 55,
          borderRadius: 55,
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          right: 20,
          bottom: 20,
        }}
      >
        <FontAwesome name="plus" size={23} color="#fff" />
      </TouchableOpacity>
    </>
  );
}
