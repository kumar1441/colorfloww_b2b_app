import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideUser, LucideSettings, LucideTrophy, LucideLogOut, LucideChevronRight, LucideFlame } from 'lucide-react-native';
import { GamificationService } from '../../services/gamification';
import StreakCard from '../../components/StreakCard';
import StreakShareModal from '../../components/StreakShareModal';

/**
 * ProfileScreen: Displays user info and gamification stats (streaks, awards).
 */
export default function ProfileScreen() {
    const router = useRouter();
    const [streak, setStreak] = useState(0);
    const [isShareModalVisible, setShareModalVisible] = useState(false);

    useEffect(() => {
        GamificationService.getStreak().then(setStreak);
    }, []);

    const handleLogout = () => {
        router.replace('/');
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
                <View className="items-center mb-8">
                    <View className="w-24 h-24 rounded-full bg-white dark:bg-brand-charcoal items-center justify-center mb-4 shadow-md border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5">
                        <LucideUser size={48} color="#697D59" />
                    </View>
                    <Text className="text-2xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark mb-1">Nail Enthusiast</Text>
                    <Text className="text-sm text-brand-charcoal-light dark:text-brand-charcoal-light/60">nail.lover@example.com</Text>
                </View>

                {/* Streak Card */}
                <StreakCard
                    streak={streak}
                    onShare={() => setShareModalVisible(true)}
                />

                {/* Share Modal */}
                <StreakShareModal
                    visible={isShareModalVisible}
                    streak={streak}
                    onClose={() => setShareModalVisible(false)}
                />

                {/* Stats Row */}
                <View className="flex-row justify-between mb-8 gap-x-2">
                    <View className="flex-1 bg-white/60 dark:bg-brand-charcoal/40 rounded-2xl p-4 items-center border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5 shadow-sm">
                        <LucideFlame size={20} color="#F97316" className="mb-1" />
                        <Text className="text-xl font-bold text-brand-sage dark:text-brand-sage-dark mb-1">{streak}</Text>
                        <Text className="text-[10px] text-brand-charcoal-light dark:text-brand-charcoal-light/60 font-semibold uppercase tracking-wider">Day Streak</Text>
                    </View>
                    <View className="flex-1 bg-white/60 dark:bg-brand-charcoal/40 rounded-2xl p-4 items-center border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5 shadow-sm">
                        <LucideTrophy size={20} color="#FBBF24" className="mb-1" />
                        <Text className="text-xl font-bold text-brand-sage dark:text-brand-sage-dark mb-1">12</Text>
                        <Text className="text-[10px] text-brand-charcoal-light dark:text-brand-charcoal-light/60 font-semibold uppercase tracking-wider">Looks</Text>
                    </View>
                    <View className="flex-1 bg-white/60 dark:bg-brand-charcoal/40 rounded-2xl p-4 items-center border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5 shadow-sm">
                        <LucideTrophy size={20} color="#A78BFA" className="mb-1" />
                        <Text className="text-xl font-bold text-brand-sage dark:text-brand-sage-dark mb-1">4</Text>
                        <Text className="text-[10px] text-brand-charcoal-light dark:text-brand-charcoal-light/60 font-semibold uppercase tracking-wider">Awards</Text>
                    </View>
                </View>

                {/* Menu Sections */}
                <View className="bg-white/60 dark:bg-brand-charcoal/40 rounded-3xl overflow-hidden border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5 shadow-sm">
                    <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-brand-cream dark:border-brand-cream-dark/20">
                        <View className="flex-row items-center gap-x-4">
                            <View className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 items-center justify-center">
                                <LucideTrophy size={18} color="#0EA5E9" />
                            </View>
                            <Text className="text-base font-semibold text-brand-charcoal dark:text-brand-charcoal-dark">Achievements</Text>
                        </View>
                        <LucideChevronRight size={20} color="#A1A1A1" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className="flex-row items-center justify-between p-4"
                    >
                        <View className="flex-row items-center gap-x-4">
                            <View className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 items-center justify-center">
                                <LucideLogOut size={18} color="#EF4444" />
                            </View>
                            <Text className="text-base font-semibold text-red-500">Log Out</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({});

