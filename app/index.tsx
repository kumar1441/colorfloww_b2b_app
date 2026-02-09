import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

    useEffect(() => {
        const checkOnboarding = async () => {
            try {
                const value = await SecureStore.getItemAsync('has_seen_onboarding');
                setHasSeenOnboarding(value === 'true');
            } catch (error) {
                console.error('Error checking onboarding state:', error);
                setHasSeenOnboarding(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkOnboarding();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
                <ActivityIndicator size="large" color="#697D59" />
            </View>
        );
    }

    if (hasSeenOnboarding) {
        return <Redirect href="/(main)/community" />;
    }

    return <Redirect href="/onboarding" />;
}
