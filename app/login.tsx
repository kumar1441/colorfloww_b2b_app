import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideArrowLeft, LucideFingerprint } from 'lucide-react-native';
import { AuthService } from '../services/auth';

const { width } = Dimensions.get('window');

/**
 * LoginScreen: Mirror of Onboarding design for consistency with biometric support.
 */
export default function LoginScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);

    useEffect(() => {
        AuthService.isBiometricsSupported().then(setIsBiometricSupported);
    }, []);

    const handleLogin = async () => {
        // Simulated Login
        await AuthService.login({ email: formData.email, name: 'Welcome Back User' });
        router.replace('/(main)/community');
    };

    const handleBiometricLogin = async () => {
        const success = await AuthService.authenticateBiometric();
        if (success) {
            await AuthService.login({ email: 'biometric@user.com', name: 'Biometric User' });
            router.replace('/(main)/community');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-brand-cream dark:bg-brand-cream-dark"
        >
            <SafeAreaView className="flex-1">
                <View className="px-6 pt-4">
                    <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
                        <LucideArrowLeft size={20} color="#697D59" />
                        <Text className="ml-2 text-brand-sage dark:text-brand-sage-dark text-lg font-medium">Back</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">
                    <View className="bg-white dark:bg-brand-charcoal rounded-[32px] p-8 shadow-xl">
                        <Text className="text-3xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark mb-2">Welcome Back</Text>
                        <Text className="text-base text-brand-charcoal-light dark:text-brand-charcoal-light/60 mb-8">Sign in to continue</Text>

                        <View className="mb-5">
                            <Text className="text-[15px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark mb-2">Email</Text>
                            <TextInput
                                className="bg-brand-cream/50 dark:bg-brand-cream-dark/30 border border-brand-charcoal-light/20 dark:border-brand-charcoal-light/10 rounded-xl py-3 px-4 text-base text-brand-charcoal dark:text-brand-charcoal-dark"
                                placeholder="your@email.com"
                                placeholderTextColor="#A1A1A1"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.email}
                                onChangeText={(v) => setFormData({ ...formData, email: v })}
                            />
                        </View>

                        <View className="mb-5">
                            <Text className="text-[15px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark mb-2">Password</Text>
                            <TextInput
                                className="bg-brand-cream/50 dark:bg-brand-cream-dark/30 border border-brand-charcoal-light/20 dark:border-brand-charcoal-light/10 rounded-xl py-3 px-4 text-base text-brand-charcoal dark:text-brand-charcoal-dark"
                                placeholder="Enter your password"
                                placeholderTextColor="#A1A1A1"
                                secureTextEntry
                                value={formData.password}
                                onChangeText={(v) => setFormData({ ...formData, password: v })}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleLogin}
                            activeOpacity={0.8}
                            className="bg-brand-sage dark:bg-brand-sage-dark rounded-2xl py-5 items-center mt-3 mb-6 shadow-md"
                        >
                            <Text className="text-white text-lg font-bold">Sign In</Text>
                        </TouchableOpacity>

                        {isBiometricSupported && (
                            <TouchableOpacity
                                onPress={handleBiometricLogin}
                                activeOpacity={0.8}
                                className="flex-row items-center justify-center py-4 rounded-2xl border-1.5 border-brand-charcoal-light/20 dark:border-brand-charcoal-light/10 mb-6 gap-3"
                            >
                                <LucideFingerprint size={24} color="#697D59" />
                                <Text className="text-brand-sage dark:text-brand-sage-dark text-base font-semibold">Login with Biometrics</Text>
                            </TouchableOpacity>
                        )}

                        <View className="items-center">
                            <Text className="text-sm text-brand-charcoal-light dark:text-brand-charcoal-light/60">
                                Don't have an account? <Text className="text-brand-sage dark:text-brand-sage-dark font-bold" onPress={() => router.replace('/onboarding')}>Sign up</Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({});
