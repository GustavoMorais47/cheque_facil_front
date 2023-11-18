import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Alert,
} from "react-native";
import pkg from "../../../package.json";
import { useContext, useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import Input from "../../components/input";
import { Image } from "expo-image";
import { showMessage } from "react-native-flash-message";
import services from "../../services";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../../contexts/auth";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { PublicoRoutesList } from "../../routes/publico.routes";
import Button from "../../components/button";
import mascaraCPF from "../../utils/mascaraCPF";
import { IUsuario } from "../../types/interfaces";
import * as Network from "expo-network";

export default function Login() {
  const navigation = useNavigation<NavigationProp<PublicoRoutesList>>();
  const { setToken, setUsuario } = useContext(AuthContext);
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [mostarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [conn, setConn] = useState(false);

  const checkLogin = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("usuario");
    if (token && user) {
      await services
        .get({
          route: "/ping-auth",
          props: { setToken, setUsuario },
        })
        .then(() => {
          setToken(token);
          setUsuario(JSON.parse(user));
          showMessage({
            message: "Login realizado com sucesso!",
            type: "success",
            icon: "success",
          });
        })
        .catch(async (erro) => {
          showMessage({
            type: "danger",
            icon: "danger",
            message: "Ops!",
            description: erro as string,
          });
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("usuario");
        });
    }
    setLoading(false);
  };

  const login = async (desconectar: boolean) => {
    if (cpf.length === 0 || senha.trim().length === 0) {
      return showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção!",
        description: "Preencha todos os campos!",
      });
    }

    if (cpf.length !== 11) {
      return showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção!",
        description: "CPF deve conter 11 dígitos!",
      });
    }
    setLoading(true);
    await services
      .login(cpf, senha, desconectar)
      .then(async ({ token, mensagem }) => {
        await AsyncStorage.setItem("token", token);
        setToken(token);

        const usuario = await services.get<IUsuario>({
          route: "/me",
          props: { setToken, setUsuario },
        });

        await AsyncStorage.setItem("usuario", JSON.stringify(usuario));
        setUsuario(usuario);

        showMessage({
          type: "success",
          icon: "success",
          message: mensagem,
        });
      })
      .catch(async (error) => {
        if (error === "Usuário já está logado") {
          Alert.alert(
            "Atenção!",
            "Foi detectado que você já está logado em outro dispositivo. Deseja continuar?",
            [
              {
                text: "Não",
                style: "cancel",
              },
              {
                text: "Sim",
                onPress: () => {
                  login(true);
                },
              },
            ],
            { cancelable: false }
          );
          return;
        }
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        return showMessage({
          type: "danger",
          icon: "danger",
          message: "Ops!",
          description: error as string,
          duration: 1500,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    checkLogin();
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboard(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboard(false);
      }
    );

    const interval = setInterval(async () => {
      await services
        .get({
          route: "/",
          props: { setToken, setUsuario },
        })
        .then(() => {
          setConn(true);
        })
        .catch(() => {
          setConn(false);
        });
    }, 5000);

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
      clearInterval(interval);
    };
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flex: 1,
        }}
      >
        <ScrollView
          style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
          contentContainerStyle={{
            flex: 1,
            justifyContent: "center",
          }}
        >
          <View style={{ gap: 10 }}>
            <View
              style={{
                alignSelf: "center",
                gap: 5,
              }}
            >
              <View
                style={{
                  height: 120,
                  width: 120,
                  borderRadius: 10,
                  alignSelf: "center",
                }}
              >
                <Image
                  source={require("../../../assets/icone.png")}
                  style={{ height: "100%", width: "100%" }}
                  cachePolicy={"memory-disk"}
                />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  textAlign: "center",
                  color: "#399b53",
                }}
              >
                Bem vindo(a)!
              </Text>
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "300",
                  marginHorizontal: 20,
                  color: "#000",
                }}
              >
                Antes de começar, precisamos que você se identifique.
              </Text>
            </View>
            <View
              style={{
                gap: 10,
              }}
            >
              <Input
                title="CPF"
                titleColor="#000"
                text={mascaraCPF(cpf)}
                onChangeText={(text) => setCpf(text.replace(/\D/g, ""))}
                placeholder="Digite seu CPF"
                keyboardType="numeric"
                maxLength={14}
                iconLeft={
                  <FontAwesome name="user" size={16} color="rgba(0,0,0,0.3)" />
                }
              />
              <Input
                title="Senha"
                titleColor={"#000"}
                text={senha}
                onChangeText={setSenha}
                placeholder="Digite sua senha"
                secureTextEntry={!mostarSenha}
                iconLeft={
                  <FontAwesome name="lock" size={16} color="rgba(0,0,0,0.3)" />
                }
                iconRight={
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={{
                      height: "100%",
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={() => setMostrarSenha(!mostarSenha)}
                  >
                    <FontAwesome
                      name={mostarSenha ? "eye-slash" : "eye"}
                      size={16}
                      color="rgba(0,0,0,0.3)"
                    />
                  </TouchableOpacity>
                }
              />
            </View>
            <View
              style={{
                gap: 10,
              }}
            >
              <View
                style={{
                  height: 40,
                }}
              >
                <Button
                  titulo="Entrar"
                  onPress={() => login(false)}
                  loading={loading}
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate("Cadastro")}
              >
                <Text
                  style={{
                    textAlign: "center",
                  }}
                >
                  Ainda não tem uma conta?{" "}
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: "#399b53",
                    }}
                  >
                    Cadastre-se
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {!keyboard && (
            <TouchableOpacity
              onLongPress={async () => {
                Alert.alert(
                  "Informações",
                  `Rede: ${(await Network.getNetworkStateAsync()).type} (${
                    (await Network.getNetworkStateAsync()).isConnected
                      ? "Conectado"
                      : "Desconectado"
                  })\nServidor: ${process.env.EXPO_PUBLIC_API_URL}

                  `
                );
              }}
              style={{
                alignSelf: "center",
                opacity: 0.5,
                position: "absolute",
                bottom: 20,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: "300",
                }}
              >
                v{pkg.version}
              </Text>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: "300",
                }}
              >
                © {new Date().getFullYear()} -{" "}
                <Text style={{ fontWeight: "bold", color: "#000" }}>
                  {pkg.author.name}
                </Text>
              </Text>
              {!conn&&(<Text
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: "300",
                }}
              >
                Sem conexão com o servidor
              </Text>)}
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
