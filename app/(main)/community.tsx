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
    const [pastelColors, setPastelColors] = useState<Color[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        AuthService.isLoggedIn().then(setIsLoggedIn);
    }, [isFocused]);

    useEffect(() => {
        const fetchColors = async () => {
            setIsLoading(true);
            try {
                const categorized = await ColorService.getCategorizedColors();
                setPastelColors(categorized.pastels.slice(0, 10));
                setPopularColors(categorized.popular.slice(0, 10));
                setBoldColors(categorized.bold.slice(0, 10));
            } catch (error) {
                console.error('Error fetching colors:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchColors();
    }, []);

    const handleColorSelect = async (color: string, colorName: string) => {
        if (isLoggedIn) {
            router.push({
                pathname: "/photo-instruction",
                params: { color, colorName }
            });
        } else {
            router.push({
                pathname: "/signup",
                params: { returnTo: "/photo-instruction", color, colorName }
            });
        }
    };

    const renderHeader = (title: string, subtitle: string, onSeeAll: () => void) => (
        <View className="flex-row justify-between items-center px-6 mb-6">
            <View>
                <Text className="text-2xl font-bold text-brand-gray dark:text-brand-gray-light">{title}</Text>
                <Text className="text-sm text-brand-gray-medium dark:text-brand-gray-light/60">{subtitle}</Text>
            </View>
            <TouchableOpacity
                onPress={onSeeAll}
                className="w-10 h-10 rounded-full bg-white dark:bg-brand-gray items-center justify-center shadow-sm border border-brand-gray-medium/10"
            >
                <LucideArrowRight size={20} color="#307b75" />
            </TouchableOpacity>
        </View>
    );

    const renderColorItem = ({ item }: { item: Color }) => (
        <TouchableOpacity
            onPress={() => handleColorSelect(item.rgb, item.name)}
            className="mr-4 items-center"
        >
            <View
                className="w-24 h-24 rounded-full mb-3 border-2 border-white"
                style={{ backgroundColor: item.rgb }}
            />
            <Text className="text-[13px] font-semibold text-brand-gray dark:text-brand-gray-light">{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-brand-peach-light dark:bg-brand-peach-dark">
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
                        <Text className="text-4xl font-bold text-white text-center">Paint Your Imaginations</Text>
                    </View>
                </View>

                {isLoading ? (
                    <View className="py-20 justify-center items-center">
                        <ActivityIndicator size="large" color="#307b75" />
                    </View>
                ) : (
                    <>
                        {/* Pastels category */}
                        <View className="pt-10">
                            {renderHeader("Pastels", "Soft & subtle shades", () => router.push('/pastels'))}
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={pastelColors}
                                contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
                                keyExtractor={(item) => item.id}
                                renderItem={renderColorItem}
                            />
                        </View>

                        {/* Popular Choices */}
                        <View className="pt-12">
                            {renderHeader("Popular Choices", "What's trending right now", () => router.push('/popular'))}
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={popularColors}
                                contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
                                keyExtractor={(item) => item.id}
                                renderItem={renderColorItem}
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
                                renderItem={renderColorItem}
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
                                className="mr-4 bg-white dark:bg-brand-gray rounded-[24px] p-6 border border-brand-gray-medium/10 shadow-sm items-center w-36"
                            >
                                <View className="w-16 h-16 rounded-full bg-brand-teal dark:bg-brand-teal-dark items-center justify-center mb-4">
                                    <Text className="text-white text-xl font-bold">{item.initial}</Text>
                                </View>
                                <Text className="text-[15px] font-bold text-center text-brand-gray dark:text-brand-gray-light mb-1">{item.name}</Text>
                                <Text className="text-[11px] text-brand-gray-medium dark:text-brand-gray-light/60 text-center mb-1">{item.colors} colors</Text>
                                <Text className="text-[11px] text-brand-teal dark:text-brand-teal font-bold text-center">{item.followers} followers</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                {/* Create Your Own CTA */}
                <TouchableOpacity
                    onPress={() => router.push('/(main)/custom')}
                    className="mx-6 mt-16 bg-gradient-to-br from-brand-teal to-brand-coral rounded-[32px] p-10 items-center shadow-lg"
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
