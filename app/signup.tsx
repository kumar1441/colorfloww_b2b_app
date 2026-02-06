import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LucideArrowLeft } from 'lucide-react-native';
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
        password: ""
    });

    const handleBack = () => {
        router.back();
    };

    const handleSignup = async () => {
        if (!formData.email || !formData.password) {
            setError("Please fill in all fields");
            return;
        }

        console.log(`[SignupScreen] Starting signup for: ${formData.email}`);
        setLoading(true);
        setError(null);
        try {
            // 1. Auth Sign Up
            // Use email prefix as a default name
            const defaultName = formData.email.split('@')[0];
            const user = await AuthService.signUp(formData.email, formData.password, defaultName);
            console.log(`[SignupScreen] Auth signup successful. User ID: ${user?.id}`);

            // 2. Save User Profile
            const referralCode = AuthService.generateReferralCode();
            await AuthService.saveUserProfile({
                email: formData.email,
                referral_code: referralCode
            }, user?.id);

            await AnalyticsService.identify();

            console.log(`[SignupScreen] Profile saved successfully`);

            // 3. Grant Gamification Rewards
            try {
                await GamificationService.grantAward('verified_artist');
                await GamificationService.awardXP(150, 'studio_calibration_complete');
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
            className="flex-1 bg-brand-cream dark:bg-brand-cream-dark"
        >
            <SafeAreaView className="flex-1" edges={['bottom', 'left', 'right']}>
                <View style={{ paddingTop: Math.max(insets.top, 16) }} className="px-6">
                    <TouchableOpacity onPress={handleBack} className="flex-row items-center">
                        <LucideArrowLeft size={20} color="#697D59" />
                        <Text className="ml-2 text-brand-sage dark:text-brand-sage-dark text-lg font-medium">Back</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 24 + insets.bottom }} keyboardShouldPersistTaps="handled">
                    <View className="bg-white dark:bg-brand-charcoal rounded-[40px] p-10 shadow-2xl">
                        <Text className="text-4xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark mb-3">
                            Create Account
                        </Text>

                        <Text className="text-lg text-brand-charcoal-light dark:text-brand-charcoal-light/60 mb-6 leading-6">
                            Start your journey with just your email and password.
                        </Text>

                        {error && (
                            <View className="bg-red-50 p-4 rounded-2xl mb-6 border border-red-100">
                                <Text className="text-red-600 text-center font-medium">{error}</Text>
                            </View>
                        )}

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

                        <View className="mb-8">
                            <Text className="text-[17px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark mb-3">Password</Text>
                            <TextInput
                                className="bg-brand-cream/30 dark:bg-brand-cream-dark/20 border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/10 rounded-2xl py-4 px-5 text-lg text-brand-charcoal dark:text-brand-charcoal-dark"
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
                            className={`bg-[#697D59] rounded-2xl py-6 items-center shadow-lg ${loading ? 'opacity-70' : ''}`}
                        >
                            <Text className="text-white text-xl font-bold">
                                {loading ? "Signing up..." : "Complete"}
                            </Text>
                        </TouchableOpacity>

                        <View className="items-center mt-8">
                            <Text className="text-base text-brand-charcoal-light dark:text-brand-charcoal-light/60">
                                Already have an account? <Text className="text-brand-sage dark:text-brand-sage-dark font-bold underline" onPress={() => router.push('/login')}>Log in</Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}
