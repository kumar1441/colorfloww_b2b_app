import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LucideArrowLeft, LucideShieldCheck, LucideCheck, LucideChevronDown } from 'lucide-react-native';
import { AuthService } from '../services/auth';

const { width } = Dimensions.get('window');

export default function SignupScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
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

    const finalizeSignup = async () => {
        await AuthService.login(formData);
        setShowConsent(false);

        // If they came from a color selection, they might want to continue to camera
        // For simplicity, we just go back to home or the previous screen
        if (params.returnTo) {
            router.replace({
                //@ts-ignore
                pathname: params.returnTo,
                params: { color: params.color }
            });
        } else {
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
                    <TouchableOpacity onPress={handleBack} className="flex-row items-center">
                        <LucideArrowLeft size={20} color="#697D59" />
                        <Text className="ml-2 text-brand-sage dark:text-brand-sage-dark text-lg font-medium">Back</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">
                    <View className="bg-white dark:bg-brand-charcoal rounded-[40px] p-10 shadow-2xl">
                        <Text className="text-4xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark mb-3">
                            {step === 1 ? "Create Account" : "Tell us about yourself"}
                        </Text>
                        <Text className="text-lg text-brand-charcoal-light dark:text-brand-charcoal-light/60 mb-10 leading-6">
                            {step === 1 ? "Let's get you started" : "Help us personalize your experience"}
                        </Text>

                        {step === 1 ? (
                            <>
                                <View className="mb-6">
                                    <Text className="text-[17px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark mb-3">Full Name</Text>
                                    <TextInput
                                        className="bg-brand-cream/30 dark:bg-brand-cream-dark/20 border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/10 rounded-2xl py-4 px-5 text-lg text-brand-charcoal dark:text-brand-charcoal-dark"
                                        placeholder="Enter your name"
                                        placeholderTextColor="#A1A1A1"
                                        value={formData.name}
                                        onChangeText={(v) => setFormData({ ...formData, name: v })}
                                    />
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
                            </>
                        ) : (
                            <>
                                <View className="mb-6">
                                    <Text className="text-[17px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark mb-3">Gender</Text>
                                    <TouchableOpacity
                                        className="bg-brand-cream/30 dark:bg-brand-cream-dark/20 border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/10 rounded-2xl py-4 px-5 flex-row justify-between items-center"
                                        activeOpacity={0.7}
                                    >
                                        <Text className={`text-lg ${formData.gender ? 'text-brand-charcoal dark:text-brand-charcoal-dark' : 'text-[#A1A1A1]'}`}>
                                            {formData.gender || "Select gender"}
                                        </Text>
                                        <LucideChevronDown size={20} color="#697D59" />
                                    </TouchableOpacity>
                                </View>

                                <View className="mb-6">
                                    <Text className="text-[17px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark mb-3">Age</Text>
                                    <TextInput
                                        className="bg-brand-cream/30 dark:bg-brand-cream-dark/20 border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/10 rounded-2xl py-4 px-5 text-lg text-brand-charcoal dark:text-brand-charcoal-dark"
                                        placeholder="Enter your age"
                                        placeholderTextColor="#A1A1A1"
                                        keyboardType="numeric"
                                        value={formData.age}
                                        onChangeText={(v) => setFormData({ ...formData, age: v })}
                                    />
                                </View>

                                <View className="mb-6">
                                    <Text className="text-[17px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark mb-3">City</Text>
                                    <TextInput
                                        className="bg-brand-cream/30 dark:bg-brand-cream-dark/20 border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/10 rounded-2xl py-4 px-5 text-lg text-brand-charcoal dark:text-brand-charcoal-dark"
                                        placeholder="Your city"
                                        placeholderTextColor="#A1A1A1"
                                        value={formData.city}
                                        onChangeText={(v) => setFormData({ ...formData, city: v })}
                                    />
                                </View>

                                <View className="mb-10">
                                    <Text className="text-[17px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark mb-3">Zipcode</Text>
                                    <TextInput
                                        className="bg-brand-cream/30 dark:bg-brand-cream-dark/20 border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/10 rounded-2xl py-4 px-5 text-lg text-brand-charcoal dark:text-brand-charcoal-dark"
                                        placeholder="Enter zipcode"
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
                            className="bg-[#697D59] rounded-2xl py-6 items-center shadow-lg"
                        >
                            <Text className="text-white text-xl font-bold">
                                {step === 1 ? "Continue" : "Complete"}
                            </Text>
                        </TouchableOpacity>

                        {step === 1 && (
                            <View className="items-center mt-8">
                                <Text className="text-base text-brand-charcoal-light dark:text-brand-charcoal-light/60">
                                    Already have an account? <Text className="text-brand-sage dark:text-brand-sage-dark font-bold underline" onPress={() => router.push('/login')}>Log in</Text>
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-row justify-center mt-12 gap-x-3">
                        <View className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-brand-sage dark:bg-brand-sage-dark' : 'bg-brand-charcoal-light/20'}`} />
                        <View className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-brand-sage dark:bg-brand-sage-dark' : 'bg-brand-charcoal-light/20'}`} />
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Consent Modal */}
            <Modal
                visible={showConsent}
                transparent={true}
                animationType="fade"
            >
                <View className="flex-1 bg-black/60 justify-center items-center p-6">
                    <View className="bg-white dark:bg-brand-charcoal rounded-[40px] p-10 w-full items-center shadow-2xl">
                        <View className="w-24 h-24 rounded-full bg-brand-cream dark:bg-brand-cream-dark/20 justify-center items-center mb-8 shadow-inner">
                            <LucideShieldCheck size={56} color="#697D59" />
                        </View>
                        <Text className="text-3xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark mb-4 text-center">Data Consent</Text>
                        <Text className="text-lg text-brand-charcoal/70 dark:text-brand-charcoal-light/80 text-center leading-7 mb-10">
                            Help us improve our AI! We collect anonymized try-on data to make color rendering even more accurate. Your personal details remain 100% private.
                        </Text>

                        <TouchableOpacity
                            className="bg-brand-sage dark:bg-brand-sage-dark w-full py-5 rounded-2xl flex-row justify-center items-center mb-4 shadow-md"
                            onPress={finalizeSignup}
                        >
                            <LucideCheck size={24} color="#fff" className="mr-3" />
                            <Text className="text-white text-xl font-bold">I Agree</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="py-4"
                            onPress={finalizeSignup}
                        >
                            <Text className="text-brand-charcoal-light dark:text-brand-charcoal-light/60 text-lg font-medium">Maybe Later</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}
