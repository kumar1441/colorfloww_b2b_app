import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Modal,
    ActivityIndicator, StyleSheet, Dimensions
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useRouter } from 'expo-router';
import { LucideChevronLeft, LucideLock, LucideX, LucideTrophy } from 'lucide-react-native';
import { GamificationService, AwardDefinition, RARITY_COLORS, RARITY_BG } from '../services/gamification';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48 - 16) / 3; // 3 columns with padding

type AwardWithStatus = AwardDefinition & { earned: boolean; earnedAt?: string };

export default function AwardsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [awards, setAwards] = useState<AwardWithStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAward, setSelectedAward] = useState<AwardWithStatus | null>(null);

    const loadAwards = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await GamificationService.getAwardsWithStatus();
            setAwards(data);
        } catch (e) {
            console.error('[AwardsScreen] load error:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadAwards();
        }, [loadAwards])
    );

    const earnedAwards = awards.filter(a => a.earned);
    const lockedAwards = awards.filter(a => !a.earned);

    const formatDate = (iso?: string) => {
        if (!iso) return '';
        return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const rarityLabel: Record<string, string> = {
        common: 'Common',
        rare: 'Rare',
        epic: 'Epic',
        legendary: 'Legendary',
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View style={[styles.header, { paddingTop: Math.max(insets.top, 0) }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <LucideChevronLeft size={28} color="#307b75" />
                    </TouchableOpacity>
                    <View style={styles.headerTitle}>
                        <LucideTrophy size={20} color="#307b75" strokeWidth={2} />
                        <Text style={styles.headerText}>Awards</Text>
                    </View>
                    <View style={styles.headerCount}>
                        <Text style={styles.headerCountText}>{earnedAwards.length}/{awards.length}</Text>
                    </View>
                </View>
            </SafeAreaView>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#307b75" />
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
                >
                    {/* Progress Banner */}
                    <View style={styles.progressBanner}>
                        <View style={styles.progressBarBg}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { width: `${(earnedAwards.length / awards.length) * 100}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {earnedAwards.length} of {awards.length} awards earned
                        </Text>
                    </View>

                    {/* Earned Section */}
                    {earnedAwards.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>✨ Earned</Text>
                            <View style={styles.grid}>
                                {earnedAwards.map(award => (
                                    <TouchableOpacity
                                        key={award.id}
                                        onPress={() => setSelectedAward(award)}
                                        style={[
                                            styles.awardCard,
                                            { backgroundColor: RARITY_BG[award.rarity] }
                                        ]}
                                        activeOpacity={0.75}
                                    >
                                        <Text style={styles.awardEmoji}>{award.emoji}</Text>
                                        <Text style={styles.awardName} numberOfLines={2}>{award.name}</Text>
                                        <View style={[styles.rarityPill, { backgroundColor: RARITY_COLORS[award.rarity] + '22' }]}>
                                            <Text style={[styles.rarityText, { color: RARITY_COLORS[award.rarity] }]}>
                                                {rarityLabel[award.rarity]}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Locked Section */}
                    {lockedAwards.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🔒 Locked</Text>
                            <View style={styles.grid}>
                                {lockedAwards.map(award => (
                                    <TouchableOpacity
                                        key={award.id}
                                        onPress={() => setSelectedAward(award)}
                                        style={styles.awardCardLocked}
                                        activeOpacity={0.75}
                                    >
                                        <View style={styles.lockedEmojiContainer}>
                                            <Text style={[styles.awardEmoji, styles.lockedEmoji]}>{award.emoji}</Text>
                                            <View style={styles.lockOverlay}>
                                                <LucideLock size={14} color="white" strokeWidth={2.5} />
                                            </View>
                                        </View>
                                        <Text style={[styles.awardName, styles.lockedText]} numberOfLines={2}>{award.name}</Text>
                                        <View style={styles.rarityPill}>
                                            <Text style={[styles.rarityText, { color: '#C0C0C0' }]}>
                                                {rarityLabel[award.rarity]}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Award Detail Modal */}
            <Modal
                visible={!!selectedAward}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedAward(null)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSelectedAward(null)}
                >
                    <View
                        style={[
                            styles.modalCard,
                            selectedAward?.earned
                                ? { borderColor: RARITY_COLORS[selectedAward?.rarity || 'common'] + '40' }
                                : styles.modalCardLocked
                        ]}
                        onStartShouldSetResponder={() => true}
                    >
                        {/* Close */}
                        <TouchableOpacity
                            onPress={() => setSelectedAward(null)}
                            style={styles.modalClose}
                        >
                            <LucideX size={18} color="#8A8A8A" />
                        </TouchableOpacity>

                        {/* Emoji */}
                        <View style={[
                            styles.modalEmojiContainer,
                            {
                                backgroundColor: selectedAward?.earned
                                    ? RARITY_BG[selectedAward?.rarity || 'common']
                                    : 'rgba(200,200,200,0.15)'
                            }
                        ]}>
                            <Text style={styles.modalEmoji}>{selectedAward?.emoji}</Text>
                            {!selectedAward?.earned && (
                                <View style={styles.modalLockOverlay}>
                                    <LucideLock size={22} color="white" strokeWidth={2.5} />
                                </View>
                            )}
                        </View>

                        {/* Rarity */}
                        <View style={[
                            styles.modalRarityPill,
                            {
                                backgroundColor: selectedAward?.earned
                                    ? RARITY_COLORS[selectedAward?.rarity || 'common'] + '22'
                                    : 'rgba(200,200,200,0.2)'
                            }
                        ]}>
                            <Text style={[
                                styles.modalRarityText,
                                { color: selectedAward?.earned ? RARITY_COLORS[selectedAward?.rarity || 'common'] : '#A0A0A0' }
                            ]}>
                                {rarityLabel[selectedAward?.rarity || 'common']}
                            </Text>
                        </View>

                        <Text style={styles.modalTitle}>{selectedAward?.name}</Text>
                        <Text style={styles.modalDescription}>{selectedAward?.description}</Text>

                        {selectedAward?.earned ? (
                            <View style={styles.modalEarnedBadge}>
                                <Text style={styles.modalEarnedText}>🎉 Earned {formatDate(selectedAward.earnedAt)}</Text>
                            </View>
                        ) : (
                            <View style={styles.modalRequirement}>
                                <Text style={styles.modalRequirementLabel}>How to unlock</Text>
                                <Text style={styles.modalRequirementText}>{selectedAward?.requirement}</Text>
                            </View>
                        )}

                        <View style={styles.modalXPRow}>
                            <Text style={styles.modalXPLabel}>Karma Reward</Text>
                            <Text style={styles.modalXPValue}>+{selectedAward?.karmaReward} Karma</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
    },
    headerSafe: {
        backgroundColor: '#f7f7f7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1A1A1A',
    },
    headerCount: {
        backgroundColor: 'rgba(48,123,117,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    headerCountText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#307b75',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    progressBanner: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#EFEFEF',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#307b75',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: '#8A8A8A',
        fontWeight: '600',
        textAlign: 'center',
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1A1A1A',
        marginBottom: 14,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    awardCard: {
        width: CARD_SIZE,
        borderRadius: 20,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    awardCardLocked: {
        width: CARD_SIZE,
        borderRadius: 20,
        padding: 12,
        alignItems: 'center',
        backgroundColor: 'rgba(200,200,200,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },
    awardEmoji: {
        fontSize: 32,
        marginBottom: 6,
    },
    lockedEmojiContainer: {
        position: 'relative',
        marginBottom: 6,
    },
    lockedEmoji: {
        opacity: 0.3,
        marginBottom: 0,
    },
    lockOverlay: {
        position: 'absolute',
        bottom: -2,
        right: -4,
        backgroundColor: '#B0B0B0',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    awardName: {
        fontSize: 11,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 6,
        lineHeight: 14,
    },
    lockedText: {
        color: '#C0C0C0',
    },
    rarityPill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    rarityText: {
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    modalCard: {
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 28,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(48,123,117,0.2)',
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 10,
    },
    modalCardLocked: {
        borderColor: 'rgba(200,200,200,0.3)',
    },
    modalClose: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 6,
    },
    modalEmojiContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        position: 'relative',
    },
    modalEmoji: {
        fontSize: 44,
    },
    modalLockOverlay: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#B0B0B0',
        borderRadius: 14,
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalRarityPill: {
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 12,
    },
    modalRarityText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalDescription: {
        fontSize: 14,
        color: '#6A6A6A',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    modalEarnedBadge: {
        backgroundColor: 'rgba(48,123,117,0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 16,
    },
    modalEarnedText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#307b75',
    },
    modalRequirement: {
        backgroundColor: 'rgba(200,200,200,0.15)',
        borderRadius: 16,
        padding: 14,
        width: '100%',
        marginBottom: 16,
    },
    modalRequirementLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#A0A0A0',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    modalRequirementText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A4A4A',
    },
    modalXPRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.06)',
    },
    modalXPLabel: {
        fontSize: 13,
        color: '#8A8A8A',
        fontWeight: '600',
    },
    modalXPValue: {
        fontSize: 15,
        fontWeight: '800',
        color: '#307b75',
    },
});
