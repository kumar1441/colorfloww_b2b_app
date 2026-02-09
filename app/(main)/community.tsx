import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideArrowRight, LucideSparkles, LucideLogOut } from 'lucide-react-native';
import { AuthService } from '../../services/auth';
import { ColorService, Color } from '../../services/color';
import { useIsFocused } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const topCreators = [
    { id: "1", name: "Sarah M.", colors: 45, followers: "2.3k", initial: "S" },
    { id: "2", name: "Emma K.", colors: 38, followers: "1.8k", initial: "E" },
    { id: "3", name: "Olivia P.", colors: 52, followers: "3.1k", initial: "O" },
];

export default function HomeScreen() {
    const router = useRouter();
    const isFocused = useIsFocused();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [popularColors, setPopularColors] = useState<Color[]>([]);
    const [boldColors, setBoldColors] = useState<Color[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        AuthService.isLoggedIn().then(setIsLoggedIn);
    }, [isFocused]);

    useEffect(() => {
        const fetchColors = async () => {
            setIsLoading(true);
            try {
                const colors = await ColorService.getColors();
                // Simple logic to split colors: first 5 are popular, next 5 are bold
                setPopularColors(colors.slice(0, 5));
                setBoldColors(colors.slice(5, 10));
            } catch (error) {
                console.error('Error fetching colors:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchColors();
    }, []);

    const handleColorSelect = async (color: string) => {
        if (isLoggedIn) {
            router.push({
                pathname: "/camera",
                params: { color }
            });
        } else {
            router.push({
                pathname: "/signup",
                params: { returnTo: "/camera", color }
            });
        }
    };

    const renderHeader = (title: string, subtitle: string, onSeeAll: () => void) => (
        <View className="flex-row justify-between items-center px-6 mb-6">
            <View>
                <Text className="text-2xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark">{title}</Text>
                <Text className="text-sm text-brand-charcoal-light dark:text-brand-charcoal-light/60">{subtitle}</Text>
            </View>
            <TouchableOpacity
                onPress={onSeeAll}
                className="w-10 h-10 rounded-full bg-white dark:bg-brand-charcoal items-center justify-center shadow-sm border border-brand-charcoal-light/10"
            >
                <LucideArrowRight size={20} color="#697D59" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View className="flex-1 bg-white dark:bg-brand-cream-dark">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Hero Section */}
                <View className="relative w-full h-[450px]">
                    <Image
                        source={require('../../assets/hero.png')}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                    <View className="absolute inset-0 bg-black/30 justify-center items-center p-8">
                        <LucideSparkles color="white" size={48} className="mb-4" />
                        <Text className="text-4xl font-bold text-white text-center mb-4">Try On Nails</Text>
                        <Text className="text-white text-center text-lg leading-6 font-medium">
                            For the first time, you can try before you buy. Virtually explore millions of shades on your fingers and see how gorgeous they look.
                        </Text>
                    </View>
                </View>

                {isLoading ? (
                    <View className="py-20 justify-center items-center">
                        <ActivityIndicator size="large" color="#697D59" />
                    </View>
                ) : (
                    <>
                        {/* Popular Choices */}
                        <View className="pt-10">
                            {renderHeader("Popular Choices", "What's trending right now", () => router.push('/popular'))}
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={popularColors}
                                contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => handleColorSelect(item.rgb)}
                                        className="mr-4 items-center"
                                    >
                                        <View
                                            className="w-24 h-24 rounded-full shadow-md mb-3 border-2 border-white"
                                            style={{ backgroundColor: item.rgb }}
                                        />
                                        <Text className="text-[13px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark">{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>

                        {/* Bold Category */}
                        <View className="pt-12">
                            {renderHeader("Bold", "Make a statement", () => router.push('/bold'))}
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={boldColors}
                                contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => handleColorSelect(item.rgb)}
                                        className="mr-4 items-center"
                                    >
                                        <View
                                            className="w-24 h-24 rounded-full shadow-md mb-3 border-2 border-white"
                                            style={{ backgroundColor: item.rgb }}
                                        />
                                        <Text className="text-[13px] font-semibold text-brand-charcoal dark:text-brand-charcoal-dark">{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </>
                )}

                {/* Top Creators */}
                <View className="pt-12">
                    {renderHeader("Top Creators", "Discover curated collections", () => router.push('/creators'))}
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={topCreators}
                        contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className="mr-4 bg-white dark:bg-brand-charcoal rounded-[24px] p-6 border border-brand-charcoal-light/10 shadow-sm items-center w-36"
                            >
                                <View className="w-16 h-16 rounded-full bg-brand-sage dark:bg-brand-sage-dark items-center justify-center mb-4">
                                    <Text className="text-white text-xl font-bold">{item.initial}</Text>
                                </View>
                                <Text className="text-[15px] font-bold text-center text-brand-charcoal dark:text-brand-charcoal-dark mb-1">{item.name}</Text>
                                <Text className="text-[11px] text-brand-charcoal-light dark:text-brand-charcoal-light/60 text-center mb-1">{item.colors} colors</Text>
                                <Text className="text-[11px] text-brand-sage dark:text-brand-sage-dark font-bold text-center">{item.followers} followers</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                {/* Create Your Own CTA */}
                <TouchableOpacity
                    onPress={() => router.push('/(main)/custom')}
                    className="mx-6 mt-16 bg-brand-sage dark:bg-brand-sage-dark rounded-[32px] p-10 items-center shadow-lg"
                >
                    <LucideSparkles color="white" size={40} className="mb-4" />
                    <Text className="text-2xl font-bold text-white mb-2 text-center">Create Your Own</Text>
                    <Text className="text-white/80 text-center mb-8 px-2">Mix and match to create your perfect shade</Text>
                    <View className="bg-white px-8 py-3 rounded-full">
                        <Text className="text-brand-sage font-bold">Start Creating</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
