import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import CarteiraRoutes from "./carteira.routes";
import Dashboard from "../screens/dashboard";
import OpcoesRoutes from "./opcoes.routes";
import { View, Text } from "react-native";
import { Image } from "expo-image";

type AppRoutesList = {
  Notificacoes: undefined;
  Dashboard: undefined;
  Carteira: undefined;
  Opcoes: undefined;
};

const { Navigator, Screen } = createBottomTabNavigator<AppRoutesList>();

export default function AppRoutes() {
  return (
    <Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
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
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#399b53",
        tabBarIcon: ({ focused, color, size }) => {
          switch (route.name) {
            case "Notificacoes":
              return (
                <Ionicons
                  name={focused ? "notifications" : "notifications-outline"}
                  size={size}
                  color={color}
                />
              );
            case "Dashboard":
              return (
                <Ionicons
                  name={focused ? "bar-chart" : "bar-chart-outline"}
                  size={size}
                  color={color}
                />
              );
            case "Carteira":
              return (
                <Ionicons
                  name={focused ? "wallet" : "wallet-outline"}
                  size={size}
                  color={color}
                />
              );
            case "Opcoes":
              return (
                <Ionicons
                  name={focused ? "settings" : "settings-outline"}
                  size={size}
                  color={color}
                />
              );
          }
        },
      })}
    >
      <Screen name="Dashboard" component={Dashboard} />
      <Screen
        name="Carteira"
        component={CarteiraRoutes}
        options={{
          headerShown: false,
        }}
      />
      <Screen
        name="Opcoes"
        component={OpcoesRoutes}
        options={{
          headerShown: false,
          tabBarLabel: "Opções",
        }}
      />
    </Navigator>
  );
}
