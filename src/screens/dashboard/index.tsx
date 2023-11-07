import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import Card from "../../components/card";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { useContext, useEffect, useState } from "react";
import { LineChartData } from "react-native-chart-kit/dist/line-chart/LineChart";
import { EOperacaoCheque, EPermissaoAcesso } from "../../types/enum";
import { DadosContext } from "../../contexts/dados";
import moment from "moment";
import Switch from "../../components/switch";
import DataPicker from "../../components/DataPicker";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";
import permissao from "../../utils/permissao";
import { AuthContext } from "../../contexts/auth";
import * as Linking from "expo-linking";

const screenWidth = Dimensions.get("window").width;

const chartConfig: AbstractChartConfig = {
  backgroundColor: "#fff",
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForHorizontalLabels: {
    fontSize: 9,
  },
};

export default function Dashboard() {
  const {
    cheques,
    filtro,
    datas,
    responsaveis,
    setFiltro,
    setDatas,
    contas,
    bancos,
  } = useContext(DadosContext);
  const { usuario } = useContext(AuthContext);
  const [data, setData] = useState<LineChartData | null>(null);
  const prefix = Linking.createURL("/");

  useEffect(() => {
    if (cheques.length > 0) {
      if (moment(datas.inicio).isSame(datas.fim, "week")) {
        const dias: string[] = [
          "domingo",
          "segunda",
          "terca",
          "quarta",
          "quinta",
          "sexta",
          "sabado",
        ];
        const cheques_apagar: number[] = [];
        dias.forEach((d) => {
          const apagar_cheques = cheques.filter(
            (c) =>
              c.operacao === EOperacaoCheque.A_PAGAR &&
              moment(c.data_emissao).format("dddd") === d
          );

          const apagar_total = apagar_cheques.reduce((acc, cur) => {
            switch (filtro) {
              case "emissao":
                if (moment(cur.data_emissao).format("dddd") === d) {
                  return acc + cur.valor;
                }
                return acc;
              case "vencimento":
                if (cur.data_vencimento) {
                  if (moment(cur.data_vencimento).format("dddd") === d) {
                    return acc + cur.valor;
                  }
                  return acc;
                }
                return acc;
            }
          }, 0);

          cheques_apagar.push(apagar_total);
        });

        setData({
          labels: dias,
          datasets: [
            {
              data: cheques_apagar,
              color: () => "#399b53",
            },
          ],
        });
      } else if (moment(datas.inicio).isSame(datas.fim, "month")) {
        const dias: string[] = cheques
          .map((c) => moment(c.data_emissao).format("DD/MM"))
          .filter((v, i, a) => a.indexOf(v) === i)
          .sort((a, b) => {
            const a_date = moment(a, "DD/MM");
            const b_date = moment(b, "DD/MM");

            if (a_date.isBefore(b_date)) {
              return -1;
            }
            if (a_date.isAfter(b_date)) {
              return 1;
            }
            return 0;
          });
        const cheques_apagar: number[] = [];

        dias.forEach((d) => {
          const apagar_cheques = cheques.filter(
            (c) =>
              c.operacao === EOperacaoCheque.A_PAGAR &&
              moment(c.data_emissao).format("DD/MM") === d
          );

          const apagar_total = apagar_cheques.reduce((acc, cur) => {
            switch (filtro) {
              case "emissao":
                if (moment(cur.data_emissao).format("DD/MM") === d) {
                  return acc + cur.valor;
                }
                return acc;
              case "vencimento":
                if (cur.data_vencimento) {
                  if (moment(cur.data_vencimento).format("DD/MM") === d) {
                    return acc + cur.valor;
                  }
                  return acc;
                }
                return acc;
            }
          }, 0);

          cheques_apagar.push(apagar_total);
        });

        setData({
          labels: dias,
          datasets: [
            {
              data: cheques_apagar,
              color: () => "#399b53",
            },
          ],
        });
      } else {
        const meses: string[] = cheques
          .map((c) => moment(c.data_emissao).format("MMM"))
          .filter((v, i, a) => a.indexOf(v) === i)
          .sort((a, b) => {
            const a_date = moment(a, "MMMM");
            const b_date = moment(b, "MMMM");

            if (a_date.isBefore(b_date)) {
              return -1;
            }
            if (a_date.isAfter(b_date)) {
              return 1;
            }
            return 0;
          });

        const cheques_apagar: number[] = [];

        meses.forEach((m) => {
          const apagar_cheques = cheques.filter(
            (c) =>
              c.operacao === EOperacaoCheque.A_PAGAR &&
              moment(c.data_emissao).format("MMM") === m
          );

          let apagar_total: number = 0;
          if (filtro === "emissao") {
            apagar_total = apagar_cheques.reduce((acc, cur) => {
              if (moment(cur.data_emissao).format("MMM") === m) {
                return acc + cur.valor;
              }
              return acc;
            }, 0);
          } else {
            apagar_total = apagar_cheques.reduce((acc, cur) => {
              if (cur.data_vencimento) {
                if (moment(cur.data_vencimento).format("MMM") === m) {
                  return acc + cur.valor;
                }
                return acc;
              }
              return acc;
            }, 0);
          }
          cheques_apagar.push(apagar_total);
        });

        setData({
          labels: meses,
          datasets: [
            {
              data: cheques_apagar,
              color: () => "#399b53",
            },
          ],
        });
      }
    }
  }, [cheques]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, gap: 10 }}
      showsVerticalScrollIndicator={false}
    >
      <Card titulo="Filtros" subTitulo="Selecione os filtros para o aplicativo">
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            Data Inicial
          </Text>
          <DataPicker
            data={datas.inicio}
            setData={(value) => setDatas({ ...datas, inicio: value })}
          />
        </View>
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            Data Final
          </Text>
          <DataPicker
            data={datas.fim}
            setData={(value) => setDatas({ ...datas, fim: value })}
            minimumDate={datas.inicio}
            maximumDate={moment()
              .add(1, "year")
              .subtract(1, "month")
              .endOf("month")
              .toDate()}
          />
        </View>
        <Switch
          titulo="Pesquisar por"
          opcoes={[
            { label: "Emissão", value: "emissao" },
            { label: "Vencimento", value: "vencimento" },
          ]}
          selecionado={filtro === "emissao" ? 0 : 1}
          setSelecionado={(value) =>
            setFiltro(value === 0 ? "emissao" : "vencimento")
          }
        />
      </Card>
      {cheques.length > 0 && data && (
        <Card titulo="Gráfico" subTitulo="Gráfico de cheques por período">
          <LineChart
            transparent={true}
            data={data}
            width={screenWidth - 60}
            height={(screenWidth - 60) * 0.8}
            chartConfig={chartConfig}
            yLabelsOffset={6}
            formatYLabel={(value) =>
              Number(value).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
            }
            bezier
          />
        </Card>
      )}
      <Card titulo="Operações" subTitulo="Resumo por operação">
        <TouchableOpacity
          onPress={() => Linking.openURL(prefix + "carteira/"+ EOperacaoCheque.A_PAGAR)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
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
              A Pagar
            </Text>
            <Text
              style={{
                fontWeight: "300",
                fontSize: 12,
              }}
            >
              {
                cheques.filter((c) => c.operacao === EOperacaoCheque.A_PAGAR)
                  .length
              }{" "}
              {cheques.filter((c) => c.operacao === EOperacaoCheque.A_PAGAR)
                .length === 1
                ? "cheque"
                : "cheques"}
            </Text>
          </View>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            {cheques
              .filter((c) => c.operacao === EOperacaoCheque.A_PAGAR)
              .reduce((acc, cur) => acc + cur.valor, 0)
              .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </Text>
        </TouchableOpacity>
      </Card>
      {permissao.todasPermissoes(
        [EPermissaoAcesso.GERENCIAR_CONTAS_BANCARIAS],
        usuario!.permissoes
      ) && (
        <Card titulo="Contas Bancárias" subTitulo="Resumo por Conta Bancária">
          <View style={{ gap: 5 }}>
            {(contas.length === 0 && (
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                Nenhuma conta bancária encontrada
              </Text>
            )) ||
              contas.map((c, i) => {
                const cheques_conta = cheques.filter(
                  (c) => c.id_conta_bancaria === c.id_conta_bancaria
                );
                return (
                  <View key={c.id}>
                    <TouchableOpacity
                      onPress={() =>
                        Linking.openURL(prefix + "carteira/" + c.conta)
                      }
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
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "bold",
                            fontSize: 16,
                          }}
                        >
                          {c.conta} -{" "}
                          {bancos.find((b) => b.id === c.id_banco)?.nome}
                        </Text>
                        <Text
                          style={{
                            fontWeight: "300",
                            fontSize: 12,
                          }}
                        >
                          {cheques_conta.length}{" "}
                          {cheques_conta.length === 1 ? "cheque" : "cheques"}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      >
                        {cheques_conta
                          .reduce((acc, cur) => acc + cur.valor, 0)
                          .toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                      </Text>
                    </TouchableOpacity>
                    {i !== contas.length - 1 && (
                      <View
                        style={{
                          width: "55%",
                          height: 1,
                          alignSelf: "center",
                          marginVertical: 5,
                          backgroundColor: "#eee",
                        }}
                      />
                    )}
                  </View>
                );
              })}
          </View>
        </Card>
      )}
      <Card titulo="Responsáveis" subTitulo="Resumo por Responsável">
        <View style={{ gap: 5 }}>
          {(responsaveis.length === 0 && (
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 16,
                textAlign: "center",
              }}
            >
              Nenhum responsável encontrado
            </Text>
          )) ||
            responsaveis.map((r, i) => {
              const cheques_responsavel = cheques.filter(
                (c) => c.id_responsavel === r.id
              );
              return (
                <View key={r.id}>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(
                        prefix + "carteira/" + r.nome.replaceAll(" ", "_")
                      )
                    }
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
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      >
                        {r.nome}
                      </Text>
                      <Text
                        style={{
                          fontWeight: "300",
                          fontSize: 12,
                        }}
                      >
                        {cheques_responsavel.length}{" "}
                        {cheques_responsavel.length === 1
                          ? "cheque"
                          : "cheques"}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      {cheques_responsavel
                        .reduce((acc, cur) => acc + cur.valor, 0)
                        .toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                    </Text>
                  </TouchableOpacity>
                  {i !== responsaveis.length - 1 && (
                    <View
                      style={{
                        width: "55%",
                        height: 1,
                        alignSelf: "center",
                        marginVertical: 5,
                        backgroundColor: "#eee",
                      }}
                    />
                  )}
                </View>
              );
            })}
        </View>
      </Card>
    </ScrollView>
  );
}
