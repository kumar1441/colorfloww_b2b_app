import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideArrowLeft, LucideShieldCheck, LucideCheck } from 'lucide-react-native';
import { AuthService } from '../services/auth';

const { width, height } = Dimensions.get('window');

/**
 * OnboardingScreen: Matches the user-provided design reference precisely.
 * Features a multi-step flow for account creation and profile details.
 */
export default function OnboardingScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [showConsent, setShowConsent] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        age: "",
        gender: "",
        city: "",
        zipcode: ""
    });

    const handleContinue = () => {
        if (step === 1) {
            setStep(2);
        } else {
            setShowConsent(true);
        }
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
        } else {
            router.back();
        }
    };

    const finalizeOnboarding = async () => {
        await AuthService.login(formData);
        setShowConsent(false);
        router.push('/(main)/community');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-brand-cream dark:bg-brand-cream-dark"
        >
            <SafeAreaView className="flex-1">
                <View className="px-6 pt-4">
                    <TouchableOpacity onPress={handleBack} className="flex-row items-center">
                        <LucideArrowLeft size={20} color="#697D59" />
                        <Text className="ml-2 text-brand-sage dark:text-brand-sage-dark text-lg font-medium">Back</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">
                    <View className="bg-white dark:bg-brand-charcoal rounded-[32px] p-8 shadow-xl">
                        <Text className="text-3xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark mb-2">
                            {step === 1 ? "Create Account" : "About You"}
                        </Text>
                        <Text className="text-base text-brand-charcoal-light dark:text-brand-charcoal-light/60 mb-8">
                            {step === 1 ? "Let's get you started" : "Help us personalize your experience"}
                        </Text>

                        {step === 1 ? (
                            <>
                                <View className="mb-5">
                                    <Text className="text-[15px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark mb-2">Full Name</Text>
                                    <TextInput
                                        className="bg-brand-cream/50 dark:bg-brand-cream-dark/30 border border-brand-charcoal-light/20 dark:border-brand-charcoal-light/10 rounded-xl py-3 px-4 text-base text-brand-charcoal dark:text-brand-charcoal-dark"
                                        placeholder="Enter your name"
                                        placeholderTextColor="#A1A1A1"
                                        value={formData.name}
                                        onChangeText={(v) => setFormData({ ...formData, name: v })}
                                    />
                                </View>

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
                                        placeholder="Create a password"
                                        placeholderTextColor="#A1A1A1"
                                        secureTextEntry
                                        value={formData.password}
                                        onChangeText={(v) => setFormData({ ...formData, password: v })}
                                    />
                                </View>
                            </>
                        ) : (
                            <>
                                <View className="flex-row gap-4">
                                    <View className="flex-1 mb-5">
                                        <Text className="text-[15px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark mb-2">Age</Text>
                                        <TextInput
                                            className="bg-brand-cream/50 dark:bg-brand-cream-dark/30 border border-brand-charcoal-light/20 dark:border-brand-charcoal-light/10 rounded-xl py-3 px-4 text-base text-brand-charcoal dark:text-brand-charcoal-dark"
                                            placeholder="25"
                                            placeholderTextColor="#A1A1A1"
                                            keyboardType="numeric"
                                            value={formData.age}
                                            onChangeText={(v) => setFormData({ ...formData, age: v })}
                                        />
                                    </View>
                                    <View className="flex-1 mb-5">
                                        <Text className="text-[15px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark mb-2">Gender</Text>
                                        <TextInput
                                            className="bg-brand-cream/50 dark:bg-brand-cream-dark/30 border border-brand-charcoal-light/20 dark:border-brand-charcoal-light/10 rounded-xl py-3 px-4 text-base text-brand-charcoal dark:text-brand-charcoal-dark"
                                            placeholder="Female"
                                            placeholderTextColor="#A1A1A1"
                                            value={formData.gender}
                                            onChangeText={(v) => setFormData({ ...formData, gender: v })}
                                        />
                                    </View>
                                </View>

                                <View className="mb-5">
                                    <Text className="text-[15px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark mb-2">City Name</Text>
                                    <TextInput
                                        className="bg-brand-cream/50 dark:bg-brand-cream-dark/30 border border-brand-charcoal-light/20 dark:border-brand-charcoal-light/10 rounded-xl py-3 px-4 text-base text-brand-charcoal dark:text-brand-charcoal-dark"
                                        placeholder="New York"
                                        placeholderTextColor="#A1A1A1"
                                        value={formData.city}
                                        onChangeText={(v) => setFormData({ ...formData, city: v })}
                                    />
                                </View>

                                <View className="mb-5">
                                    <Text className="text-[15px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark mb-2">Zipcode</Text>
                                    <TextInput
                                        className="bg-brand-cream/50 dark:bg-brand-cream-dark/30 border border-brand-charcoal-light/20 dark:border-brand-charcoal-light/10 rounded-xl py-3 px-4 text-base text-brand-charcoal dark:text-brand-charcoal-dark"
                                        placeholder="10001"
                                        placeholderTextColor="#A1A1A1"
                                        keyboardType="numeric"
                                        value={formData.zipcode}
                                        onChangeText={(v) => setFormData({ ...formData, zipcode: v })}
                                    />
                                </View>
                            </>
                        )}

                        <TouchableOpacity
                            onPress={handleContinue}
                            activeOpacity={0.8}
                            className="bg-brand-sage dark:bg-brand-sage-dark rounded-2xl py-5 items-center mt-3 mb-6 shadow-md"
                        >
                            <Text className="text-white text-lg font-bold">
                                {step === 1 ? "Continue" : "Finish Set Up"}
                            </Text>
                        </TouchableOpacity>

                        {step === 1 && (
                            <View className="items-center">
                                <Text className="text-sm text-brand-charcoal-light dark:text-brand-charcoal-light/60">
                                    Already have an account? <Text className="text-brand-sage dark:text-brand-sage-dark font-bold" onPress={() => router.replace('/login')}>Log in</Text>
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-row justify-center mt-10 gap-x-2">
                        <View className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-brand-sage dark:bg-brand-sage-dark' : 'bg-brand-charcoal-light/20'}`} />
                        <View className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-brand-sage dark:bg-brand-sage-dark' : 'bg-brand-charcoal-light/20'}`} />
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Consent Modal */}
            <Modal
                visible={showConsent}
                transparent={true}
                animationType="fade"
            >
                <View className="flex-1 bg-black/50 justify-center items-center p-6">
                    <View className="bg-white dark:bg-brand-charcoal rounded-[32px] p-8 w-full items-center shadow-2xl">
                        <View className="w-20 h-20 rounded-full bg-brand-cream dark:bg-brand-cream-dark/20 justify-center items-center mb-6">
                            <LucideShieldCheck size={48} color="#697D59" />
                        </View>
                        <Text className="text-2xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark mb-4">Data Privacy</Text>
                        <Text className="text-base text-brand-charcoal/70 dark:text-brand-charcoal-light/80 text-center leading-6 mb-8">
                            We value your privacy. Can we collect anonymized data to improve the virtual try-on experience? This data is encrypted and never linked to your personal identity.
                        </Text>

                        <TouchableOpacity
                            className="bg-brand-sage dark:bg-brand-sage-dark w-full py-4 rounded-2xl flex-row justify-center items-center mb-3"
                            onPress={finalizeOnboarding}
                        >
                            <LucideCheck size={20} color="#fff" className="mr-2" />
                            <Text className="text-white text-lg font-bold">I Agree</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="py-3"
                            onPress={finalizeOnboarding}
                        >
                            <Text className="text-brand-charcoal-light dark:text-brand-charcoal-light/60 text-base font-medium">Maybe Later</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({});

