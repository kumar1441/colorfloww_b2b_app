import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideSparkles } from 'lucide-react-native';
import { AuthService } from '../services/auth';
import { useEffect, useState } from 'react';

const { width } = Dimensions.get('window');

/**
 * WelcomeScreen: Static premium version. 
 * Re-enables high-end aesthetics while keeping it standard/safe (no Reanimated).
 */
export default function WelcomeScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const loggedIn = await AuthService.isLoggedIn();
        if (loggedIn) {
            router.replace('/(main)/community');
        } else {
            setIsLoading(false);
        }
    };

    if (isLoading) return <View className="flex-1 bg-brand-cream dark:bg-brand-cream-dark" />;

    return (
        <View className="flex-1 bg-brand-cream dark:bg-brand-cream-dark">
            <SafeAreaView className="flex-1 items-center justify-center p-6">
                <View className="mb-12">
                    <View className="w-32 h-32 bg-white dark:bg-brand-charcoal rounded-full items-center justify-center shadow-xl">
                        <LucideSparkles
                            size={64}
                            color="#697D59"
                            strokeWidth={1.5}
                        />
                    </View>
                </View>

                <View className="items-center max-w-xs">
                    <Text className="text-6xl font-light text-brand-charcoal dark:text-brand-charcoal-dark mb-4">Colorfloww</Text>
                    <Text className="text-lg text-[#5A5A5A] dark:text-brand-charcoal-light/80 text-center leading-relaxed mb-12">
                        Visualize your perfect nail polish color with AI-powered virtual try-on
                    </Text>
                </View>

                <View className="w-full items-center">
                    <TouchableOpacity
                        onPress={() => router.push('/onboarding')}
                        activeOpacity={0.8}
                        className="w-full bg-brand-sage dark:bg-brand-sage-dark py-5 rounded-full items-center shadow-lg"
                    >
                        <Text className="text-white text-lg font-bold">Get Started</Text>
                    </TouchableOpacity>

                    <Text className="mt-6 text-brand-charcoal-light text-sm">
                        Join thousands of users discovering their perfect shade
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({});
