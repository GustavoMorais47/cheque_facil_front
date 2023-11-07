import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Image } from "expo-image";
import Input from "../../components/input";
import mascaraCPF from "../../utils/mascaraCPF";
import { useEffect, useState } from "react";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import Button from "../../components/button";
import pkg from "../../../package.json";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { PublicoRoutesList } from "../../routes/publico.routes";
import { showMessage } from "react-native-flash-message";
import services from "../../services";
import useExpoToken from "../../hooks/useExpoToken";

export default function Cadastro() {
  const navigation = useNavigation<NavigationProp<PublicoRoutesList>>();
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostarSenha, setMostrarSenha] = useState(false);
  const [mostarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const setExpoToken = async () => {
    setExpoPushToken(await useExpoToken());
  };

  const cadastrar = async () => {
    if (nome.trim().length < 3) {
      showMessage({
        type: "warning",
        icon: "warning",
        message: "Nome inválido",
        description: "O nome deve conter pelo menos 3 caracteres",
      });
      return;
    }
    if (cpf.length !== 11) {
      showMessage({
        type: "warning",
        icon: "warning",
        message: "CPF inválido",
        description: "O CPF deve conter 11 caracteres",
      });
      return;
    }
    if (
      email.trim().length < 3 ||
      !email.includes("@") ||
      !email.includes(".")
    ) {
      showMessage({
        type: "warning",
        icon: "warning",
        message: "E-mail inválido",
        description: "Digite um e-mail válido",
      });
      return;
    }
    if (
      senha.length < 8 ||
      !senha.match(/[a-z]/g) ||
      !senha.match(/[A-Z]/g) ||
      !senha.match(/[0-9]/g) ||
      !senha.match(/[^a-zA-Z0-9]/g)
    ) {
      showMessage({
        type: "warning",
        icon: "warning",
        message: "Senha inválida",
        description:
          "A senha deve conter no mínimo 8 caracteres, uma letra minúscula, uma letra maiúscula, um número e um caractere especial",
        duration: 3000,
      });
      return;
    }
    if (senha !== confirmarSenha) {
      showMessage({
        type: "warning",
        icon: "warning",
        message: "Senhas diferentes",
        description: "As senhas devem ser iguais",
      });
      return;
    }
    if (!expoPushToken) {
      await setExpoToken();
      return showMessage({
        type: "warning",
        icon: "warning",
        message: "Atenção!",
        description: "Tentando novamente!",
      });
    }

    setLoading(true);
    await services
      .registro(nome, cpf, email, senha, expoPushToken)
      .then((res) => {
        showMessage({
          type: "success",
          icon: "success",
          message: res,
          description: "Faça login para acessar sua conta",
        });
        return navigation.goBack();
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
  };

  useEffect(() => {
    setExpoToken();
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
                Cadastre-se
              </Text>
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "300",
                  marginHorizontal: 20,
                  color: "#000",
                }}
              >
                É novo por aqui? Faça seu cadastro e aproveite o melhor da nossa
                plataforma!
              </Text>
            </View>
            <View
              style={{
                gap: 10,
              }}
            >
              <Input
                disabled={loading}
                title="Nome Completo"
                titleColor="#000"
                text={nome}
                onChangeText={(text) =>
                  setNome(text.replace(/[^a-zA-Z ]/g, ""))
                }
                placeholder="Digite seu nome completo"
                iconLeft={
                  <FontAwesome name="user" size={16} color="rgba(0,0,0,0.3)" />
                }
              />
              <Input
                disabled={loading}
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
                disabled={loading}
                title="E-mail"
                titleColor="#000"
                text={email}
                onChangeText={setEmail}
                placeholder="Digite seu e-mail"
                keyboardType="email-address"
                iconLeft={
                  <MaterialIcons
                    name="email"
                    size={16}
                    color="rgba(0,0,0,0.3)"
                  />
                }
              />
              <Input
                disabled={loading}
                title="Senha"
                titleColor={"#000"}
                text={senha}
                onChangeText={(text) => setSenha(text.replace(/\s/g, ""))}
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
              {senha.length > 0 && (
                <View>
                  {senha.length < 8 && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <FontAwesome name={"close"} size={16} color={"#AE0000"} />
                      <Text
                        style={{
                          textAlign: "right",
                          fontSize: 12,
                          fontWeight: "300",
                          color: "#000",
                        }}
                      >
                        Mínimo de 8 caracteres
                      </Text>
                    </View>
                  )}
                  {!senha.match(/[a-z]/g) && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <FontAwesome name={"close"} size={16} color={"#AE0000"} />
                      <Text
                        style={{
                          textAlign: "right",
                          fontSize: 12,
                          fontWeight: "300",
                          color: "#000",
                        }}
                      >
                        Pelo menos uma letra minúscula
                      </Text>
                    </View>
                  )}
                  {!senha.match(/[A-Z]/g) && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <FontAwesome name={"close"} size={16} color={"#AE0000"} />
                      <Text
                        style={{
                          textAlign: "right",
                          fontSize: 12,
                          fontWeight: "300",
                          color: "#000",
                        }}
                      >
                        Pelo menos uma letra maiúscula
                      </Text>
                    </View>
                  )}
                  {!senha.match(/[0-9]/g) && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <FontAwesome name={"close"} size={16} color={"#AE0000"} />
                      <Text
                        style={{
                          textAlign: "right",
                          fontSize: 12,
                          fontWeight: "300",
                          color: "#000",
                        }}
                      >
                        Pelo menos um número
                      </Text>
                    </View>
                  )}
                  {!senha.match(/[^a-zA-Z0-9]/g) && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <FontAwesome name={"close"} size={16} color={"#AE0000"} />
                      <Text
                        style={{
                          textAlign: "right",
                          fontSize: 12,
                          fontWeight: "300",
                          color: "#000",
                        }}
                      >
                        Pelo menos um caractere especial
                      </Text>
                    </View>
                  )}
                </View>
              )}
              <Input
                disabled={loading}
                title="Confirmar Senha"
                titleColor={"#000"}
                text={confirmarSenha}
                onChangeText={(text) =>
                  setConfirmarSenha(text.replace(/\s/g, ""))
                }
                placeholder="Digite sua senha novamente"
                secureTextEntry={!mostarConfirmarSenha}
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
                    onPress={() =>
                      setMostrarConfirmarSenha(!mostarConfirmarSenha)
                    }
                  >
                    <FontAwesome
                      name={mostarConfirmarSenha ? "eye-slash" : "eye"}
                      size={16}
                      color="rgba(0,0,0,0.3)"
                    />
                  </TouchableOpacity>
                }
              />
              {senha !== confirmarSenha && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <FontAwesome name={"close"} size={16} color={"#AE0000"} />
                  <Text
                    style={{
                      textAlign: "right",
                      fontSize: 12,
                      fontWeight: "300",
                      color: "#000",
                    }}
                  >
                    As senhas devem ser iguais
                  </Text>
                </View>
              )}
            </View>
            <View></View>
            <View
              style={{
                height: 90,
                gap: 10,
              }}
            >
              <Button
                titulo="Cadastrar"
                onPress={cadastrar}
                loading={loading}
              />
              <Button
                titulo="Já tenho uma conta"
                onPress={() => navigation.goBack()}
                disabled={loading}
                type="secondary"
              />
            </View>
          </View>
          <View
            style={{
              alignSelf: "center",
              opacity: 0.5,
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
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
