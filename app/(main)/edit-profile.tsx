import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideChevronLeft, LucideUser, LucideCheck, LucideChevronRight } from 'lucide-react-native';
import { AuthService } from '../../services/auth';

export default function EditProfileScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState('');
    const [email, setEmail] = useState('');
    const [ageRange, setAgeRange] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const profile = await AuthService.getFullUserProfile();
            if (profile) {
                setFullName(profile.fullName);
                setGender(profile.gender || '');
                setEmail(profile.email || '');
                setAgeRange(profile.ageRange || '');
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            Alert.alert('Error', 'Could not load profile details.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!fullName.trim()) {
            Alert.alert('Error', 'Please enter your full name.');
            return;
        }

        setIsSaving(true);
        try {
            await AuthService.updateUserProfile({
                fullName,
                gender
            });
            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', 'Could not update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-brand-cream dark:bg-brand-cream-dark items-center justify-center">
                <ActivityIndicator size="large" color="#697D59" />
            </View>
        );
    }

    const genderOptions = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];

    return (
        <View className="flex-1 bg-brand-cream dark:bg-brand-cream-dark">
            <SafeAreaView edges={['top']} className="bg-brand-cream/80 dark:bg-brand-cream-dark/80">
                <View className="px-6 py-4 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <LucideChevronLeft size={28} color="#697D59" />
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark">Edit Profile</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={isSaving}
                        className={`w-10 h-10 rounded-full items-center justify-center ${isSaving ? 'bg-brand-sage/50' : 'bg-brand-sage shadow-md'}`}
                    >
                        {isSaving ? <ActivityIndicator size="small" color="white" /> : <LucideCheck size={20} color="white" />}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
                {/* Profile Photo Placeholder Action */}
                <View className="items-center mb-10">
                    <View className="w-24 h-24 rounded-full bg-white dark:bg-brand-charcoal items-center justify-center mb-2 shadow-sm border border-brand-charcoal-light/10">
                        <LucideUser size={48} color="#697D59" />
                    </View>
                    <Text className="text-brand-sage font-semibold">Change photo</Text>
                    <Text className="text-[10px] text-brand-charcoal-light mt-1 opacity-60 italic">Managed in Profile screen</Text>
                </View>

                {/* Input Fields */}
                <View className="space-y-6">
                    <View>
                        <Text className="text-sm font-bold text-brand-charcoal dark:text-brand-charcoal-dark mb-2 ml-1">Full Name</Text>
                        <TextInput
                            className="bg-white dark:bg-brand-charcoal/40 p-5 rounded-[20px] text-base border border-brand-charcoal-light/10 dark:text-white"
                            placeholder="Your Name"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-brand-charcoal dark:text-brand-charcoal-dark mb-2 ml-1">Email Address</Text>
                        <TextInput
                            className="bg-brand-cream-dark/10 p-5 rounded-[20px] text-base border border-brand-charcoal-light/5 text-brand-charcoal-light"
                            value={email}
                            editable={false}
                        />
                        <Text className="text-[10px] text-brand-charcoal-light mt-2 ml-1 opacity-60">Email cannot be changed for security.</Text>
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-brand-charcoal dark:text-brand-charcoal-dark mb-3 ml-1">Gender</Text>
                        <View className="bg-white/60 dark:bg-brand-charcoal/40 rounded-[24px] overflow-hidden border border-brand-charcoal-light/10">
                            {genderOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => setGender(option)}
                                    className={`flex-row items-center justify-between p-4 ${index !== genderOptions.length - 1 ? 'border-b border-brand-cream dark:border-brand-cream-dark/20' : ''}`}
                                >
                                    <Text className={`text-base ${gender === option ? 'text-brand-sage font-bold' : 'text-brand-charcoal dark:text-white'}`}>
                                        {option}
                                    </Text>
                                    {gender === option && <LucideCheck size={18} color="#697D59" />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View className="opacity-60">
                        <Text className="text-sm font-bold text-brand-charcoal dark:text-brand-charcoal-dark mb-2 ml-1">Age Range</Text>
                        <TextInput
                            className="bg-brand-cream-dark/10 p-5 rounded-[20px] text-base border border-brand-charcoal-light/5 text-brand-charcoal-light"
                            value={ageRange}
                            editable={false}
                        />
                        <Text className="text-[10px] text-brand-charcoal-light mt-2 ml-1">Age range is set during signup.</Text>
                    </View>
                </View>

                {/* Footer bit */}
                <View className="mt-12 items-center">
                    <Text className="text-xs text-brand-charcoal-light opacity-40">Privacy Policy • Terms of Service</Text>
                </View>
            </ScrollView>
        </View>
    );
}
