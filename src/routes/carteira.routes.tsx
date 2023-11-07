import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";
import { AuthContext } from "../contexts/auth";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import Carteira from "../screens/carteira";
import { ICheque } from "../types/interfaces";
import CarteiraCriarEditar from "../screens/carteira/criarEditar";

export type CarteiraRoutesList = {
  CarteiraLista: { pesquisa?: string };
  CarteiraAddEdit: { cheque?: ICheque };
};

const { Navigator, Screen } = createNativeStackNavigator<CarteiraRoutesList>();

export default function CarteiraRoutes() {
  const { usuario } = useContext(AuthContext);
  return (
    <Navigator
      initialRouteName="CarteiraLista"
      screenOptions={{
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
        headerTintColor: "#399b53",
        headerTitleStyle: {
          color: "#000",
        },
      }}
    >
      <Screen
        name="CarteiraLista"
        component={Carteira}
        options={{
          title: "Carteira",
        }}
      />
      <Screen
        name="CarteiraAddEdit"
        component={CarteiraCriarEditar}
        options={{
          title: "Cadastro de Cheque",
        }}
      />
    </Navigator>
  );
}
