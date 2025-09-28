
import { Stack, router } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SystemBars } from "react-native-edge-to-edge";
import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { storageService } from "@/services/storageService";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      // Initialize default sections on app start
      storageService.initializeDefaultSections();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <SystemBars style="dark" />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="item/[id]" 
            options={{ 
              title: 'Предмет',
              presentation: 'modal'
            }} 
          />
          <Stack.Screen 
            name="add-item" 
            options={{ 
              title: 'Добавить предмет',
              presentation: 'modal'
            }} 
          />
          <Stack.Screen 
            name="add-section" 
            options={{ 
              title: 'Добавить раздел',
              presentation: 'modal'
            }} 
          />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
