import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { AuthSession } from "./authGateway";

const sessionKey = "bazzato.auth.session";

export async function loadStoredSession() {
  const value =
    Platform.OS === "web"
      ? await AsyncStorage.getItem(sessionKey)
      : await SecureStore.getItemAsync(sessionKey);

  return value ? (JSON.parse(value) as AuthSession) : null;
}

export async function saveStoredSession(session: AuthSession) {
  const value = JSON.stringify(session);

  if (Platform.OS === "web") {
    await AsyncStorage.setItem(sessionKey, value);
    return;
  }

  await SecureStore.setItemAsync(sessionKey, value);
}

export async function clearStoredSession() {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(sessionKey);
    return;
  }

  await SecureStore.deleteItemAsync(sessionKey);
}
