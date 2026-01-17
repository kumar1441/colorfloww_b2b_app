import 'react-native-get-random-values';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { trackEvent, incrementSessionCount } from "../services/analytics";
import "../global.css";

export default function Layout() {
    useEffect(() => {
        incrementSessionCount();
        trackEvent("APP_OPEN");
    }, []);

    return (
        <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="(main)" />
                <Stack.Screen name="camera" options={{ presentation: 'fullScreenModal' }} />
                <Stack.Screen name="result" options={{ presentation: 'fullScreenModal' }} />
            </Stack>
            <StatusBar style="dark" />
        </SafeAreaProvider>
    );
}
