import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
// import Animated, { FadeInUp } from 'react-native-reanimated';
import { LucideSearch, LucideTrendingUp, LucideHeart, LucideShare2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 64) / 2;

const mockColors = [
    { id: "1", color: "#FF6B9D", name: "Blushing Rose", author: "Sarah M.", likes: 234, isLiked: false },
    { id: "2", color: "#A78BFA", name: "Lavender Dream", author: "Emma K.", likes: 189, isLiked: true },
    { id: "3", color: "#697D59", name: "Sage Serenity", author: "Olivia P.", likes: 312, isLiked: false },
    { id: "4", color: "#F97316", name: "Sunset Coral", author: "Maya L.", likes: 156, isLiked: false },
    { id: "5", color: "#2DD4BF", name: "Ocean Breeze", author: "Sophie T.", likes: 267, isLiked: true },
    { id: "6", color: "#DC2626", name: "Cherry Bomb", author: "Isabella R.", likes: 198, isLiked: false },
    { id: "7", color: "#FBBF24", name: "Golden Hour", author: "Ava S.", likes: 145, isLiked: false },
    { id: "8", color: "#C084FC", name: "Violet Velvet", author: "Mia W.", likes: 223, isLiked: false },
];

export default function CommunityScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [colors, setColors] = useState(mockColors);

    const handleColorSelect = (color: string) => {
        router.push({
            pathname: "/camera",
            params: { color }
        });
    };

    const renderItem = ({ item, index }: { item: typeof mockColors[0], index: number }) => (
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
                        <TouchableOpacity className="flex-row items-center gap-x-1">
                            <LucideHeart size={16} color={item.isLiked ? '#FF6B9D' : '#8A8A8A'} fill={item.isLiked ? '#FF6B9D' : 'transparent'} />
                            <Text className="text-xs text-brand-charcoal-light dark:text-brand-charcoal-light/60">{item.likes}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center"
                            onPress={() => {
                                import('react-native').then(({ Share }) => {
                                    Share.share({
                                        message: `Check out this gorgeous nail color: ${item.name} (${item.color})! Found on Colorfloww.`,
                                        title: 'Share Nail Color'
                                    });
                                });
                            }}
                        >
                            <LucideShare2 size={16} color="#8A8A8A" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-brand-cream dark:bg-brand-cream-dark">
            <SafeAreaView edges={['top']} className="bg-brand-cream/80 dark:bg-brand-cream-dark/80">
                <View className="px-6 pt-4 pb-5">
                    <View className="flex-row items-center gap-x-3 mb-5">
                        <LucideTrendingUp size={32} color="#697D59" strokeWidth={1.5} />
                        <Text className="text-3xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark">Community</Text>
                    </View>

                    <View className="flex-row items-center bg-white/60 dark:bg-brand-charcoal/40 rounded-2xl border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5 px-4 h-[52px]">
                        <LucideSearch size={20} color="#8A8A8A" className="mr-2" />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search colors or creators..."
                            placeholderTextColor="#8A8A8A"
                            className="flex-1 text-base text-brand-charcoal dark:text-brand-charcoal-dark"
                        />
                    </View>
                </View>
            </SafeAreaView>

            <FlatList
                data={colors}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({});

