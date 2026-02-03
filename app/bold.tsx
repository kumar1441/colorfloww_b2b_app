import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideChevronLeft, LucideHeart, LucideShare2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 64) / 2;

const boldColors = [
    { id: "1", color: "#DC2626", name: "Crimson Red", author: "Sarah M.", likes: 452, isLiked: false },
    { id: "2", color: "#EC4899", name: "Deep Pink", author: "Emma K.", likes: 381, isLiked: false },
    { id: "3", color: "#6D28D9", name: "Royal Purple", author: "Olivia P.", likes: 298, isLiked: true },
    { id: "4", color: "#1F2937", name: "Midnight Onyx", author: "Maya L.", likes: 167, isLiked: false },
    { id: "5", color: "#B91C1C", name: "Ruby Flare", author: "Sophie T.", likes: 521, isLiked: false },
    { id: "6", color: "#0000FF", name: "Electric Blue", author: "Isabella R.", likes: 432, isLiked: true },
    { id: "7", color: "#008000", name: "Emerald Green", author: "Ava S.", likes: 212, isLiked: false },
    { id: "8", color: "#FF8C00", name: "Dynamic Orange", author: "Mia W.", likes: 312, isLiked: false },
];

export default function BoldScreen() {
    const router = useRouter();

    const handleColorSelect = (color: string) => {
        router.push({
            pathname: "/camera",
            params: { color }
        });
    };

    const renderItem = ({ item }: { item: typeof boldColors[0] }) => (
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
                        <LucideHeart size={16} color={item.isLiked ? '#EC4899' : '#8A8A8A'} fill={item.isLiked ? '#EC4899' : 'transparent'} />
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
                    <Text className="text-2xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark">Bold Statements</Text>
                </View>
            </SafeAreaView>

            <FlatList
                data={boldColors}
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
