import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import * as Location from 'expo-location';
import { AuthService } from '../services/auth';
import { LocationService } from '../services/location';
import { LucideUser, LucideCheck, LucideX, LucideStar, LucideLock, LucideSparkles, LucideZap, LucideTrendingUp, LucideShield, LucideMapPin, LucideLoader2 } from 'lucide-react-native';

interface ProfileNudgeModalProps {
    visible: boolean;
    onClose: () => void;
    onComplete: () => void;
}

type ExperienceType = 'full' | 'basic';

export const ProfileNudgeModal: React.FC<ProfileNudgeModalProps> = ({ visible, onClose, onComplete }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedExperience, setSelectedExperience] = useState<ExperienceType>('full');
    const [isLocating, setIsLocating] = useState(false);
    const [isCheckingZip, setIsCheckingZip] = useState(false);
    const [locationPermissionStatus, setLocationPermissionStatus] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fullName: "",
        gender: "",
        zipcode: "",
        city: "",
    });

    // Check location permission and auto-fill if granted
    React.useEffect(() => {
        if (visible) {
            checkAndRequestLocation();
        }
    }, [visible]);

    const checkAndRequestLocation = async () => {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status === 'granted') {
                await fillLocationData();
            } else if (status === 'undetermined') {
                // We'll ask in requestLocationPermission when they start filling or on mount
                await requestLocationPermission();
            }
        } catch (err) {
            console.error('[ProfileNudge] Error checking location status:', err);
        }
    };

    const fillLocationData = async () => {
        setIsLocating(true);
        try {
            const data = await LocationService.getCurrentLocationData();
            if (data) {
                setFormData(prev => ({
                    ...prev,
                    zipcode: data.zipcode || prev.zipcode,
                    city: data.city || prev.city
                }));
            }
        } catch (err) {
            console.error('[ProfileNudge] Error filling location data:', err);
        } finally {
            setIsLocating(false);
        }
    };

    const requestLocationPermission = async (): Promise<void> => {
        return new Promise((resolve) => {
            Alert.alert(
                "Improve Your Recommendations",
                "We'd like to access your approximate location to show trending colors in your area. We don't need your precise location.",
                [
                    {
                        text: "Not Now",
                        style: "cancel",
                        onPress: () => {
                            setLocationPermissionStatus('denied');
                            resolve();
                        }
                    },
                    {
                        text: "Allow",
                        onPress: async () => {
                            try {
                                const { status } = await Location.requestForegroundPermissionsAsync();
                                setLocationPermissionStatus(status);
                                if (status === 'granted') {
                                    await fillLocationData();
                                }
                            } catch (err) {
                                console.error('[ProfileNudge] Location permission error:', err);
                            }
                            resolve();
                        }
                    }
                ]
            );
        });
    };

    const handleZipcodeChange = async (zip: string) => {
        const cleanedZip = zip.replace(/[^0-9]/g, '').slice(0, 5);
        setFormData(prev => ({ ...prev, zipcode: cleanedZip }));

        if (cleanedZip.length === 5) {
            setIsCheckingZip(true);
            try {
                const city = await LocationService.getCityFromZipcode(cleanedZip);
                if (city) {
                    setFormData(prev => ({ ...prev, city }));
                    setError(null);
                } else {
                    setError("Could not find city for this zipcode. Please check again.");
                }
            } catch (err) {
                console.error('[ProfileNudge] City lookup error:', err);
            } finally {
                setIsCheckingZip(false);
            }
        }
    };

    const handleComplete = async () => {
        if (!formData.fullName || !formData.gender || !formData.zipcode || !formData.city) {
            setError("Please fill in all details for better results");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // No need to request location permission again here as it's handled on mount
            // but we can check if it was granted to store the state correctly if needed
            const { status } = await Location.getForegroundPermissionsAsync();

            const user = await AuthService.getCurrentUser();
            await AuthService.saveUserProfile({
                email: user.email,
                fullName: formData.fullName,
                gender: formData.gender,
                zipcode: formData.zipcode,
                city: formData.city,
                data_consent: selectedExperience === 'full', // True if Full Experience selected
                location_permission: status === 'granted'
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
                <View className="bg-white dark:bg-brand-gray rounded-t-[40px] p-8 shadow-2xl">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-3xl font-bold text-brand-gray dark:text-brand-gray-light">Level Up Your Results</Text>
                        <TouchableOpacity onPress={handleMaybeLater}>
                            <LucideX size={24} color="#A1A1A1" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-lg text-brand-gray-medium dark:text-brand-gray-medium/70 mb-8 leading-6">
                        Complete your profile to unlock personalized AI rendering tailored to your unique skin tone.
                    </Text>

                    <ScrollView showsVerticalScrollIndicator={false} className="max-h-[60vh]">
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
                            <Text className="text-[17px] font-semibold text-brand-gray dark:text-brand-gray-light mb-3">Gender</Text>
                            <View className="flex-row gap-x-2">
                                {["Female", "Male", "Other"].map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        onPress={() => setFormData({ ...formData, gender: g })}
                                        className={`flex-1 py-4 rounded-2xl border items-center ${formData.gender === g ? 'bg-brand-teal border-brand-teal' : 'bg-transparent border-brand-gray-medium/10'}`}
                                    >
                                        <Text className={`font-bold ${formData.gender === g ? 'text-white' : 'text-brand-gray-medium'}`}>{g}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View className="flex-row gap-x-4 mb-8">
                            <View className="flex-1">
                                <Text className="text-[17px] font-semibold text-brand-gray dark:text-brand-gray-light mb-3">Zipcode</Text>
                                <View className="flex-row items-center bg-brand-peach/30 dark:bg-brand-peach-dark/20 border border-brand-gray-medium/10 rounded-2xl px-5">
                                    <TextInput
                                        className="flex-1 py-4 text-lg text-brand-gray dark:text-brand-gray-light"
                                        placeholder="Zipcode"
                                        placeholderTextColor="#A1A1A1"
                                        keyboardType="numeric"
                                        maxLength={5}
                                        value={formData.zipcode}
                                        onChangeText={handleZipcodeChange}
                                    />
                                    {isCheckingZip && <LucideLoader2 size={18} color="#307b75" className="animate-spin" />}
                                    {!isCheckingZip && formData.zipcode.length === 5 && !error && <LucideCheck size={18} color="#307b75" />}
                                </View>
                            </View>
                            <View className="flex-[1.5]">
                                <Text className="text-[17px] font-semibold text-brand-gray dark:text-brand-gray-light mb-3">City</Text>
                                <View className="flex-row items-center bg-brand-peach/30 dark:bg-brand-peach-dark/20 border border-brand-gray-medium/10 rounded-2xl px-5">
                                    <TextInput
                                        className="flex-1 py-4 text-lg text-brand-gray dark:text-brand-gray-light"
                                        placeholder="Your City"
                                        placeholderTextColor="#A1A1A1"
                                        value={formData.city}
                                        onChangeText={(v) => setFormData({ ...formData, city: v })}
                                    />
                                    {isLocating && <LucideLoader2 size={18} color="#307b75" className="animate-spin" />}
                                    {!isLocating && formData.city.length > 0 && <LucideMapPin size={18} color="#307b75" />}
                                </View>
                            </View>
                        </View>

                        {/* Experience Selection Cards */}
                        <View className="mb-6">
                            <Text className="text-[17px] font-semibold text-brand-gray dark:text-brand-gray-light mb-4">Choose Your Experience</Text>

                            {/* Full Experience Card */}
                            <TouchableOpacity
                                onPress={() => setSelectedExperience('full')}
                                className={`p-5 rounded-3xl mb-3 border-2 ${selectedExperience === 'full' ? 'bg-brand-teal/10 border-brand-teal' : 'bg-white/50 border-brand-gray-medium/10'}`}
                            >
                                <View className="flex-row justify-between items-start mb-3">
                                    <View className="flex-row items-center">
                                        <LucideStar size={24} color="#307b75" />
                                        <Text className="text-xl font-bold text-brand-gray dark:text-brand-gray-light ml-2">Full Experience</Text>
                                    </View>
                                    {selectedExperience === 'full' && (
                                        <View className="w-6 h-6 rounded-full bg-brand-teal items-center justify-center">
                                            <LucideCheck size={14} color="white" strokeWidth={3} />
                                        </View>
                                    )}
                                </View>
                                <Text className="text-sm text-brand-teal font-semibold mb-3">RECOMMENDED</Text>
                                <View className="gap-y-2">
                                    <View className="flex-row items-center">
                                        <LucideZap size={16} color="#307b75" />
                                        <Text className="text-base text-brand-gray dark:text-brand-gray-light ml-2">Unlimited daily try-ons</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <LucideSparkles size={16} color="#307b75" />
                                        <Text className="text-base text-brand-gray dark:text-brand-gray-light ml-2">AI-powered skin tone matching</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <LucideTrendingUp size={16} color="#307b75" />
                                        <Text className="text-base text-brand-gray dark:text-brand-gray-light ml-2">Personalized color recommendations</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <LucideStar size={16} color="#307b75" />
                                        <Text className="text-base text-brand-gray dark:text-brand-gray-light ml-2">Priority access to new features</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* Basic Experience Card */}
                            <TouchableOpacity
                                onPress={() => setSelectedExperience('basic')}
                                className={`p-5 rounded-3xl border-2 ${selectedExperience === 'basic' ? 'bg-gray-50 border-gray-400' : 'bg-white/50 border-brand-gray-medium/10'}`}
                            >
                                <View className="flex-row justify-between items-start mb-3">
                                    <View className="flex-row items-center">
                                        <LucideLock size={24} color="#8A8A8A" />
                                        <Text className="text-xl font-bold text-brand-gray dark:text-brand-gray-light ml-2">Basic Experience</Text>
                                    </View>
                                    {selectedExperience === 'basic' && (
                                        <View className="w-6 h-6 rounded-full bg-gray-400 items-center justify-center">
                                            <LucideCheck size={14} color="white" strokeWidth={3} />
                                        </View>
                                    )}
                                </View>
                                <View className="gap-y-2">
                                    <Text className="text-base text-brand-gray-medium">• 5 try-ons per day limit</Text>
                                    <Text className="text-base text-brand-gray-medium">• Standard rendering quality</Text>
                                    <Text className="text-base text-brand-gray-medium">• No personalized recommendations</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Privacy Notice */}
                        <View className="bg-brand-peach/20 dark:bg-brand-peach-dark/10 p-4 rounded-2xl mb-6 border border-brand-teal/10">
                            <View className="flex-row items-start">
                                <LucideShield size={18} color="#307b75" className="mr-2 mt-0.5" />
                                <Text className="flex-1 text-sm text-brand-gray-medium dark:text-brand-gray-medium/70 leading-5">
                                    We use anonymized hand data to improve our AR engine for everyone. Your name and location are never shared. You can change this anytime in Settings.
                                </Text>
                            </View>
                        </View>
                    </ScrollView>

                    <TouchableOpacity
                        onPress={handleComplete}
                        disabled={loading}
                        className={`bg-brand-teal dark:bg-brand-teal-dark py-6 rounded-2xl flex-row justify-center items-center shadow-lg ${loading ? 'opacity-70' : ''}`}
                    >
                        {loading ? (
                            <Text className="text-white text-xl font-bold">Saving...</Text>
                        ) : (
                            <>
                                <LucideCheck size={24} color="#fff" className="mr-3" />
                                <Text className="text-white text-xl font-bold">
                                    {selectedExperience === 'full' ? 'Get Full Experience' : 'Continue with Basic'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleMaybeLater}
                        className="py-5"
                    >
                        <Text className="text-brand-gray-medium dark:text-brand-gray-medium/60 text-center text-lg font-medium">Maybe Later</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};
