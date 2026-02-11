import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Alert, Image, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LucideHistory, LucideTrash2, LucideShare2, LucideCamera } from 'lucide-react-native';
import { HistoryService, HistoryItem, IntentTag } from '../../services/history';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

const intentIcons: Record<IntentTag, string> = {
    Everyday: '☀️',
    Work: '💼',
    Experiment: '🎨',
    Trend: '✨',
    Event: '🎉',
};

export default function HistoryScreen() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [filter, setFilter] = useState<IntentTag | 'All'>('All');
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const loadHistory = async () => {
        setIsLoading(true);
        const data = await HistoryService.getHistory();
        setHistory(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const handleDelete = (id: string) => {
        Alert.alert(
            "Delete Record",
            "Are you sure you want to remove this attempt?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await HistoryService.deleteItem(id);
                        if (expandedId === id) {
                            setExpandedId(null);
                        }
                        loadHistory();
                    }
                }
            ]
        );
    };

    const toggleExpand = (id: string, hasImage: boolean) => {
        if (!hasImage) return;

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredHistory = filter === 'All'
        ? history
        : history.filter(item => item.intent === filter);

    const renderFilterItem = (label: IntentTag | 'All', icon?: string) => (
        <TouchableOpacity
            key={label}
            onPress={() => setFilter(label)}
            className={`px-5 py-2.5 rounded-full mr-2 flex-row items-center border ${filter === label
                ? 'bg-brand-teal border-brand-teal shadow-md'
                : 'bg-white border-brand-gray-medium/10 shadow-sm'
                }`}
        >
            {icon && <Text className="mr-1.5">{icon}</Text>}
            <Text className={`font-semibold ${filter === label ? 'text-white' : 'text-brand-gray-medium'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const renderItem = ({ item }: { item: HistoryItem }) => {
        const dateObj = new Date(item.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const isExpanded = expandedId === item.id;
        const hasImage = !!item.processedImageUri;

        return (
            <TouchableOpacity
                activeOpacity={hasImage ? 0.7 : 1}
                onPress={() => toggleExpand(item.id, hasImage)}
                className="bg-white dark:bg-brand-gray rounded-[28px] p-5 mb-5 border border-brand-gray-medium/5 shadow-sm"
            >
                <View className="flex-row items-center">
                    {/* Color Block with Camera Icon */}
                    <View className="relative">
                        <View
                            style={{ backgroundColor: item.color }}
                            className="w-20 h-20 rounded-2xl shadow-inner border border-brand-gray-medium/10"
                        />
                        {hasImage && (
                            <View className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 items-center justify-center shadow-sm">
                                <LucideCamera size={12} color="#307b75" />
                            </View>
                        )}
                    </View>

                    {/* Info */}
                    <View className="flex-1 ml-5">
                        <Text className="text-lg font-bold text-brand-gray dark:text-brand-gray-light mb-1">
                            {item.color_details?.name || item.color.toUpperCase()}
                        </Text>
                        <View className="flex-row items-center">
                            <Text className="text-sm text-brand-gray-medium dark:text-brand-gray-medium/60">
                                {intentIcons[item.intent]} {item.intent} • {formattedDate}
                            </Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View className="flex-row gap-x-4">
                        <TouchableOpacity>
                            <LucideShare2 size={20} color="#8A8A8A" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item.id)}>
                            <LucideTrash2 size={20} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Expanded Image View */}
                {isExpanded && hasImage && (
                    <View className="mt-5 pt-5 border-t border-brand-gray-medium/10">
                        <Text className="text-sm font-semibold text-brand-gray dark:text-brand-gray-light mb-3">
                            Your Virtual Look
                        </Text>
                        <Image
                            source={{ uri: item.processedImageUri }}
                            className="w-full rounded-2xl"
                            style={{ height: width - 80, backgroundColor: '#f5f5f5' }}
                            resizeMode="cover"
                        />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-brand-peach dark:bg-brand-peach-dark">
            <SafeAreaView edges={['top']} className="bg-brand-peach/80 dark:bg-brand-peach-dark/80">
                <View className="px-6 pt-4 pb-6">
                    <View className="flex-row items-center gap-x-3 mb-6">
                        <LucideHistory size={32} color="#307b75" strokeWidth={1.5} />
                        <Text className="text-3xl font-bold text-brand-gray dark:text-brand-gray-light">My History</Text>
                    </View>

                    {/* Filter Bar */}
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={['All', 'Everyday', 'Work', 'Experiment', 'Trend', 'Event'] as const}
                        renderItem={({ item }) => renderFilterItem(
                            item,
                            item !== 'All' ? intentIcons[item as IntentTag] : undefined
                        )}
                        keyExtractor={(item) => item}
                        className="py-1"
                    />
                </View>
            </SafeAreaView>

            <FlatList
                data={filteredHistory}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="mt-20 items-center justify-center px-10">
                        <LucideHistory size={64} color="#8A8A8A" opacity={0.2} className="mb-4" />
                        <Text className="text-[#8A8A8A] text-lg text-center font-medium">
                            {filter === 'All'
                                ? "No looks saved yet. Start painting your nails to see them here!"
                                : `No looks tagged as "${filter}" yet.`}
                        </Text>
                    </View>
                }
                onRefresh={loadHistory}
                refreshing={isLoading}
            />
        </View>
    );
}
