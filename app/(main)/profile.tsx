import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, Share, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { LucideUser, LucideSettings, LucideTrophy, LucideLogOut, LucideChevronRight, LucideFlame, LucideCamera, LucideMail, LucideEdit3, LucideMessageSquare, LucideGift, LucideShare2, LucideInfo, LucideShield } from 'lucide-react-native';
import { AuthService } from '../../services/auth';
import { GamificationService } from '../../services/gamification';
import { AnalyticsService } from '../../services/analytics';
import StreakCard from '../../components/StreakCard';
import StreakShareModal from '../../components/StreakShareModal';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { FeedbackModal } from '../../components/FeedbackModal';

/**
 * ProfileScreen: Displays user info and gamification stats (streaks, awards).
 */
export default function ProfileScreen() {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<any>(null);
    const [stats, setStats] = useState({ streak: 0, looks: 0, awards: 0, karma: 0 });
    const [activityData, setActivityData] = useState<boolean[]>(new Array(7).fill(false));
    const [isShareModalVisible, setShareModalVisible] = useState(false);
    const [isFeedbackModalVisible, setFeedbackModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const insets = useSafeAreaInsets();

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [profile, streak, looks, awards] = await Promise.all([
                AuthService.getFullUserProfile(),
                GamificationService.getStreak(),
                GamificationService.getLooksCount(),
                GamificationService.getAwardsCount()
            ]);
            const activity = await GamificationService.getActivityForWeek();

            setUserProfile(profile);
            setStats({
                streak,
                looks,
                awards,
                karma: profile?.karma ?? 0
            });
            setActivityData(activity);
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
        AnalyticsService.reset();
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
                <View style={{ paddingTop: Math.max(insets.top, 0) }} className="px-6 pb-5 flex-row justify-between items-center">
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

                {/* Referral Card */}
                <View className="bg-brand-sage/10 dark:bg-brand-sage/5 rounded-[32px] p-6 mb-8 border border-brand-sage/20 relative overflow-hidden">
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center gap-x-3">
                            <View className="w-10 h-10 rounded-2xl bg-brand-sage/20 items-center justify-center">
                                <LucideGift size={20} color="#697D59" />
                            </View>
                            <View>
                                <Text className="text-lg font-bold text-brand-charcoal dark:text-brand-charcoal-dark">Refer a Friend</Text>
                                <Text className="text-xs text-brand-charcoal-light dark:text-brand-charcoal-light/60">Unlock benefits for both</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={async () => {
                                try {
                                    await Share.share({
                                        message: `Join me on ColorFloww! Use my referral code ${userProfile?.referralCode} to unlock premium features.`,
                                    });
                                } catch (error: any) {
                                    Alert.alert(error.message);
                                }
                            }}
                            className="bg-brand-sage px-4 py-2 rounded-xl shadow-sm"
                        >
                            <Text className="text-white font-bold text-sm">Share</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center justify-between bg-white/50 dark:bg-brand-charcoal/30 rounded-2xl p-4 border border-brand-sage/10">
                        <Text className="text-brand-charcoal-light dark:text-brand-charcoal-light/60 font-medium">Your Code</Text>
                        <Text className="text-xl font-black text-brand-sage tracking-widest uppercase">{userProfile?.referralCode || 'GETCODE1'}</Text>
                    </View>

                    <View className="absolute -bottom-4 -right-4 opacity-5">
                        <LucideGift size={80} color="#697D59" />
                    </View>
                </View>

                {/* Streak Card */}
                <StreakCard
                    streak={stats.streak}
                    activityData={activityData}
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
                        <Text className="text-2xl font-black text-brand-charcoal dark:text-brand-charcoal-dark">{stats.karma}</Text>
                        <Text className="text-[10px] text-brand-charcoal-light dark:text-brand-charcoal-light/60 font-bold uppercase tracking-widest mt-0.5">Karma</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push('/history')}
                        className="flex-1 bg-white/60 dark:bg-brand-charcoal/40 rounded-[24px] p-5 items-center border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5 shadow-sm"
                    >
                        <View className="w-10 h-10 rounded-full bg-yellow-50 dark:bg-yellow-900/20 items-center justify-center mb-2">
                            <LucideTrophy size={20} color="#FBBF24" />
                        </View>
                        <Text className="text-2xl font-black text-brand-charcoal dark:text-brand-charcoal-dark">{stats.looks}</Text>
                        <Text className="text-[10px] text-brand-charcoal-light dark:text-brand-charcoal-light/60 font-bold uppercase tracking-widest mt-0.5">Looks</Text>
                    </TouchableOpacity>

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
                        className="flex-row items-center justify-between p-5 border-b border-brand-cream dark:border-brand-cream-dark/20"
                        onPress={() => setFeedbackModalVisible(true)}
                    >
                        <View className="flex-row items-center gap-x-4">
                            <View className="w-10 h-10 rounded-2xl bg-brand-sage/10 items-center justify-center">
                                <LucideMessageSquare size={20} color="#697D59" />
                            </View>
                            <Text className="text-base font-bold text-brand-charcoal dark:text-brand-charcoal-dark">Give Feedback</Text>
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

                {/* About & Legal Section */}
                <View className="mt-8 mb-8">
                    <Text className="text-lg font-bold text-brand-charcoal dark:text-brand-charcoal-dark mb-4 px-2">About ColorFloww</Text>

                    <View className="bg-white/60 dark:bg-brand-charcoal/40 rounded-[32px] overflow-hidden border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5 shadow-sm p-6 mb-4">
                        <Text className="text-brand-charcoal-light dark:text-brand-charcoal-light/80 leading-6 mb-4">
                            ColorFloww is your personal nail styling companion. Discover, try on, and track your favorite nail looks with the power of AI.
                        </Text>
                        <View className="flex-row items-center gap-x-2 opacity-50">
                            <LucideInfo size={16} color="#697D59" />
                            <Text className="text-xs font-bold text-brand-charcoal-light dark:text-brand-charcoal-light/60 uppercase tracking-widest">Version 1.1.0</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => Linking.openURL('https://colorfloww.com/privacy')}
                        className="bg-white/60 dark:bg-brand-charcoal/40 rounded-[24px] p-5 flex-row items-center justify-between border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5 shadow-sm"
                    >
                        <View className="flex-row items-center gap-x-4">
                            <View className="w-10 h-10 rounded-2xl bg-brand-sage/10 items-center justify-center">
                                <LucideShield size={20} color="#697D59" />
                            </View>
                            <Text className="text-base font-bold text-brand-charcoal dark:text-brand-charcoal-dark">Privacy Policy</Text>
                        </View>
                        <LucideChevronRight size={20} color="#A1A1A1" />
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <FeedbackModal
                visible={isFeedbackModalVisible}
                onClose={() => setFeedbackModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({});

