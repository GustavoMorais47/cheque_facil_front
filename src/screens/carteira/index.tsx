import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/auth";
import { DadosContext } from "../../contexts/dados";
import {
  ActivityIndicator,
  View,
  VirtualizedList,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  IBanco,
  ICheque,
  IContaBancaria,
  IResponsavel,
  IUsuario,
} from "../../types/interfaces";
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { CarteiraRoutesList } from "../../routes/carteira.routes";
import { FontAwesome } from "@expo/vector-icons";
import moment from "moment";
import Card from "../../components/card";
import {
  EOperacaoCheque,
  EPermissaoAcesso,
  EStatusCheque,
} from "../../types/enum";
import services from "../../services";
import { showMessage } from "react-native-flash-message";
import permissao from "../../utils/permissao";
import Input from "../../components/input";

function Item({
  item,
  responsaveis,
  contas,
  bancos,
  navigation,
  setToken,
  setUsuario,
  expotoken,
  getCheques,
}: {
  item: ICheque;
  responsaveis: IResponsavel[];
  contas: IContaBancaria[];
  bancos: IBanco[];
  navigation: NavigationProp<CarteiraRoutesList>;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  setUsuario: React.Dispatch<React.SetStateAction<IUsuario | null>>;
  expotoken?: string;
  getCheques: () => Promise<void>;
}) {
  return (
    <Card
      style={{ marginHorizontal: 20 }}
      faixaEsquerda={{
        mostrar: true,
        backgroundColor:
          item.status === EStatusCheque.VENCIDO
            ? "#f00"
            : item.status === EStatusCheque.A_VENCER
            ? "#f90"
            : item.status === EStatusCheque.PAGO
            ? "#399b53"
            : "#000",
      }}
    >
      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            "Cheque",
            "O que deseja fazer?",
            [
              {
                text: "Visualizar",
                onPress: () => {
                  navigation.navigate("CarteiraAddEdit", { cheque: item });
                },
              },
              {
                text: "Excluir",
                style: "destructive",
                onPress: async () => {
                  Alert.alert(
                    "Excluir cheque",
                    "Deseja realmente excluir este cheque?",
                    [
                      {
                        text: "Sim",
                        style: "destructive",
                        onPress: async () => {
                          await services
                            .del<{ mensagem: string }>({
                              route: "cheque/",
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
                              await getCheques();
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
                      {
                        text: "Não",
                        style: "cancel",
                        isPreferred: true,
                      },
                    ],
                    { cancelable: false }
                  );
                },
              },
              {
                text: "Cancelar",
                style: "cancel",
                isPreferred: true,
              },
            ],
            { cancelable: false }
          );
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              {item.numero}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "300",
              }}
            >
              Conta:{" "}
              {
                contas[
                  contas.findIndex((cnt) => cnt.id === item.id_conta_bancaria)
                ].conta
              }{" "}
              -{" "}
              {
                bancos.find(
                  (b) =>
                    b.id ===
                    contas[
                      contas.findIndex(
                        (cnt) => cnt.id === item.id_conta_bancaria
                      )
                    ].id_banco
                )?.nome
              }
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "300",
              }}
            >
              Responsável:{" "}
              {responsaveis.find((rsp) => rsp.id === item.id_responsavel)?.nome}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "300",
              }}
            >
              Emissão:{" "}
              {moment(item.data_emissao).toDate().toLocaleString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "300",
              }}
            >
              Vencimento:{" "}
              {item.data_vencimento
                ? moment(item.data_vencimento)
                    .toDate()
                    .toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                : "Sem vencimento"}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "300",
                textTransform: "capitalize",
              }}
            >
              Status: {item.status.replaceAll("_", " ")}
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 17,
              }}
            >
              {item.valor.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

function renderItem({
  item,
  responsaveis,
  contas,
  bancos,
  navigation,
  setToken,
  setUsuario,
  expotoken,
  getCheques,
}: {
  item: ICheque;
  responsaveis: IResponsavel[];
  contas: IContaBancaria[];
  bancos: IBanco[];
  navigation: NavigationProp<CarteiraRoutesList>;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  setUsuario: React.Dispatch<React.SetStateAction<IUsuario | null>>;
  expotoken?: string;
  getCheques: () => Promise<void>;
}) {
  return (
    <Item
      item={item}
      responsaveis={responsaveis}
      contas={contas}
      bancos={bancos}
      navigation={navigation}
      setToken={setToken}
      setUsuario={setUsuario}
      expotoken={expotoken}
      getCheques={getCheques}
    />
  );
}

export default function Carteira() {
  const navigation = useNavigation<NavigationProp<CarteiraRoutesList>>();
  const { params } = useRoute<RouteProp<CarteiraRoutesList, "CarteiraLista">>();
  const { setToken, setUsuario, usuario } = useContext(AuthContext);
  const {
    expotoken,
    cheques,
    getCheques,
    responsaveis,
    contas,
    bancos,
    datas,
    filtro,
  } = useContext(DadosContext);
  const [chequesFiltrados, setChequesFiltrados] = useState<ICheque[]>(cheques);
  const [pesquisa, setPesquisa] = useState("");

  const [loading, setLoading] = useState(false);

  const atualizar = async () => {
    setLoading(true);
    await getCheques().finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    (async () => {
      await atualizar();
    })();
  }, []);

  useEffect(() => {
    const psq = pesquisa.replaceAll(",", ".");
    if (pesquisa.trim() === "") {
      setChequesFiltrados(cheques);
      return;
    } else if (isNaN(Number(psq))) {
      setChequesFiltrados(
        cheques.filter(
          (cheque) =>
            responsaveis
              .find((rsp) => rsp.id === cheque.id_responsavel)
              ?.nome.toLowerCase()
              .includes(pesquisa.toLowerCase()) ||
            cheque.status.toLowerCase().includes(pesquisa.toLowerCase()) ||
            cheque.operacao
              .toLowerCase()
              .includes(pesquisa.replaceAll(" ", "_").toLowerCase())
        )
      );
    } else {
      setChequesFiltrados(
        cheques.filter(
          (cheque) =>
            cheque.numero.includes(psq) ||
            cheque.valor.toString().includes(psq) ||
            contas
              .find((cnt) => cnt.id === cheque.id_conta_bancaria)
              ?.conta.includes(psq)
        )
      );
    }
  }, [cheques, pesquisa]);

  useEffect(() => {
    if (params?.pesquisa) {
      setPesquisa(params.pesquisa);
    }
  }, [params]);
  return loading ? (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#399b53" />
    </View>
  ) : (
    <>
      <View style={{ gap: 10, marginBottom: 10 }}>
        <View
          style={{
            backgroundColor: "#399b53",
            padding: 3,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "bold",
              color: "#fff",
              textAlign: "center",
            }}
          >
            {filtro === "emissao" ? "Emissão" : "Vencimento"}:{" "}
            {moment(datas.inicio).isSame(datas.fim, "day")
              ? moment(datas.inicio).isSame(moment(), "day")
                ? "Hoje"
                : moment(datas.inicio).format("DD/MM/YYYY")
              : `${
                  moment(datas.inicio).isSame(moment(), "day")
                    ? "Hoje"
                    : moment(datas.inicio).format("DD/MM/YYYY")
                } - ${
                  moment(datas.fim).isSame(moment(), "day")
                    ? "Hoje"
                    : moment(datas.fim).format("DD/MM/YYYY")
                }`}
          </Text>
        </View>
        <Card style={{ marginHorizontal: 20 }}>
          <Input
            title="Pesquisar"
            subTitle="Pesquisar por número do cheque, responsável, status, conta ou valor!"
            text={pesquisa}
            onChangeText={setPesquisa}
            placeholder="Pesquisar"
            iconLeft={<FontAwesome name="search" size={15} color="#aaa" />}
            iconRight={
              pesquisa.trim() !== "" && (
                <TouchableOpacity
                  onPress={() => setPesquisa("")}
                  style={{
                    width: 30,
                    height: 30,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FontAwesome name="close" size={15} color="#aaa" />
                </TouchableOpacity>
              )
            }
          />
        </Card>
      </View>
      <VirtualizedList
        data={chequesFiltrados}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }: { item: ICheque }) =>
          renderItem({
            item,
            responsaveis,
            contas,
            bancos,
            navigation,
            setToken,
            setUsuario,
            expotoken,
            getCheques,
          })
        }
        keyExtractor={(item) => item.id.toString()}
        getItemCount={(data) => data.length}
        getItem={(data, index) => data[index]}
        ListEmptyComponent={() => (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Nenhum cheque encontrado
            </Text>
          </View>
        )}
        ListFooterComponentStyle={{
          marginTop: 10,
        }}
        ListFooterComponent={() => (
          <View>
            <Text
              style={{
                fontSize: 12,
                textAlign: "center",
                color: "#666",
              }}
            >
              {cheques.length === 1
                ? `Foi encontrado 1 cheque.`
                : `Foram encontrados ${cheques.length} cheques.`}
            </Text>
          </View>
        )}
        contentContainerStyle={{
          paddingBottom: 60,
        }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshing={false}
        onRefresh={atualizar}
      />
      {permissao.todasPermissoes(
        [EPermissaoAcesso.GERENCIAR_CHEQUES],
        usuario!.permissoes
      ) && (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("CarteiraAddEdit", { cheque: undefined })
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
      )}
    </>
  );
}
