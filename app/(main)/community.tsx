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
        <View
            style={styles.card}
        >
            <TouchableOpacity
                onPress={() => handleColorSelect(item.color)}
                activeOpacity={0.9}
                style={[styles.colorBox, { backgroundColor: item.color }]}
            >
                <View style={styles.tryOnBadge}>
                    <Text style={styles.tryOnText}>Try On</Text>
                </View>
            </TouchableOpacity>

            <View style={styles.cardInfo}>
                <Text style={styles.colorName}>{item.name}</Text>
                <Text style={styles.author}>by {item.author}</Text>

                <View style={styles.cardFooter}>
                    <Text style={styles.hexText}>{item.color}</Text>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.iconBtn}>
                            <LucideHeart size={16} color={item.isLiked ? '#FF6B9D' : '#8A8A8A'} fill={item.isLiked ? '#FF6B9D' : 'transparent'} />
                            <Text style={styles.likesCount}>{item.likes}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn}>
                            <LucideShare2 size={16} color="#8A8A8A" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.titleRow}>
                        <LucideTrendingUp size={32} color="#697D59" strokeWidth={1.5} />
                        <Text style={styles.title}>Community Colors</Text>
                    </View>

                    <View style={styles.searchBar}>
                        <LucideSearch size={20} color="#8A8A8A" style={styles.searchIcon} />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search colors or creators..."
                            placeholderTextColor="#8A8A8A"
                            style={styles.searchInput}
                        />
                    </View>
                </View>
            </SafeAreaView>

            <FlatList
                data={colors}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F7F4',
    },
    header: {
        backgroundColor: 'rgba(249, 247, 244, 0.8)',
    },
    headerContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        color: '#2D2D2D',
        fontWeight: '700',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        paddingHorizontal: 16,
        height: 52,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#2D2D2D',
    },
    listContent: {
        padding: 24,
        paddingBottom: 100,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    card: {
        width: COLUMN_WIDTH,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    colorBox: {
        width: '100%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tryOnBadge: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    tryOnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    cardInfo: {
        padding: 12,
    },
    colorName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2D2D2D',
        marginBottom: 2,
    },
    author: {
        fontSize: 12,
        color: '#8A8A8A',
        marginBottom: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    hexText: {
        fontSize: 10,
        color: '#8A8A8A',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    likesCount: {
        fontSize: 12,
        color: '#8A8A8A',
    }
});
