import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LucideArrowLeft, LucideUser, LucideCheck, LucideX, LucideLoader2 } from 'lucide-react-native';
import { AuthService } from '../services/auth';
import { GamificationService } from '../services/gamification';
import { AnalyticsService } from '../services/analytics';

const { width } = Dimensions.get('window');

export default function SignupScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    // State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
        username: ""
    });

    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

    const handleBack = () => {
        router.back();
    };

    const handleUsernameChange = async (username: string) => {
        const cleaned = username.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 20);
        setFormData(prev => ({ ...prev, username: cleaned }));
        setUsernameAvailable(null);

        if (cleaned.length >= 3) {
            setIsCheckingUsername(true);
            try {
                const available = await AuthService.isUsernameAvailable(cleaned);
                setUsernameAvailable(available);
            } catch (err) {
                console.error('[Signup] Username check error:', err);
            } finally {
                setIsCheckingUsername(false);
            }
        }
    };

    const handleSignup = async () => {
        if (!formData.email || !formData.password || !formData.fullName || !formData.username) {
            setError("Please fill in all fields");
            return;
        }

        if (usernameAvailable === false) {
            setError("Username is already taken");
            return;
        }

        if (formData.username.length < 3) {
            setError("Username must be at least 3 characters");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // 1. Auth Sign Up
            const user = await AuthService.signUp(formData.email, formData.password, formData.fullName);

            // 2. Save User Profile
            const referralCode = AuthService.generateReferralCode();
            await AuthService.saveUserProfile({
                email: formData.email,
                username: formData.username,
                fullName: formData.fullName,
                referral_code: referralCode
            }, user?.id);

            await AnalyticsService.identify();

            // 3. Grant Gamification Rewards
            try {
                await GamificationService.grantAward('verified_artist');
                await GamificationService.awardKarma(150, 'welcome_bonus');
            } catch (gamifyErr) {
                console.error(`[SignupScreen] Gamification error (non-blocking):`, gamifyErr);
            }

            if (params.returnTo) {
                router.replace({
                    //@ts-ignore
                    pathname: params.returnTo,
                    params: { color: params.color }
                });
            } else {
                router.replace('/(main)/community');
            }
        } catch (err: any) {
            console.error(`[SignupScreen] Signup error:`, err);
            setError(err.message || "An error occurred during signup");
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
                    <TouchableOpacity onPress={handleBack} className="flex-row items-center">
                        <LucideArrowLeft size={20} color="#307b75" />
                        <Text className="ml-2 text-brand-teal dark:text-brand-teal-dark text-lg font-medium">Back</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 24 + insets.bottom }} keyboardShouldPersistTaps="handled">
                    <View className="bg-white dark:bg-brand-gray rounded-[40px] p-10 shadow-2xl">
                        <Text className="text-4xl font-bold text-brand-gray dark:text-brand-gray-light mb-3">
                            Create Account
                        </Text>

                        <Text className="text-lg text-brand-gray-medium dark:text-brand-gray-medium/60 mb-6 leading-6">
                            Start your journey with just your email and password.
                        </Text>

                        {error && (
                            <View className="bg-red-50 p-4 rounded-2xl mb-6 border border-red-100">
                                <Text className="text-red-600 text-center font-medium">{error}</Text>
                            </View>
                        )}

                        <View className="mb-6">
                            <Text className="text-[17px] font-semibold text-brand-gray dark:text-brand-gray-light mb-3">Full Name</Text>
                            <View className="flex-row items-center bg-brand-peach/30 dark:bg-brand-peach-dark/20 border border-brand-gray-medium/10 rounded-2xl px-5">
                                <LucideUser size={20} color="#307b75" className="mr-3" />
                                <TextInput
                                    className="flex-1 py-4 text-lg text-brand-gray dark:text-brand-gray-light"
                                    placeholder="Enter your name"
                                    placeholderTextColor="#A1A1A1"
                                    value={formData.fullName}
                                    onChangeText={(v) => setFormData({ ...formData, fullName: v })}
                                />
                            </View>
                        </View>

                        <View className="mb-6">
                            <Text className="text-[17px] font-semibold text-brand-gray dark:text-brand-gray-light mb-3">Username</Text>
                            <View className="flex-row items-center bg-brand-peach/30 dark:bg-brand-peach-dark/20 border border-brand-gray-medium/10 rounded-2xl px-5">
                                <LucideUser size={20} color="#307b75" className="mr-3" />
                                <TextInput
                                    className="flex-1 py-4 text-lg text-brand-gray dark:text-brand-gray-light"
                                    placeholder="choose_a_username"
                                    placeholderTextColor="#A1A1A1"
                                    autoCapitalize="none"
                                    value={formData.username}
                                    onChangeText={handleUsernameChange}
                                />
                                {isCheckingUsername && <LucideLoader2 size={18} color="#307b75" className="animate-spin" />}
                                {!isCheckingUsername && usernameAvailable === true && <LucideCheck size={18} color="#4ADE80" />}
                                {!isCheckingUsername && usernameAvailable === false && <LucideX size={18} color="#F87171" />}
                            </View>
                            {usernameAvailable === false && (
                                <Text className="text-red-500 text-xs mt-1 ml-2">Username is already taken</Text>
                            )}
                        </View>

                        <View className="mb-6">
                            <Text className="text-[17px] font-semibold text-brand-gray dark:text-brand-gray-light mb-3">Email</Text>
                            <TextInput
                                className="bg-brand-peach/30 dark:bg-brand-peach-dark/20 border border-brand-gray-medium/10 dark:border-brand-gray-medium/10 rounded-2xl py-4 px-5 text-lg text-brand-gray dark:text-brand-gray-light"
                                placeholder="your@email.com"
                                placeholderTextColor="#A1A1A1"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.email}
                                onChangeText={(v) => setFormData({ ...formData, email: v })}
                            />
                        </View>

                        <View className="mb-8">
                            <Text className="text-[17px] font-semibold text-brand-gray dark:text-brand-gray-light mb-3">Password</Text>
                            <TextInput
                                className="bg-brand-peach/30 dark:bg-brand-peach-dark/20 border border-brand-gray-medium/10 dark:border-brand-gray-medium/10 rounded-2xl py-4 px-5 text-lg text-brand-gray dark:text-brand-gray-light"
                                placeholder="Create a password"
                                placeholderTextColor="#A1A1A1"
                                secureTextEntry
                                value={formData.password}
                                onChangeText={(v) => setFormData({ ...formData, password: v })}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleSignup}
                            activeOpacity={0.8}
                            disabled={loading}
                            className={`bg-[#307b75] rounded-2xl py-6 items-center shadow-lg ${loading ? 'opacity-70' : ''}`}
                        >
                            <Text className="text-white text-xl font-bold">
                                {loading ? "Signing up..." : "Complete"}
                            </Text>
                        </TouchableOpacity>

                        <View className="items-center mt-8">
                            <Text className="text-base text-brand-gray-medium dark:text-brand-gray-medium/60">
                                Already have an account? <Text className="text-brand-teal dark:text-brand-teal-dark font-bold underline" onPress={() => router.push('/login')}>Log in</Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}
