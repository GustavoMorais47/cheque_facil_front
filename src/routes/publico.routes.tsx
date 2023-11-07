import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../screens/login";
import Cadastro from "../screens/cadastro";

export type PublicoRoutesList = {
  Login: undefined;
  Cadastro: undefined;
};

const { Navigator, Screen } = createNativeStackNavigator<PublicoRoutesList>();

export default function PublicoRoutes() {
  return (
    <Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: "#fff",
        },
      }}
    >
      <Screen name="Login" component={Login} />
      <Screen name="Cadastro" component={Cadastro} />
    </Navigator>
  );
}
