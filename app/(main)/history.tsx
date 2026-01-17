import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import Animated, { FadeInUp } from 'react-native-reanimated';
import { LucideHistory, LucideChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Mock history data (Ported from original concept)
const mockHistory = [
    { id: "1", color: "#FF6B9D", colorName: "Rose Whisper", date: "2 hours ago", nails: 4 },
    { id: "2", color: "#697D59", colorName: "Sage Forest", date: "Yesterday", nails: 5 },
    { id: "3", color: "#2DD4BF", colorName: "Teal Dream", date: "3 days ago", nails: 3 },
    { id: "4", color: "#A78BFA", colorName: "Lilac Sky", date: "Last week", nails: 5 },
];

export default function HistoryScreen() {
    const renderItem = ({ item, index }: { item: typeof mockHistory[0], index: number }) => (
        <View
            style={styles.card}
        >
            <View style={[styles.colorChip, { backgroundColor: item.color }]} />
            <View style={styles.info}>
                <Text style={styles.colorName}>{item.colorName || 'Unnamed Color'}</Text>
                <Text style={styles.details}>{item.date} • {item.nails} nails detected</Text>
            </View>
            <TouchableOpacity style={styles.actionBtn}>
                <LucideChevronRight size={24} color="#E8E5E1" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.titleRow}>
                        <LucideHistory size={32} color="#697D59" strokeWidth={1.5} />
                        <Text style={styles.title}>History</Text>
                    </View>
                </View>
            </SafeAreaView>

            <FlatList
                data={mockHistory}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No looks saved yet.</Text>
                    </View>
                }
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
    },
    title: {
        fontSize: 28,
        color: '#2D2D2D',
        fontWeight: '700',
    },
    listContent: {
        padding: 24,
        paddingBottom: 100,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    colorChip: {
        width: 56,
        height: 56,
        borderRadius: 16,
    },
    info: {
        flex: 1,
        marginLeft: 16,
    },
    colorName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D2D2D',
        marginBottom: 4,
    },
    details: {
        fontSize: 14,
        color: '#8A8A8A',
    },
    actionBtn: {
        padding: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: '#8A8A8A',
        fontSize: 16,
    }
});
