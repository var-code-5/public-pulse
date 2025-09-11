import { Stack } from "expo-router";
import "./../global.css";
import { AppProvider } from "../context";

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
      </Stack>
    </AppProvider>
  );
}
