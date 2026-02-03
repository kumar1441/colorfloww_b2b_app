import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideArrowLeft, LucideSparkles } from 'lucide-react-native';
import { AuthService } from '../services/auth';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleLogin = async () => {
        // Mock login
        await AuthService.login({ email: formData.email, name: "Returning User" });
        router.replace('/(main)/community');
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
                    <View className="bg-white dark:bg-brand-charcoal rounded-[40px] p-10 shadow-2xl">
                        <View className="items-center mb-8">
                            <View className="w-20 h-20 bg-brand-cream dark:bg-brand-cream-dark/20 rounded-full items-center justify-center mb-4">
                                <LucideSparkles size={40} color="#697D59" />
                            </View>
                            <Text className="text-4xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark mb-2">Welcome Back</Text>
                            <Text className="text-lg text-brand-charcoal-light dark:text-brand-charcoal-light/60">Log in to your account</Text>
                        </View>

                        <View className="mb-6">
                            <Text className="text-[17px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark mb-3">Email</Text>
                            <TextInput
                                className="bg-brand-cream/30 dark:bg-brand-cream-dark/20 border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/10 rounded-2xl py-4 px-5 text-lg text-brand-charcoal dark:text-brand-charcoal-dark"
                                placeholder="your@email.com"
                                placeholderTextColor="#A1A1A1"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.email}
                                onChangeText={(v) => setFormData({ ...formData, email: v })}
                            />
                        </View>

                        <View className="mb-10">
                            <Text className="text-[17px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark mb-3">Password</Text>
                            <TextInput
                                className="bg-brand-cream/30 dark:bg-brand-cream-dark/20 border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/10 rounded-2xl py-4 px-5 text-lg text-brand-charcoal dark:text-brand-charcoal-dark"
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
                            className="bg-[#697D59] rounded-2xl py-6 items-center shadow-lg"
                        >
                            <Text className="text-white text-xl font-bold">Log In</Text>
                        </TouchableOpacity>

                        <View className="items-center mt-8">
                            <Text className="text-base text-brand-charcoal-light dark:text-brand-charcoal-light/60">
                                Don't have an account? <Text className="text-brand-sage dark:text-brand-sage-dark font-bold underline" onPress={() => router.push('/signup')}>Sign up</Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}
