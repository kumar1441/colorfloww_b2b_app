import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, Switch, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { LucideUser, LucideMapPin, LucideShieldCheck, LucideCheck, LucideX } from 'lucide-react-native';
import { AuthService } from '../services/auth';

interface ProfileNudgeModalProps {
    visible: boolean;
    onClose: () => void;
    onComplete: () => void;
}

export const ProfileNudgeModal: React.FC<ProfileNudgeModalProps> = ({ visible, onClose, onComplete }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fullName: "",
        gender: "",
        zipcode: "",
        city: "",
        dataConsent: true
    });

    const handleComplete = async () => {
        if (!formData.fullName || !formData.gender || !formData.zipcode || !formData.city) {
            setError("Please fill in all details for better results");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const user = await AuthService.getCurrentUser();
            await AuthService.saveUserProfile({
                email: user.email,
                fullName: formData.fullName,
                gender: formData.gender,
                zipcode: formData.zipcode,
                city: formData.city,
                data_consent: formData.dataConsent
            });

            await AuthService.resetNudgeCount();
            onComplete();
        } catch (err: any) {
            console.error("[ProfileNudge] Error saving profile:", err);
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleMaybeLater = async () => {
        await AuthService.incrementNudgeCount();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 bg-black/60 justify-end"
            >
                <View className="bg-white dark:bg-brand-charcoal rounded-t-[40px] p-8 shadow-2xl">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-3xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark">Level Up Your Results</Text>
                        <TouchableOpacity onPress={handleMaybeLater}>
                            <LucideX size={24} color="#A1A1A1" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-lg text-brand-charcoal-light dark:text-brand-charcoal-light/70 mb-8 leading-6">
                        Complete your profile to get AI rendering tailored perfectly to your unique skin tone and lighting.
                    </Text>

                    <ScrollView showsVerticalScrollIndicator={false} className="max-h-[60vh]">
                        {error && (
                            <View className="bg-red-50 p-4 rounded-2xl mb-6 border border-red-100">
                                <Text className="text-red-600 text-center font-medium">{error}</Text>
                            </View>
                        )}

                        <View className="mb-6">
                            <Text className="text-[17px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark mb-3">Full Name</Text>
                            <View className="flex-row items-center bg-brand-cream/30 dark:bg-brand-cream-dark/20 border border-brand-charcoal-light/10 rounded-2xl px-5">
                                <LucideUser size={20} color="#697D59" className="mr-3" />
                                <TextInput
                                    className="flex-1 py-4 text-lg text-brand-charcoal dark:text-brand-charcoal-dark"
                                    placeholder="Enter your name"
                                    placeholderTextColor="#A1A1A1"
                                    value={formData.fullName}
                                    onChangeText={(v) => setFormData({ ...formData, fullName: v })}
                                />
                            </View>
                        </View>

                        <View className="mb-6">
                            <Text className="text-[17px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark mb-3">Gender</Text>
                            <View className="flex-row gap-x-2">
                                {["Female", "Male", "Other"].map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        onPress={() => setFormData({ ...formData, gender: g })}
                                        className={`flex-1 py-4 rounded-2xl border items-center transition-colors ${formData.gender === g ? 'bg-brand-sage border-brand-sage' : 'bg-transparent border-brand-charcoal-light/10'}`}
                                    >
                                        <Text className={`font-bold ${formData.gender === g ? 'text-white' : 'text-brand-charcoal-light'}`}>{g}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View className="flex-row gap-x-4 mb-8">
                            <View className="flex-1">
                                <Text className="text-[17px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark mb-3">Zipcode</Text>
                                <TextInput
                                    className="bg-brand-cream/30 dark:bg-brand-cream-dark/20 border border-brand-charcoal-light/10 rounded-2xl py-4 px-5 text-lg text-brand-charcoal dark:text-brand-charcoal-dark"
                                    placeholder="Zipcode"
                                    placeholderTextColor="#A1A1A1"
                                    keyboardType="numeric"
                                    value={formData.zipcode}
                                    onChangeText={(v) => setFormData({ ...formData, zipcode: v })}
                                />
                            </View>
                            <View className="flex-[1.5]">
                                <Text className="text-[17px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark mb-3">City</Text>
                                <TextInput
                                    className="bg-brand-cream/30 dark:bg-brand-cream-dark/20 border border-brand-charcoal-light/10 rounded-2xl py-4 px-5 text-lg text-brand-charcoal dark:text-brand-charcoal-dark"
                                    placeholder="Your City"
                                    placeholderTextColor="#A1A1A1"
                                    value={formData.city}
                                    onChangeText={(v) => setFormData({ ...formData, city: v })}
                                />
                            </View>
                        </View>

                        <View className="bg-brand-cream/20 dark:bg-brand-cream-dark/10 p-6 rounded-3xl mb-8 border border-brand-sage/10">
                            <View className="flex-row justify-between items-center mb-4">
                                <View className="flex-row items-center">
                                    <LucideShieldCheck size={24} color="#697D59" className="mr-3" />
                                    <Text className="text-lg font-bold text-brand-charcoal dark:text-brand-charcoal-dark">Data Consent</Text>
                                </View>
                                <Switch
                                    value={formData.dataConsent}
                                    onValueChange={(v) => setFormData({ ...formData, dataConsent: v })}
                                    trackColor={{ false: '#D1D1D1', true: '#697D59' }}
                                    thumbColor="#fff"
                                />
                            </View>
                            <Text className="text-base text-brand-charcoal-light dark:text-brand-charcoal-light/70 leading-5">
                                We use anonymized hand data to improve our AR engine for everyone. Your name and location are never shared.
                            </Text>
                        </View>
                    </ScrollView>

                    <TouchableOpacity
                        onPress={handleComplete}
                        disabled={loading}
                        className={`bg-brand-sage dark:bg-brand-sage-dark py-6 rounded-2xl flex-row justify-center items-center shadow-lg ${loading ? 'opacity-70' : ''}`}
                    >
                        {loading ? (
                            <Text className="text-white text-xl font-bold">Saving...</Text>
                        ) : (
                            <>
                                <LucideCheck size={24} color="#fff" className="mr-3" />
                                <Text className="text-white text-xl font-bold">Complete Profile</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleMaybeLater}
                        className="py-5"
                    >
                        <Text className="text-brand-charcoal-light dark:text-brand-charcoal-light/60 text-center text-lg font-medium">Maybe Later</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};
