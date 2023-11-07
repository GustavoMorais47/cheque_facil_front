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
import { IBanco, IUsuario } from "../../../types/interfaces";
import services from "../../../services";
import { AuthContext } from "../../../contexts/auth";
import { showMessage } from "react-native-flash-message";
import { FontAwesome } from "@expo/vector-icons";
import { DadosContext } from "../../../contexts/dados";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { OpcoesRoutesList } from "../../../routes/opcoes.routes";

function Item({
  item,
  getBancos,
  expotoken,
  setToken,
  setUsuario,
  setLoading,
  navigation,
}: {
  item: IBanco;
  getBancos: () => Promise<void>;
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
            `O que deseja fazer com o banco ${item.nome}?`,
            [
              {
                text: "Excluir",
                onPress: () => {
                  Alert.alert(
                    "Atenção",
                    "Tem certeza que deseja excluir este banco?",
                    [
                      {
                        text: "Sim",
                        onPress: async () => {
                          await services
                            .del<{ mensagem: string }>({
                              route: "banco/",
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
                              await getBancos();
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
                  navigation.navigate("GerenciarBancosAddEdit", {
                    banco: item,
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
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.codigo} <Text style={{fontWeight: "normal"}}>- {item.nome}</Text></Text>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const renderItem = ({
  item,
  getBancos,
  expotoken,
  setToken,
  setUsuario,
  setLoading,
  navigation,
}: {
  item: IBanco;
  getBancos: () => Promise<void>;
  expotoken?: string;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  setUsuario: React.Dispatch<React.SetStateAction<IUsuario | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  navigation: NavigationProp<OpcoesRoutesList>;
}) => (
  <Item
    item={item}
    getBancos={getBancos}
    expotoken={expotoken}
    setToken={setToken}
    setUsuario={setUsuario}
    setLoading={setLoading}
    navigation={navigation}
  />
);

export default function GerenciarBancos() {
  const navigation = useNavigation<NavigationProp<OpcoesRoutesList>>();
  const { setToken, setUsuario } = useContext(AuthContext);
  const { expotoken, bancos, getBancos } = useContext(DadosContext);
  const [loading, setLoading] = useState<boolean>(false);

  async function atualizar() {
    setLoading(true);
    await getBancos().finally(() => {
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
        data={bancos.sort((a, b) => (a.nome > b.nome ? 1 : -1))}
        showsVerticalScrollIndicator={false}
        getItemCount={(data) => data.length}
        getItem={(data, index) => data[index]}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) =>
          renderItem({
            item,
            getBancos: atualizar,
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
              Nenhum banco encontrado
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
          navigation.navigate("GerenciarBancosAddEdit", { banco: undefined })
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
