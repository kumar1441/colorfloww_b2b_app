import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideChevronLeft, LucideHeart, LucideShare2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 64) / 2;

const popularColors = [
    { id: "1", color: "#FF6B9D", name: "Blushing Rose", author: "Sarah M.", likes: 234, isLiked: false },
    { id: "2", color: "#A78BFA", name: "Lavender Dream", author: "Emma K.", likes: 189, isLiked: true },
    { id: "3", color: "#697D59", name: "Sage Serenity", author: "Olivia P.", likes: 312, isLiked: false },
    { id: "4", color: "#F97316", name: "Sunset Coral", author: "Maya L.", likes: 156, isLiked: false },
    { id: "5", color: "#2DD4BF", name: "Ocean Breeze", author: "Sophie T.", likes: 267, isLiked: true },
    { id: "6", color: "#DC2626", name: "Cherry Bomb", author: "Isabella R.", likes: 198, isLiked: false },
    { id: "7", color: "#FBBF24", name: "Golden Hour", author: "Ava S.", likes: 145, isLiked: false },
    { id: "8", color: "#C084FC", name: "Violet Velvet", author: "Mia W.", likes: 223, isLiked: false },
];

export default function PopularScreen() {
    const router = useRouter();

    const handleColorSelect = (color: string) => {
        router.push({
            pathname: "/camera",
            params: { color }
        });
    };

    const renderItem = ({ item }: { item: typeof popularColors[0] }) => (
        <View className="bg-white dark:bg-brand-charcoal rounded-[24px] border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5 overflow-hidden shadow-sm mb-5" style={{ width: COLUMN_WIDTH }}>
            <TouchableOpacity
                onPress={() => handleColorSelect(item.color)}
                activeOpacity={0.9}
                className="w-full aspect-square justify-center items-center"
                style={{ backgroundColor: item.color }}
            >
                <View className="bg-black/40 px-4 py-2 rounded-full">
                    <Text className="text-white text-[13px] font-semibold">Try On</Text>
                </View>
            </TouchableOpacity>

            <View className="p-3">
                <Text className="text-[15px] font-bold text-brand-charcoal dark:text-brand-charcoal-dark mb-0.5">{item.name}</Text>
                <Text className="text-xs text-brand-charcoal-light dark:text-brand-charcoal-light/60 mb-2">by {item.author}</Text>

                <View className="flex-row justify-between items-center">
                    <Text className="text-[10px] text-brand-charcoal-light dark:text-brand-charcoal-light/60 font-mono">{item.color}</Text>
                    <View className="flex-row items-center gap-x-3">
                        <LucideHeart size={16} color={item.isLiked ? '#FF6B9D' : '#8A8A8A'} fill={item.isLiked ? '#FF6B9D' : 'transparent'} />
                        <LucideShare2 size={16} color="#8A8A8A" />
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-brand-cream dark:bg-brand-cream-dark">
            <SafeAreaView edges={['top']} className="bg-brand-cream/80 dark:bg-brand-cream-dark/80">
                <View className="px-6 py-4 flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <LucideChevronLeft size={28} color="#697D59" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark">Popular Choices</Text>
                </View>
            </SafeAreaView>

            <FlatList
                data={popularColors}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={{ padding: 24 }}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
