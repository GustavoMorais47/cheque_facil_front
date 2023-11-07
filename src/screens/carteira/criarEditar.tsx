import { useContext, useEffect, useState } from "react";
import { DadosContext } from "../../contexts/dados";
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { CarteiraRoutesList } from "../../routes/carteira.routes";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import Card from "../../components/card";
import Button from "../../components/button";
import Switch, { IOpcao } from "../../components/switch";
import { IContaBancaria, IResponsavel } from "../../types/interfaces";
import {
  EOperacaoCheque,
  EPermissaoAcesso,
  EStatusCheque,
} from "../../types/enum";
import Input from "../../components/input";
import moment from "moment";
import DataPicker from "../../components/DataPicker";
import services from "../../services";
import { showMessage } from "react-native-flash-message";
import { AuthContext } from "../../contexts/auth";
import permissao from "../../utils/permissao";
import { Ionicons } from "@expo/vector-icons";

const statusCheque: IOpcao[] = [
  {
    label: EStatusCheque.A_VENCER,
    value: EStatusCheque.A_VENCER,
  },
  {
    label: EStatusCheque.VENCIDO,
    value: EStatusCheque.VENCIDO,
  },
  {
    label: EStatusCheque.PAGO,
    value: EStatusCheque.PAGO,
  },
  {
    label: EStatusCheque.DEVOLVIDO,
    value: EStatusCheque.DEVOLVIDO,
  },
];

