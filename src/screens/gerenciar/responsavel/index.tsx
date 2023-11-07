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
import { IAcesso, IUsuario } from "../../../types/interfaces";
import services from "../../../services";
import { AuthContext } from "../../../contexts/auth";
import { showMessage } from "react-native-flash-message";
import { Ionicons } from "@expo/vector-icons";
import { DadosContext } from "../../../contexts/dados";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { OpcoesRoutesList } from "../../../routes/opcoes.routes";

function Item({
  item,
  getResponsaveis,
  expotoken,
  setToken,
  setUsuario,
  setLoading,
  navigation,
}: {
  item: IAcesso;
  getResponsaveis: () => Promise<void>;
  expotoken?: string;
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
            `O que deseja fazer com o responsável ${item.nome}?`,
            [
              {
                text: "Excluir",
                onPress: () => {
                  Alert.alert(
                    "Atenção",
                    "Tem certeza que deseja excluir este responsável?",
                    [
                      {
                        text: "Sim",
                        onPress: async () => {
                          await services
                            .del<{ mensagem: string }>({
                              route: "responsavel/",
                              id: item.id,
                              props: {
                                setToken,
                                setUsuario,
                                expotoken,
                              },
                            })
                            .then(async (response) => {
                              showMessage({
                                type: "success",
                                icon: "success",
                                message: "Sucesso",
                                description: response.mensagem,
                              });
                              await getResponsaveis();
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
                  navigation.navigate("GerenciarResponsaveisAddEdit", {
                    responsavel: item,
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
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.nome}</Text>
          <Text style={{ fontSize: 12, color: "#666" }}>{item.email}</Text>
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
  getResponsaveis,
  expotoken,
  setToken,
  setUsuario,
  setLoading,
  navigation,
}: {
  item: IAcesso;
  getResponsaveis: () => Promise<void>;
  expotoken?: string;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  setUsuario: React.Dispatch<React.SetStateAction<IUsuario | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  navigation: NavigationProp<OpcoesRoutesList>;
}) => (
  <Item
    item={item}
    getResponsaveis={getResponsaveis}
    expotoken={expotoken}
    setToken={setToken}
    setUsuario={setUsuario}
    setLoading={setLoading}
    navigation={navigation}
  />
);

export default function GerenciarResponsaveis() {
  const navigation = useNavigation<NavigationProp<OpcoesRoutesList>>();
  const { setToken, setUsuario } = useContext(AuthContext);
  const { expotoken, responsaveis, getResponsaveis } = useContext(DadosContext);
  const [loading, setLoading] = useState<boolean>(false);

  async function atualizar() {
    setLoading(true);
    await getResponsaveis().finally(() => {
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
        data={responsaveis.sort((a, b) => (a.nome > b.nome ? 1 : -1))}
        showsVerticalScrollIndicator={false}
        getItemCount={(data) => data.length}
        getItem={(data, index) => data[index]}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) =>
          renderItem({
            item,
            getResponsaveis: atualizar,
            expotoken,
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
              Nenhum responsável encontrado
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
          navigation.navigate("GerenciarResponsaveisAddEdit", {
            responsavel: undefined,
          })
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
        <Ionicons name="person-add" size={23} color="#fff" />
      </TouchableOpacity>
    </>
  );
}
