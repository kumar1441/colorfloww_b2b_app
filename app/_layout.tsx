import 'react-native-get-random-values';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { trackEvent, incrementSessionCount, AnalyticsService } from "../services/analytics";
import { AuthService } from "../services/auth";
// import { NotificationService } from "../services/notifications";
import { useColorScheme } from "react-native";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import "../global.css";

export default function Layout() {
    const systemColorScheme = useColorScheme();
    const { setColorScheme, colorScheme } = useNativeWindColorScheme();

    useEffect(() => {
        AnalyticsService.init();
        incrementSessionCount();
        trackEvent("APP_OPEN");
        AnalyticsService.identify();
        // NotificationService.setupDailyReminders();
    }, []);

    // Sync NativeWind theme with system theme
    useEffect(() => {
        if (systemColorScheme) {
            setColorScheme(systemColorScheme);
        }
    }, [systemColorScheme]);

    return (
        <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="(main)" />
                <Stack.Screen name="camera" options={{ presentation: 'fullScreenModal' }} />
                <Stack.Screen name="result" options={{ presentation: 'fullScreenModal' }} />
                <Stack.Screen name="popular" />
                <Stack.Screen name="bold" />
                <Stack.Screen name="creators" />
                <Stack.Screen name="signup" options={{ presentation: 'fullScreenModal' }} />
                <Stack.Screen name="login" options={{ presentation: 'fullScreenModal' }} />
                <Stack.Screen name="settings" />
                <Stack.Screen name="edit-profile" />
                <Stack.Screen name="awards" />
            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </SafeAreaProvider>
    );
}