export default function CarteiraCriarEditar() {
  const navigation = useNavigation<NavigationProp<CarteiraRoutesList>>();
  const { params } =
    useRoute<RouteProp<CarteiraRoutesList, "CarteiraAddEdit">>();
  const { setToken, setUsuario, usuario } = useContext(AuthContext);
  const { contas, bancos, responsaveis, expotoken, getCheques } =
    useContext(DadosContext);

  const [conta, setConta] = useState<IContaBancaria | null>(
    params.cheque?.id_conta_bancaria
      ? contas.find((cnt) => cnt.id === params.cheque?.id_conta_bancaria) ||
          null
      : null
  );
  const [responsavel, setResponsavel] = useState<IResponsavel | null>(
    params.cheque?.id_responsavel
      ? responsaveis.find((rsp) => rsp.id === params.cheque?.id_responsavel) ||
          null
      : null
  );
  const [numero, setNumero] = useState<string>(params.cheque?.numero || "");
  const [valor, setValor] = useState<number>(params.cheque?.valor || 0);
  const [emissao, setEmissao] = useState<Date>(
    params.cheque
      ? new Date(moment(params.cheque.data_emissao).toISOString())
      : new Date()
  );
  const [vencimento, setVencimento] = useState<Date | null>(
    params.cheque?.data_vencimento
      ? new Date(moment(params.cheque.data_vencimento).toISOString())
      : null
  );
  const [pagamento, setPagamento] = useState<Date | null>(
    params.cheque?.data_pagamento
      ? new Date(moment(params.cheque.data_pagamento).toISOString())
      : null
  );
  const [destinatario, setDestinatario] = useState<string>(
    params.cheque?.destinatario || ""
  );
  const [descricao, setDescricao] = useState<string>(
    params.cheque?.descricao || ""
  );
  const [status, setStatus] = useState<EStatusCheque | null>(
    params.cheque?.status || null
  );
  const [editar, setEditar] = useState<boolean>(params.cheque ? false : true);
  const [loading, setLoading] = useState<boolean>(false);

  const [permanecer, setPermanecer] = useState<boolean>(false);

  const cadastrar = async () => {
    if (!conta)
      return showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção!",
        description: "Selecione uma conta bancária",
      });

    if (!responsavel)
      return showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção!",
        description: "Selecione um responsável",
      });

    if (numero.trim().length === 0)
      return showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção!",
        description: "Informe o número do cheque",
      });

    if (valor <= 0)
      return showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção!",
        description: "Informe o valor do cheque",
      });

    if (!status)
      return showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção!",
        description: "Selecione o status do cheque",
      });

    if (!expotoken)
      return showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção!",
        description:
          "Não foi possivel obter o token de validação do app. Tente novamente mais tarde ou reinicie o app.",
      });

    setLoading(true);
    await services
      .post<
        { mensagem: string },
        {
          operacao: EOperacaoCheque; //obrigatório
          id_conta_bancaria: number; //obrigatório
          id_responsavel: number; //obrigatório
          numero: string; //obrigatório
          valor: number; //obrigatório
          data_emissao: Date; //obrigatório
          data_vencimento: Date | null;
          data_pagamento: Date | null;
          destinatario: string | null;
          descricao: string | null;
          status: EStatusCheque; //obrigatório
        }
      >({
        route: "cheque/",
        data: {
          operacao: EOperacaoCheque.A_PAGAR,
          id_conta_bancaria: conta.id,
          id_responsavel: responsavel.id,
          numero,
          valor,
          data_emissao: emissao,
          data_vencimento: vencimento,
          data_pagamento: pagamento,
          destinatario: destinatario.trim().length > 0 ? destinatario : null,
          descricao: descricao.trim().length > 0 ? descricao : null,
          status,
        },
        props: {
          setToken,
          setUsuario,
          expotoken,
        },
      })
      .then(async (res) => {
        showMessage({
          type: "success",
          icon: "success",
          message: res.mensagem,
        });
        await getCheques();
        !permanecer && navigation.goBack();
      })
      .catch((err) => {
        showMessage({
          type: "danger",
          icon: "danger",
          message: "Ops!",
          description: err as string,
        });
      })
      .finally(() => setLoading(false));
  };

  const salvar = async () => {
    if (!conta)
      return showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção!",
        description: "Selecione uma conta bancária",
      });

    if (!responsavel)
      return showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção!",
        description: "Selecione um responsável",
      });

    if (valor <= 0)
      return showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção!",
        description: "Informe o valor do cheque",
      });

    if (!status)
      return showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção!",
        description: "Selecione o status do cheque",
      });

    if (!expotoken)
      return showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção!",
        description:
          "Não foi possivel obter o token de validação do app. Tente novamente mais tarde ou reinicie o app.",
      });

    setLoading(true);
    await services
      .put<
        { mensagem: string },
        {
          operacao: EOperacaoCheque; //obrigatório
          id_conta_bancaria: number; //obrigatório
          id_responsavel: number; //obrigatório
          valor: number; //obrigatório
          data_emissao: Date; //obrigatório
          data_vencimento: Date | null;
          data_pagamento: Date | null;
          destinatario: string | null;
          descricao: string | null;
          status: EStatusCheque; //obrigatório
        }
      >({
        route: "cheque/",
        id: params.cheque!.id,
        data: {
          operacao: EOperacaoCheque.A_PAGAR,
          id_conta_bancaria: conta.id,
          id_responsavel: responsavel.id,
          valor,
          data_emissao: emissao,
          data_vencimento: vencimento,
          data_pagamento: pagamento,
          destinatario: destinatario.trim().length > 0 ? destinatario : null,
          descricao: descricao.trim().length > 0 ? descricao : null,
          status,
        },
        props: {
          expotoken,
          setToken,
          setUsuario,
        },
      })
      .then(async (res) => {
        showMessage({
          type: "success",
          icon: "success",
          message: res.mensagem,
        });
        await getCheques();
        !permanecer && navigation.goBack();
      })
      .catch((err) => {
        showMessage({
          type: "danger",
          icon: "danger",
          message: "Ops!",
          description: err as string,
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    params.cheque &&
      navigation.setOptions({
        headerRight:
          permissao.todasPermissoes(
            [EPermissaoAcesso.GERENCIAR_CHEQUES],
            usuario!.permissoes
          ) && !editar
            ? () => (
                <TouchableOpacity onPress={() => setEditar(true)}>
                  <Ionicons name="pencil" size={24} color={"#399b53"} />
                </TouchableOpacity>
              )
            : undefined,
      });
  }, [editar]);

  useEffect(() => {
    params.cheque &&
      navigation.setOptions({
        title: `Cheque ${params.cheque.numero}`,
      });
  }, []);

  useEffect(() => {
    if (editar && !params.cheque) {
      const hoje = moment().startOf("day");
      if (vencimento && moment(vencimento).endOf("day").isBefore(hoje)) {
        setStatus(EStatusCheque.VENCIDO);
      } else if (pagamento) {
        setStatus(EStatusCheque.PAGO);
      } else if (vencimento && moment(vencimento).endOf("day").isAfter(hoje)) {
        setStatus(EStatusCheque.A_VENCER);
      } else {
        setStatus(null);
      }
    }
  }, [emissao, vencimento, pagamento]);
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        padding: 20,
        gap: 10,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Card titulo="Conta" subTitulo="Selecione a conta do cheque">
        <Switch
          disabled={!editar || loading}
          opcoes={contas.map((cnt) => ({
            label: `${
              bancos[bancos.findIndex((bnc) => bnc.id === cnt.id)].nome
            } - ${cnt.agencia} - ${cnt.conta}`,
            value: cnt.id,
          }))}
          selecionado={contas.findIndex((cnt) => cnt.id === conta?.id)}
          setSelecionado={(_, value) =>
            setConta(contas.find((cnt) => cnt.id === value) || null)
          }
        />
      </Card>
      <Card
        titulo="Responsável"
        subTitulo="Selecione o responsável pelo cheque"
      >
        <Switch
          disabled={!editar || loading}
          opcoes={responsaveis.map((rsp) => ({
            label: rsp.nome,
            value: rsp.id,
          }))}
          selecionado={responsaveis.findIndex(
            (rsp) => rsp.id === responsavel?.id
          )}
          setSelecionado={(_, value) =>
            setResponsavel(responsaveis.find((rsp) => rsp.id === value) || null)
          }
        />
      </Card>
      <Card titulo="Detalhes" subTitulo="Preencha os detalhes do cheque">
        <View style={{ gap: 10 }}>
          <Input
            disabled={loading || !!params.cheque}
            title="Número"
            text={numero}
            onChangeText={(text) => setNumero(text.replace(/\D/g, ""))}
            placeholder="Número do cheque"
            keyboardType="numeric"
          />
          <Input
            disabled={!editar || loading}
            title="Valor"
            text={valor.toLocaleString("pt-br", {
              style: "currency",
              currency: "BRL",
            })}
            onChangeText={(text) =>
              setValor(Number(text.replace(/\D/g, "")) / 100)
            }
            placeholder="Valor do cheque"
            keyboardType="numeric"
          />
        </View>
      </Card>
      <Card
        titulo="Datas"
        subTitulo="Selecione as datas de emissão, vencimento e pagamento"
      >
        <View style={{ gap: 10 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            Data de emissão
          </Text>
          <DataPicker
            data={emissao}
            setData={setEmissao}
            disabled={!editar || loading}
          />
          <Switch
            disabled={!editar || loading}
            titulo="Possui data de vencimento?"
            opcoes={[
              {
                label: "sim",
                value: "sim",
              },
              {
                label: "não",
                value: "não",
              },
            ]}
            selecionado={vencimento ? 0 : 1}
            setSelecionado={(_, value) => {
              if (value === "sim") {
                setVencimento(new Date());
              } else {
                setVencimento(null);
              }
            }}
          />
          {vencimento && (
            <DataPicker
              data={vencimento}
              setData={setVencimento}
              minimumDate={emissao}
              disabled={!editar || loading}
            />
          )}
          <Switch
            disabled={!editar || loading}
            titulo="Possui data de pagamento?"
            opcoes={[
              {
                label: "sim",
                value: "sim",
              },
              {
                label: "não",
                value: "não",
              },
            ]}
            selecionado={pagamento ? 0 : 1}
            setSelecionado={(_, value) => {
              if (value === "sim") {
                setPagamento(new Date());
              } else {
                setPagamento(null);
              }
            }}
          />
          {pagamento && (
            <DataPicker
              data={pagamento}
              setData={setPagamento}
              minimumDate={emissao}
              disabled={!editar || loading}
            />
          )}
        </View>
      </Card>
      <Card titulo="Opcional" subTitulo="Preencha os campos opcionais">
        <View style={{ gap: 10 }}>
          <Input
            disabled={!editar || loading}
            title="Destinatário"
            text={destinatario}
            onChangeText={(text) => setDestinatario(text)}
            placeholder="Destinatário do cheque"
          />
          <Input
            disabled={!editar || loading}
            title="Descrição"
            text={descricao}
            onChangeText={(text) => setDescricao(text)}
            placeholder="Descrição do cheque"
          />
        </View>
      </Card>
      <Card
        titulo="Status"
        subTitulo="O status é definido automaticamente de acordo com as datas de emissão, vencimento e pagamento"
      >
        <Switch
          disabled={!editar || loading}
          opcoes={statusCheque.map((stt) => ({
            label: stt.label.replace("_", " "),
            value: stt.value,
          }))}
          selecionado={statusCheque.findIndex((stt) => stt.value === status)}
          setSelecionado={(_, value) => setStatus(value as EStatusCheque)}
        />
      </Card>
      {editar && (
        <Card titulo="Permanecer" subTitulo="Permanecer na tela após salvar">
          <Switch
            disabled={!editar || loading}
            opcoes={[
              {
                label: "sim",
                value: "sim",
              },
              {
                label: "não",
                value: "não",
              },
            ]}
            selecionado={permanecer ? 0 : 1}
            setSelecionado={(_, value) => {
              if (value === "sim") {
                setPermanecer(true);
              } else {
                setPermanecer(false);
              }
            }}
          />
        </Card>
      )}
      {permissao.todasPermissoes(
        [EPermissaoAcesso.GERENCIAR_CHEQUES],
        usuario!.permissoes
      ) &&
        editar && (
          <Button
            disabled={!editar || loading}
            loading={loading}
            titulo={params.cheque ? "Salvar" : "Cadastrar"}
            onPress={params.cheque ? salvar : cadastrar}
          />
        )}
      <Button
        disabled={loading}
        titulo="Cancelar"
        onPress={params.cheque ? editar ? ()=>setEditar(false) : navigation.goBack : navigation.goBack}
        type="secondary"
      />
    </ScrollView>
  );
}
