import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { LucideUser, LucideSettings, LucideTrophy, LucideLogOut, LucideChevronRight, LucideFlame, LucideCamera, LucideMail, LucideEdit3 } from 'lucide-react-native';
import { AuthService } from '../../services/auth';
import { GamificationService } from '../../services/gamification';
import StreakCard from '../../components/StreakCard';
import StreakShareModal from '../../components/StreakShareModal';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';

/**
 * ProfileScreen: Displays user info and gamification stats (streaks, awards).
 */
export default function ProfileScreen() {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<any>(null);
    const [stats, setStats] = useState({ streak: 0, looks: 0, awards: 0 });
    const [isShareModalVisible, setShareModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [profile, streak, looks, awards] = await Promise.all([
                AuthService.getFullUserProfile(),
                GamificationService.getStreak(),
                GamificationService.getLooksCount(),
                GamificationService.getAwardsCount()
            ]);
            setUserProfile(profile);
            setStats({ streak, looks, awards });
        } catch (error) {
            console.error('Error loading profile data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const handleLogout = async () => {
        await AuthService.logout();
        router.replace('/');
    };

    const handlePhotoSelect = async () => {
        Alert.alert(
            "Profile Photo",
            "Choose a source",
            [
                { text: "Camera", onPress: () => pickImage(true) },
                { text: "Gallery", onPress: () => pickImage(false) },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const pickImage = async (useCamera: boolean) => {
        const { status } = useCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert(`Sorry, we need ${useCamera ? 'camera' : 'gallery'} permissions to make this work!`);
            return;
        }

        const options: ImagePicker.ImagePickerOptions = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
        };

        const result = useCamera
            ? await ImagePicker.launchCameraAsync(options)
            : await ImagePicker.launchImageLibraryAsync(options);

        if (!result.canceled && result.assets[0].base64) {
            setIsLoading(true);
            try {
                const publicUrl = await AuthService.updateAvatar(result.assets[0].base64);
                setUserProfile((prev: any) => ({ ...prev, avatarUrl: publicUrl }));
            } catch (error) {
                console.error('Error updating avatar:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <View className="flex-1 bg-brand-cream dark:bg-brand-cream-dark">
            <SafeAreaView edges={['top']} className="bg-brand-cream/80 dark:bg-brand-cream-dark/80">
                <View className="px-6 pt-4 pb-5 flex-row justify-between items-center">
                    <View className="flex-row items-center gap-x-3">
                        <LucideUser size={32} color="#697D59" strokeWidth={1.5} />
                        <Text className="text-3xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark">Profile</Text>
                    </View>
                    <TouchableOpacity className="p-1">
                        <LucideSettings size={22} color="#8A8A8A" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                {/* User Info */}
                <View className="items-center mb-10">
                    <TouchableOpacity
                        onPress={handlePhotoSelect}
                        activeOpacity={0.9}
                        className="relative"
                    >
                        <View className="w-28 h-28 rounded-full bg-white dark:bg-brand-charcoal items-center justify-center mb-4 shadow-xl border-4 border-white dark:border-brand-charcoal overflow-hidden">
                            {userProfile?.avatarUrl ? (
                                <Image source={{ uri: userProfile.avatarUrl }} className="w-full h-full" />
                            ) : (
                                <LucideUser size={56} color="#697D59" />
                            )}
                        </View>
                        <View className="absolute bottom-4 right-0 w-9 h-9 bg-brand-sage rounded-full items-center justify-center border-2 border-white dark:border-brand-charcoal shadow-sm">
                            <LucideCamera size={16} color="white" />
                        </View>
                    </TouchableOpacity>

                    <Text className="text-3xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark mb-1">
                        {userProfile?.fullName || 'Nail Enthusiast'}
                    </Text>
                    <View className="flex-row items-center gap-x-1.5 opacity-60">
                        <LucideMail size={14} color="#8A8A8A" />
                        <Text className="text-sm text-brand-charcoal-light dark:text-brand-charcoal-light/60">
                            {userProfile?.email || 'tailor@example.com'}
                        </Text>
                    </View>
                </View>

                {/* Streak Card */}
                <StreakCard
                    streak={stats.streak}
                    onShare={() => setShareModalVisible(true)}
                />

                {/* Share Modal */}
                <StreakShareModal
                    visible={isShareModalVisible}
                    streak={stats.streak}
                    onClose={() => setShareModalVisible(false)}
                />

                {/* Stats Row */}
                <View className="flex-row justify-between mb-8 gap-x-3">
                    <View className="flex-1 bg-white/60 dark:bg-brand-charcoal/40 rounded-[24px] p-5 items-center border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5 shadow-sm">
                        <View className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 items-center justify-center mb-2">
                            <LucideFlame size={20} color="#F97316" />
                        </View>
                        <Text className="text-2xl font-black text-brand-charcoal dark:text-brand-charcoal-dark">{stats.streak}</Text>
                        <Text className="text-[10px] text-brand-charcoal-light dark:text-brand-charcoal-light/60 font-bold uppercase tracking-widest mt-0.5">Day Streak</Text>
                    </View>

                    <View className="flex-1 bg-white/60 dark:bg-brand-charcoal/40 rounded-[24px] p-5 items-center border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5 shadow-sm">
                        <View className="w-10 h-10 rounded-full bg-yellow-50 dark:bg-yellow-900/20 items-center justify-center mb-2">
                            <LucideTrophy size={20} color="#FBBF24" />
                        </View>
                        <Text className="text-2xl font-black text-brand-charcoal dark:text-brand-charcoal-dark">{stats.looks}</Text>
                        <Text className="text-[10px] text-brand-charcoal-light dark:text-brand-charcoal-light/60 font-bold uppercase tracking-widest mt-0.5">Looks</Text>
                    </View>

                    <View className="flex-1 bg-white/60 dark:bg-brand-charcoal/40 rounded-[24px] p-5 items-center border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5 shadow-sm">
                        <View className="w-10 h-10 rounded-full bg-violet-50 dark:bg-violet-900/20 items-center justify-center mb-2">
                            <LucideTrophy size={20} color="#A78BFA" />
                        </View>
                        <Text className="text-2xl font-black text-brand-charcoal dark:text-brand-charcoal-dark">{stats.awards}</Text>
                        <Text className="text-[10px] text-brand-charcoal-light dark:text-brand-charcoal-light/60 font-bold uppercase tracking-widest mt-0.5">Awards</Text>
                    </View>
                </View>

                {/* Menu Sections */}
                <View className="bg-white/60 dark:bg-brand-charcoal/40 rounded-[32px] overflow-hidden border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5 shadow-sm">
                    <TouchableOpacity
                        className="flex-row items-center justify-between p-5 border-b border-brand-cream dark:border-brand-cream-dark/20"
                        onPress={() => router.push('/edit-profile')}
                    >
                        <View className="flex-row items-center gap-x-4">
                            <View className="w-10 h-10 rounded-2xl bg-brand-sage/10 items-center justify-center">
                                <LucideEdit3 size={20} color="#697D59" />
                            </View>
                            <Text className="text-base font-bold text-brand-charcoal dark:text-brand-charcoal-dark">Edit Profile</Text>
                        </View>
                        <LucideChevronRight size={20} color="#A1A1A1" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className="flex-row items-center justify-between p-5"
                    >
                        <View className="flex-row items-center gap-x-4">
                            <View className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-900/20 items-center justify-center">
                                <LucideLogOut size={20} color="#EF4444" />
                            </View>
                            <Text className="text-base font-bold text-red-500">Log Out</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({});

