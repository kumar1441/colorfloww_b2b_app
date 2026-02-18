import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideChevronLeft, LucideUser, LucideCheck, LucideChevronRight, LucideTrash2 } from 'lucide-react-native';
import { AuthService } from '../services/auth';

export default function EditProfileScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const insets = useSafeAreaInsets();

    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [gender, setGender] = useState('');
    const [email, setEmail] = useState('');
    const [ageRange, setAgeRange] = useState('');
    const [usernameStatus, setUsernameStatus] = useState<'none' | 'checking' | 'available' | 'taken' | 'invalid'>('none');

    useEffect(() => {
        loadProfile();
    }, []);

    useEffect(() => {
        const checkUsername = async () => {
            if (!username.trim() || username.length < 3) {
                setUsernameStatus('none');
                return;
            }

            // Simple regex for alphanumeric and underscores
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                setUsernameStatus('invalid');
                return;
            }

            setUsernameStatus('checking');
            try {
                const available = await AuthService.isUsernameAvailable(username.toLowerCase());
                setUsernameStatus(available ? 'available' : 'taken');
            } catch (error) {
                setUsernameStatus('none');
            }
        };

        const timeoutId = setTimeout(checkUsername, 500);
        return () => clearTimeout(timeoutId);
    }, [username]);

    const loadProfile = async () => {
        try {
            const profile = await AuthService.getFullUserProfile();
            if (profile) {
                setFullName(profile.fullName);
                setUsername(profile.username || '');
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

        if (username.trim()) {
            if (username.length < 3) {
                Alert.alert('Error', 'Username must be at least 3 characters long.');
                return;
            }
            if (usernameStatus === 'taken') {
                Alert.alert('Error', 'This username is already taken.');
                return;
            }
            if (usernameStatus === 'invalid') {
                Alert.alert('Error', 'Username can only contain letters, numbers, and underscores.');
                return;
            }
        }

        setIsSaving(true);
        try {
            await AuthService.updateUserProfile({
                fullName,
                username: username.toLowerCase().trim() || undefined,
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

    const handleDeleteAccount = async () => {
        // Step 1: Initial Warning
        Alert.alert(
            'Delete Account?',
            'This will permanently delete your profile, karma, and all paint history. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Everything',
                    style: 'destructive',
                    onPress: () => {
                        // Step 2: Final Confirmation
                        Alert.alert(
                            'Are you absolutely sure?',
                            'One last check: everything will be gone. Type "Confirm" if you want to proceed.',
                            [
                                { text: 'Back', style: 'cancel' },
                                {
                                    text: 'Yes, Delete',
                                    style: 'destructive',
                                    onPress: async () => {
                                        setIsSaving(true);
                                        try {
                                            await AuthService.deleteAccount();
                                            Alert.alert('Deleted', 'Your account has been successfully removed.', [
                                                { text: 'OK', onPress: () => router.replace('/') }
                                            ]);
                                        } catch (error) {
                                            console.error('Delete error:', error);
                                            Alert.alert('Error', 'Failed to delete account. Please try again later.');
                                            setIsSaving(false);
                                        }
                                    }
                                }
                            ]
                        );
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-brand-peach dark:bg-brand-peach-dark items-center justify-center">
                <ActivityIndicator size="large" color="#307b75" />
            </View>
        );
    }

    const genderOptions = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];

    return (
        <View className="flex-1 bg-brand-peach dark:bg-brand-peach-dark">
            <SafeAreaView edges={['top']} className="bg-brand-peach/80 dark:bg-brand-peach-dark/80">
                <View style={{ paddingTop: Math.max(insets.top, 0) }} className="px-6 py-4 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <LucideChevronLeft size={28} color="#307b75" />
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold text-brand-gray dark:text-brand-gray-light">Edit Profile</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={isSaving}
                        className={`w-10 h-10 rounded-full items-center justify-center ${isSaving ? 'bg-brand-teal/50' : 'bg-brand-teal shadow-md'}`}
                    >
                        {isSaving ? <ActivityIndicator size="small" color="white" /> : <LucideCheck size={20} color="white" />}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
                {/* Profile Photo Placeholder Action */}
                <View className="items-center mb-10">
                    <View className="w-24 h-24 rounded-full bg-white dark:bg-brand-gray items-center justify-center mb-2 shadow-sm border border-brand-gray-medium/10">
                        <LucideUser size={48} color="#307b75" />
                    </View>
                    <Text className="text-brand-teal font-semibold">Change photo</Text>
                    <Text className="text-[10px] text-brand-gray-medium mt-1 opacity-60 italic">Managed in Profile screen</Text>
                </View>

                {/* Input Fields */}
                <View className="space-y-6">
                    <View>
                        <Text className="text-sm font-bold text-brand-gray dark:text-brand-gray-light mb-2 ml-1">Full Name</Text>
                        <TextInput
                            className="bg-white dark:bg-brand-gray/40 p-5 rounded-[20px] text-base border border-brand-gray-medium/10 dark:text-white"
                            placeholder="Your Name"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    <View>
                        <View className="flex-row justify-between items-center mb-2 mx-1">
                            <Text className="text-sm font-bold text-brand-gray dark:text-brand-gray-light">Username</Text>
                            {usernameStatus === 'checking' && <ActivityIndicator size="small" color="#307b75" />}
                            {usernameStatus === 'available' && <Text className="text-[10px] font-bold text-brand-teal uppercase">Available</Text>}
                            {usernameStatus === 'taken' && <Text className="text-[10px] font-bold text-red-500 uppercase">Taken</Text>}
                            {usernameStatus === 'invalid' && <Text className="text-[10px] font-bold text-orange-500 uppercase">Invalid Format</Text>}
                        </View>
                        <TextInput
                            className={`bg-white dark:bg-brand-gray/40 p-5 rounded-[20px] text-base border ${usernameStatus === 'taken' ? 'border-red-500/50' : usernameStatus === 'available' ? 'border-brand-teal/50' : 'border-brand-gray-medium/10'} dark:text-white`}
                            placeholder="e.g. nail_artist"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={username}
                            onChangeText={setUsername}
                        />
                        <Text className="text-[10px] text-brand-gray-medium mt-2 ml-1 opacity-60">Handles look like @{username || 'username'}. Use letters, numbers, or underscores.</Text>
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-brand-gray dark:text-brand-gray-light mb-2 ml-1">Email Address</Text>
                        <TextInput
                            className="bg-brand-peach-dark/10 p-5 rounded-[20px] text-base border border-brand-gray-medium/5 text-brand-gray-medium"
                            value={email}
                            editable={false}
                        />
                        <Text className="text-[10px] text-brand-gray-medium mt-2 ml-1 opacity-60">Email cannot be changed for security.</Text>
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-brand-gray dark:text-brand-gray-light mb-3 ml-1">Gender</Text>
                        <View className="bg-white/60 dark:bg-brand-gray/40 rounded-[24px] overflow-hidden border border-brand-gray-medium/10">
                            {genderOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => setGender(option)}
                                    className={`flex-row items-center justify-between p-4 ${index !== genderOptions.length - 1 ? 'border-b border-brand-peach dark:border-brand-peach-dark/20' : ''}`}
                                >
                                    <Text className={`text-base ${gender === option ? 'text-brand-teal font-bold' : 'text-brand-gray dark:text-white'}`}>
                                        {option}
                                    </Text>
                                    {gender === option && <LucideCheck size={18} color="#307b75" />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View className="opacity-60">
                        <Text className="text-sm font-bold text-brand-gray dark:text-brand-gray-light mb-2 ml-1">Age Range</Text>
                        <TextInput
                            className="bg-brand-peach-dark/10 p-5 rounded-[20px] text-base border border-brand-gray-medium/5 text-brand-gray-medium"
                            value={ageRange}
                            editable={false}
                        />
                        <Text className="text-[10px] text-brand-gray-medium mt-2 ml-1">Age range is set during signup.</Text>
                    </View>
                </View>

                {/* Footer bit */}
                <View className="mt-12 items-center">
                    <TouchableOpacity
                        onPress={handleDeleteAccount}
                        disabled={isSaving}
                        className="flex-row items-center gap-x-2 py-4 px-8 rounded-2xl border border-red-100 bg-red-50/30 mb-8"
                    >
                        <LucideTrash2 size={16} color="#DC2626" />
                        <Text className="text-red-600 font-bold">Delete Account</Text>
                    </TouchableOpacity>
                    <Text className="text-xs text-brand-gray-medium opacity-40">Privacy Policy • Terms of Service</Text>
                </View>
            </ScrollView>
        </View>
    );
}
