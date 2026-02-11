import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideChevronLeft, LucideHeart, LucideShare2 } from 'lucide-react-native';
import { AuthService } from '../services/auth';
import { ColorService, Color } from '../services/color';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 64) / 2;

export default function BoldScreen() {
    const router = useRouter();
    const [colors, setColors] = useState<Color[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchColors = async () => {
            setIsLoading(true);
            try {
                // Fetching 30 colors as requested
                const data = await ColorService.getColors(30);
                setColors(data);
            } catch (error) {
                console.error('Error fetching bold colors:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchColors();
    }, []);

    const handleColorSelect = async (color: string, name: string) => {
        const loggedIn = await AuthService.isLoggedIn();
        if (loggedIn) {
            router.push({
                pathname: "/camera",
                params: {
                    color,
                    colorName: name
                }
            });
        } else {
            router.push({
                pathname: "/signup",
                params: {
                    returnTo: "/camera",
                    color,
                    colorName: name
                }
            });
        }
    };

    const renderItem = ({ item }: { item: Color }) => (
        <View className="bg-white dark:bg-brand-gray rounded-[24px] border border-brand-gray-medium/10 dark:border-brand-gray-medium/5 overflow-hidden shadow-sm mb-5" style={{ width: COLUMN_WIDTH }}>
            <TouchableOpacity
                onPress={() => handleColorSelect(item.rgb, item.name)}
                activeOpacity={0.9}
                className="w-full aspect-square justify-center items-center"
                style={{ backgroundColor: item.rgb }}
            >
                <View className="bg-black/40 px-4 py-2 rounded-full">
                    <Text className="text-white text-[13px] font-semibold">Try On</Text>
                </View>
            </TouchableOpacity>

            <View className="p-3">
                <Text className="text-[15px] font-bold text-brand-gray dark:text-brand-gray-light mb-0.5" numberOfLines={1}>{item.name}</Text>
                <Text className="text-xs text-brand-gray-medium dark:text-brand-gray-medium/60 mb-2">by ColorFloww</Text>

                <View className="flex-row justify-between items-center">
                    <Text className="text-[10px] text-brand-gray-medium dark:text-brand-gray-medium/60 font-mono">{item.rgb}</Text>
                    <View className="flex-row items-center gap-x-3">
                        <LucideHeart size={16} color={'#8A8A8A'} />
                        <LucideShare2 size={16} color="#8A8A8A" />
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-brand-peach dark:bg-brand-peach-dark">
            <SafeAreaView edges={['top']} className="bg-brand-peach/80 dark:bg-brand-peach-dark/80">
                <View className="px-6 py-4 flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <LucideChevronLeft size={28} color="#307b75" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-brand-gray dark:text-brand-gray-light">Bold Statements</Text>
                </View>
            </SafeAreaView>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#307b75" />
                </View>
            ) : (
                <FlatList
                    data={colors}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={{ padding: 24 }}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}
