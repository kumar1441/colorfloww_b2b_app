import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideChevronLeft, LucideUsers, LucideArrowRight } from 'lucide-react-native';
import { AuthService } from '../services/auth';

const topCreators = [
    { id: "1", name: "Sarah M.", colorsCount: 45, followers: "2.3k", initial: "S" },
    { id: "2", name: "Emma K.", colorsCount: 38, followers: "1.8k", initial: "E" },
    { id: "3", name: "Olivia P.", colorsCount: 52, followers: "3.1k", initial: "O" },
    { id: "4", name: "Maya L.", colorsCount: 29, followers: "1.2k", initial: "M" },
    { id: "5", name: "Sophie T.", colorsCount: 61, followers: "4.5k", initial: "S" },
];

export default function CreatorsScreen() {
    const router = useRouter();

    const renderItem = ({ item }: { item: typeof topCreators[0] }) => (
        <TouchableOpacity
            activeOpacity={0.7}
            className="bg-white dark:bg-brand-charcoal rounded-[24px] p-5 mb-4 border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5 flex-row items-center shadow-sm"
        >
            <View className="w-16 h-16 rounded-full bg-brand-sage dark:bg-brand-sage-dark items-center justify-center mr-4">
                <Text className="text-white text-2xl font-bold">{item.initial}</Text>
            </View>
            <View className="flex-1">
                <Text className="text-lg font-bold text-brand-charcoal dark:text-brand-charcoal-dark">{item.name}</Text>
                <Text className="text-sm text-brand-charcoal-light dark:text-brand-charcoal-light/60">{item.colorsCount} colors • {item.followers} followers</Text>
            </View>
            <LucideArrowRight size={20} color="#697D59" />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-brand-cream dark:bg-brand-cream-dark">
            <SafeAreaView edges={['top']} className="bg-brand-cream/80 dark:bg-brand-cream-dark/80">
                <View className="px-6 py-4 flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <LucideChevronLeft size={28} color="#697D59" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark">Top Creators</Text>
                </View>
            </SafeAreaView>

            <FlatList
                data={topCreators}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 24 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
