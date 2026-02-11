import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideArrowLeft, LucideSparkles } from 'lucide-react-native';
import { AuthService } from '../services/auth';
import { AnalyticsService } from '../services/analytics';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        if (!formData.email || !formData.password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await AuthService.login(formData.email, formData.password);
            await AnalyticsService.identify();
            router.replace('/(main)/community');
        } catch (err: any) {
            setError(err.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-brand-peach dark:bg-brand-peach-dark"
        >
            <SafeAreaView className="flex-1" edges={['bottom', 'left', 'right']}>
                <View style={{ paddingTop: Math.max(insets.top, 16) }} className="px-6">
                    <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
                        <LucideArrowLeft size={20} color="#307b75" />
                        <Text className="ml-2 text-brand-teal dark:text-brand-teal text-lg font-medium">Back</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">
                    <View className="bg-white dark:bg-brand-gray rounded-[40px] p-10 shadow-2xl">
                        <View className="items-center mb-8">
                            <View className="w-20 h-20 bg-brand-teal-light dark:bg-brand-teal/20 rounded-full items-center justify-center mb-4">
                                <LucideSparkles size={40} color="#307b75" />
                            </View>
                            <Text className="text-4xl font-bold text-brand-gray dark:text-brand-gray-light mb-2">Welcome Back</Text>
                            <Text className="text-lg text-brand-gray-medium dark:text-brand-gray-light/60">Log in to your account</Text>
                        </View>

                        {error && (
                            <View className="bg-red-50 p-4 rounded-2xl mb-6 border border-red-100">
                                <Text className="text-red-600 text-center font-medium">{error}</Text>
                            </View>
                        )}

                        <View className="mb-6">
                            <Text className="text-[17px] font-semibold text-brand-gray dark:text-brand-gray-light mb-3">Email</Text>
                            <TextInput
                                className="bg-brand-peach-light/50 dark:bg-brand-peach-dark/20 border border-brand-gray-medium/10 dark:border-brand-gray-medium/10 rounded-2xl py-4 px-5 text-lg text-brand-gray dark:text-brand-gray-light"
                                placeholder="your@email.com"
                                placeholderTextColor="#A1A1A1"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.email}
                                onChangeText={(v) => setFormData({ ...formData, email: v })}
                            />
                        </View>

                        <View className="mb-10">
                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-[17px] font-semibold text-brand-gray dark:text-brand-gray-light">Password</Text>
                                <TouchableOpacity onPress={async () => {
                                    if (!formData.email) {
                                        setError("Please enter your email first");
                                        return;
                                    }
                                    try {
                                        await AuthService.resetPassword(formData.email);
                                        Alert.alert("Reset Link Sent", "Check your email for instructions to reset your password.");
                                    } catch (err: any) {
                                        setError(err.message || "Failed to send reset link");
                                    }
                                }}>
                                    <Text className="text-brand-teal dark:text-brand-teal font-semibold text-sm">Forgot Password?</Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                className="bg-brand-peach-light/50 dark:bg-brand-peach-dark/20 border border-brand-gray-medium/10 dark:border-brand-gray-medium/10 rounded-2xl py-4 px-5 text-lg text-brand-gray dark:text-brand-gray-light"
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
                            disabled={loading}
                            className={`bg-brand-teal dark:bg-brand-teal-dark rounded-2xl py-6 items-center shadow-lg ${loading ? 'opacity-70' : ''}`}
                        >
                            <Text className="text-white text-xl font-bold">{loading ? "Logging in..." : "Log In"}</Text>
                        </TouchableOpacity>

                        <View className="items-center mt-8">
                            <Text className="text-base text-brand-gray-medium dark:text-brand-gray-light/60">
                                Don't have an account? <Text className="text-brand-teal dark:text-brand-teal font-bold underline" onPress={() => router.push('/signup')}>Sign up</Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}
