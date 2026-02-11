import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LucideTrophy, LucideMapPin, LucideGlobe, LucideTrendingUp } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const MOCK_GLOBAL = [
    { id: '1', name: 'Zoe Nails', points: 12500, city: 'London', rank: 1, avatar: 'https://i.pravatar.cc/150?u=zoe' },
    { id: '2', name: 'Pixel Artist', points: 10200, city: 'NYC', rank: 2, avatar: 'https://i.pravatar.cc/150?u=pixel' },
    { id: '3', name: 'Gloss Guru', points: 9800, city: 'Tokyo', rank: 3, avatar: 'https://i.pravatar.cc/150?u=gloss' },
];

const MOCK_LOCAL = [
    { id: '4', name: 'Nail Queen', points: 4500, city: 'London', rank: 1, avatar: 'https://i.pravatar.cc/150?u=queen' },
    { id: '1', name: 'Zoe Nails', points: 4200, city: 'London', rank: 2, avatar: 'https://i.pravatar.cc/150?u=zoe' },
    { id: '5', name: 'Shade Seeker', points: 3100, city: 'London', rank: 3, avatar: 'https://i.pravatar.cc/150?u=shade' },
];

export default function LeaderboardScreen() {
    const insets = useSafeAreaInsets();
    const [tab, setTab] = useState<'global' | 'local'>('global');

    const renderItem = ({ item }: { item: typeof MOCK_GLOBAL[0] }) => (
        <View style={styles.rankItem}>
            <View style={styles.rankNumberContainer}>
                {item.rank <= 3 ? (
                    <LucideTrophy size={20} color={item.rank === 1 ? '#FFD700' : item.rank === 2 ? '#C0C0C0' : '#CD7F32'} />
                ) : (
                    <Text style={styles.rankNumber}>{item.rank}</Text>
                )}
            </View>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.cityContainer}>
                    <LucideMapPin size={12} color="#666666" />
                    <Text style={styles.cityText}>{item.city}</Text>
                </View>
            </View>
            <View style={styles.pointsContainer}>
                <Text style={styles.points}>{item.points.toLocaleString()}</Text>
                <Text style={styles.pointsLabel}>Karma</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Kingdom of Color</Text>
                <Text style={styles.subtitle}>Who's setting the trends today?</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    onPress={() => setTab('global')}
                    style={[styles.tab, tab === 'global' && styles.activeTab]}
                >
                    <LucideGlobe size={18} color={tab === 'global' ? '#FFFFFF' : '#666666'} />
                    <Text style={[styles.tabText, tab === 'global' && styles.activeTabText]}>Global</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setTab('local')}
                    style={[styles.tab, tab === 'local' && styles.activeTab]}
                >
                    <LucideMapPin size={18} color={tab === 'local' ? '#FFFFFF' : '#666666'} />
                    <Text style={[styles.tabText, tab === 'local' && styles.activeTabText]}>London</Text>
                </TouchableOpacity>
            </View>

            {/* Featured Trend */}
            <View style={styles.featuredContainer}>
                <View style={styles.featuredLabel}>
                    <LucideTrendingUp size={16} color="#307b75" />
                    <Text style={styles.featuredLabelText}>Trending in {tab === 'global' ? 'the World' : 'London'}</Text>
                </View>
                <Text style={styles.trendName}>#NeonMatte</Text>
                <Text style={styles.trendStats}>Adopted by 1,240 artists today</Text>
            </View>

            <FlatList
                data={tab === 'global' ? MOCK_GLOBAL : MOCK_LOCAL}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[styles.listContent, { paddingBottom: 40 + insets.bottom }]}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#000000',
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        fontWeight: '600',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 24,
        gap: 12,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#EEEEEE',
    },
    activeTab: {
        backgroundColor: '#000000',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#666666',
        marginLeft: 8,
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    featuredContainer: {
        marginHorizontal: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    featuredLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    featuredLabelText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#307b75',
        marginLeft: 6,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    trendName: {
        fontSize: 28,
        fontWeight: '900',
        color: '#000000',
        marginBottom: 4,
    },
    trendStats: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    rankItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    rankNumberContainer: {
        width: 32,
        alignItems: 'center',
    },
    rankNumber: {
        fontSize: 16,
        fontWeight: '800',
        color: '#999999',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginHorizontal: 12,
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000000',
    },
    cityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    cityText: {
        fontSize: 12,
        color: '#666666',
        fontWeight: '600',
        marginLeft: 4,
    },
    pointsContainer: {
        alignItems: 'flex-end',
    },
    points: {
        fontSize: 18,
        fontWeight: '900',
        color: '#307b75',
    },
    pointsLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#999999',
        textTransform: 'uppercase',
    },
});
