import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const secureStore = {
  setItemAsync: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error("SecureStore web fallback error:", e);
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  getItemAsync: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.error("SecureStore web fallback error:", e);
        return null;
      }
    }
    return await SecureStore.getItemAsync(key);
  },

  deleteItemAsync: async (key: string): Promise<void> => {
    if (Platform.OS === "web") {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error("SecureStore web fallback error:", e);
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
