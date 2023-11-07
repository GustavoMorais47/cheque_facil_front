import { NavigationContainer } from "@react-navigation/native";
import Auth from "./src/components/auth";
import FlashMessage from "react-native-flash-message";
import AuthProvider from "./src/contexts/auth";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
import { ActivityIndicator, Alert, View } from "react-native";
import * as Updates from "expo-updates";
import { useEffect } from "react";

const prefix = Linking.createURL("/");

const config = {
  screens: {
    Carteira: {
      screens: {
        initialRouteName: "CarteiraLista",
        CarteiraLista: {
          path: "carteira/:pesquisa?",
          parse: {
            pesquisa: (pesquisa: string) => `${pesquisa.replaceAll("_", " ")}`,
          },
          stringify: {
            pesquisa: (pesquisa: string) => pesquisa.replace(/^pesquisa-/, ""),
          },
        },
      },
    },
  },
};

const linking = {
  prefixes: [prefix],
  config,
};

export default function App() {
  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        Alert.alert(
          "Atualização disponível",
          "Deseja atualizar o aplicativo agora?",
          [
            {
              text: "Não",
              style: "cancel",
            },
            {
              text: "Sim",
              onPress: async () => {
                await Updates.fetchUpdateAsync(); //Descreva: Baixa a atualização do aplicativo
                await Updates.reloadAsync(); //Descreva: Reinicia o aplicativo
              },
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      Alert.alert(
        "Não foi possível atualizar o aplicativo",
        "Tente novamente mais tarde ou entre em contato com o suporte. Erro: " +
          error
      );
    }
  }

  useEffect(() => {
    onFetchUpdateAsync();
  }, []);
  return (
    <NavigationContainer
      // @ts-ignore
      linking={linking}
      fallback={
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={"#399b53"} />
        </View>
      }
    >
      <StatusBar style="auto" />
      <AuthProvider>
        <Auth />
      </AuthProvider>
      <FlashMessage position="top" />
    </NavigationContainer>
  );
}
