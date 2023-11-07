import {
  Modal,
  SafeAreaView,
  TouchableOpacity,
  View,
  Text,
} from "react-native";

interface Props {
  mostrar: boolean;
  setMostrar: (mostrar: boolean) => void;
  children: React.ReactNode;
  titulo?: string;
  mostrarFechar?: boolean;
}

export default function NovoModal({
  mostrar,
  setMostrar,
  children,
  titulo,
  mostrarFechar = true,
}: Props) {
  return (
    <Modal transparent visible={mostrar} animationType="fade">
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            minWidth: "20%",
            minHeight: "10%",
            maxWidth: "90%",
            maxHeight: "75%",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            padding: 20,
            gap: 20,
          }}
        >
          {titulo && (
            <Text
              numberOfLines={2}
              style={{
                fontSize: 18,
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {titulo}
            </Text>
          )}
          {children}
          {mostrarFechar&&(<View>
            <TouchableOpacity
              onPress={() => setMostrar(false)}
              style={{
                height: 40,
                paddingHorizontal: 10,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#399b53", fontWeight: "bold" }}>
                Fechar
              </Text>
            </TouchableOpacity>
          </View>)}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
