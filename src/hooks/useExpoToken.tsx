import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";

export default async function useExpoToken() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      Alert.alert(
        "Não foi possível ativar as notificações",
        "Ative as notificações nas configurações do seu celular ou tente novamente.",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Tentar novamente",
            onPress: () => useExpoToken(),
          },
        ],
        { cancelable: false }
      );
      return;
    }
    return await Notifications.getDevicePushTokenAsync();
  }

  return await Notifications.getDevicePushTokenAsync();
}