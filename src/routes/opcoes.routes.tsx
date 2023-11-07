import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Opcoes from "../screens/opcoes";
import { useContext } from "react";
import { AuthContext } from "../contexts/auth";
import { EPermissaoAcesso } from "../types/enum";
import GerenciarAcessos from "../screens/gerenciar/acesso";
import GerenciarPermissoes from "../screens/gerenciar/permissao";
import permissao from "../utils/permissao";
import { Image } from "expo-image";
import { View, Text } from "react-native";
import { IAcesso, IBanco, IContaBancaria, IResponsavel } from "../types/interfaces";
import GerenciarAcessosCriarEditar from "../screens/gerenciar/acesso/criarEditar";
import GerenciarResponsaveis from "../screens/gerenciar/responsavel";
import GerenciarResponsaveisCriarEditar from "../screens/gerenciar/responsavel/criarEditar";
import GerenciarPermissoesCriarEditar from "../screens/gerenciar/permissao/criarEditar";
import GerenciarBancos from "../screens/gerenciar/banco";
import GerenciarBancosCriarEditar from "../screens/gerenciar/banco/criarEditar";
import GerenciarContaBancaria from "../screens/gerenciar/conta_bancaria";
import GerenciarContasBancariasCriarEditar from "../screens/gerenciar/conta_bancaria/criarEditar";

export type OpcoesRoutesList = {
  OpcoesIndex: undefined;
  GerenciarAcessos: undefined;
  GerenciarAcessosAddEdit: { acesso?: IAcesso };
  GerenciarPermissoes: undefined;
  GerenciarPermissoesAddEdit: { acesso: IAcesso };
  GerenciarResponsaveis: undefined;
  GerenciarResponsaveisAddEdit: { responsavel?: IResponsavel };
  GerenciarBancos: undefined;
  GerenciarBancosAddEdit: { banco?: IBanco };
  GerenciarContasBancarias: undefined;
  GerenciarContasBancariasAddEdit: {conta?: IContaBancaria};
};

const { Navigator, Group, Screen } =
  createNativeStackNavigator<OpcoesRoutesList>();

export default function OpcoesRoutes() {
  const { usuario } = useContext(AuthContext);
  return (
    <Navigator
      initialRouteName="OpcoesIndex"
      screenOptions={({ route }) => ({
        animation: "slide_from_right",
        headerTitle: ({ children, tintColor }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Image
              source={require("../../assets/icone.png")}
              style={{
                width: 35,
                height: 35,
              }}
              cachePolicy={"memory-disk"}
              contentFit="contain"
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              {children}
            </Text>
          </View>
        ),
        headerTitleAlign: "left",
        headerTintColor: "#399b53",
        headerTitleStyle: {
          color: "#000",
        },
      })}
    >
      <Screen
        name="OpcoesIndex"
        component={Opcoes}
        options={{
          title: "Opções",
        }}
      />
      {permissao.todasPermissoes(
        [EPermissaoAcesso.GERENCIAR_ACESSOS],
        usuario!.permissoes
      ) && (
        <Group>
          <Screen
            name="GerenciarAcessos"
            component={GerenciarAcessos}
            options={{
              title: "Acessos",
            }}
          />
          <Screen
            name="GerenciarAcessosAddEdit"
            component={GerenciarAcessosCriarEditar}
            options={{
              title: "Criar Acesso",
            }}
          />
        </Group>
      )}
      {permissao.todasPermissoes(
        [EPermissaoAcesso.GERENCIAR_PERMISSOES],
        usuario!.permissoes
      ) && (
        <Group>
          <Screen
            name="GerenciarPermissoes"
            component={GerenciarPermissoes}
            options={{
              title: "Permissões",
            }}
          />
          <Screen
            name="GerenciarPermissoesAddEdit"
            component={GerenciarPermissoesCriarEditar}
            options={{
              title: "Atribuir Permissões",
            }}
          />
        </Group>
      )}
      {permissao.todasPermissoes(
        [EPermissaoAcesso.GERENCIAR_RESPONSAVEIS],
        usuario!.permissoes
      ) && (
        <Group>
          <Screen
            name="GerenciarResponsaveis"
            component={GerenciarResponsaveis}
            options={{
              title: "Responsáveis",
            }}
          />
          <Screen
            name="GerenciarResponsaveisAddEdit"
            component={GerenciarResponsaveisCriarEditar}
            options={{
              title: "Criar Responsável",
            }}
          />
        </Group>
      )}
      {permissao.todasPermissoes(
        [EPermissaoAcesso.GERENCIAR_BANCOS],
        usuario!.permissoes
      ) && (
        <Group>
          <Screen
            name="GerenciarBancos"
            component={GerenciarBancos}
            options={{
              title: "Bancos",
            }}
          />
          <Screen
            name="GerenciarBancosAddEdit"
            component={GerenciarBancosCriarEditar}
            options={{
              title: "Criar Banco",
            }}
          />
        </Group>
      )}
      {permissao.todasPermissoes(
        [EPermissaoAcesso.GERENCIAR_CONTAS_BANCARIAS],
        usuario!.permissoes
      ) && (
        <Group>
          <Screen
          name="GerenciarContasBancarias"
          component={GerenciarContaBancaria}
          options={{
            title: "Contas",
          }}
        />
        <Screen
          name="GerenciarContasBancariasAddEdit"
          component={GerenciarContasBancariasCriarEditar}
          options={{
            title: "Contas",
          }}
        />
        </Group>
      )}
    </Navigator>
  );
}

const Ex = () => <></>;
