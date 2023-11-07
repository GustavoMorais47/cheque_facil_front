import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface Props {
  titulo: string;
  onPress: () => void;
  loading?: boolean;
  type?: "primary" | "secondary";
  disabled?: boolean;
}

export default function Button({
  titulo,
  onPress,
  loading = false,
  type = "primary",
  disabled = false,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled !== undefined ? disabled : loading}
      style={{
        flex: 1,
        backgroundColor: type === "primary" ? "#399b53" : undefined,
        height: 40,
        paddingHorizontal: 10,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={type === "primary" ? "#fff" : "#399b53"}
        />
      ) : (
        <Text
          style={{
            fontSize: 16,
            color: type === "primary" ? "#fff" : "#399b53",
            fontWeight: "bold",
          }}
        >
          {titulo}
        </Text>
      )}
    </TouchableOpacity>
  );
}
