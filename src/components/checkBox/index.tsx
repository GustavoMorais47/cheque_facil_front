import { TouchableOpacity, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface IProps {
  checked: boolean;
  setChecked: React.Dispatch<React.SetStateAction<boolean>>;
  label: string;
  disabled?: boolean;
}

export default function CheckBox({
  checked,
  setChecked,
  label,
  disabled,
}: IProps) {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={() => setChecked(!checked)}
      style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
    >
      <FontAwesome
        name={checked ? "check-square" : "square-o"}
        size={20}
        color={!disabled ? "#399b53" : "#ccc"}
      />
      <Text
        style={{
          textTransform: "capitalize",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
