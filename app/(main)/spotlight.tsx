import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated, PanResponder, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideHeart, LucideX, LucideStar, LucideSparkles, LucideRefreshCw, LucidePaintbrush } from 'lucide-react-native';
import { GamificationService } from '../../services/gamification';
import { SpotlightService, SpotlightSubmission } from '../../services/spotlight';

const { width, height } = Dimensions.get('window');

/**
 * SpotlightScreen: Tinder-style voting for user nail looks.
 * Fetches real submissions from Supabase and tracks votes.
 */
export default function SpotlightScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<SpotlightSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const position = new Animated.ValueXY();
    const rotate = position.x.interpolate({
        inputRange: [-width / 2, 0, width / 2],
        outputRange: ['-10deg', '0deg', '10deg'],
        extrapolate: 'clamp',
    });

    const rotateAndTranslate = {
        transform: [
            { rotate },
            ...position.getTranslateTransform(),
        ],
    };

    const likeOpacity = position.x.interpolate({
        inputRange: [-width / 2, 0, width / 2],
        outputRange: [0, 0, 1],
        extrapolate: 'clamp',
    });

    const dislikeOpacity = position.x.interpolate({
        inputRange: [-width / 2, 0, width / 2],
        outputRange: [1, 0, 0],
        extrapolate: 'clamp',
    });

    const nextCardOpacity = position.x.interpolate({
        inputRange: [-width / 2, 0, width / 2],
        outputRange: [1, 0, 1],
        extrapolate: 'clamp',
    });

    const nextCardScale = position.x.interpolate({
        inputRange: [-width / 2, 0, width / 2],
        outputRange: [1, 0.8, 1],
        extrapolate: 'clamp',
    });

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
            position.setValue({ x: gestureState.dx, y: gestureState.dy });
        },
        onPanResponderRelease: (evt, gestureState) => {
            if (gestureState.dx > 120) {
                Animated.spring(position, {
                    toValue: { x: width + 100, y: gestureState.dy },
                    useNativeDriver: false,
                }).start(() => handleVote('yes'));
            } else if (gestureState.dx < -120) {
                Animated.spring(position, {
                    toValue: { x: -width - 100, y: gestureState.dy },
                    useNativeDriver: false,
                }).start(() => handleVote('no'));
            } else {
                Animated.spring(position, {
                    toValue: { x: 0, y: 0 },
                    friction: 4,
                    useNativeDriver: false,
                }).start();
            }
        },
    });

    useEffect(() => {
        loadSubmissions();
    }, []);

    const loadSubmissions = async () => {
        setIsLoading(true);
        try {
            const data = await SpotlightService.getSpotlightSubmissions(20, false);
            setSubmissions(data);
        } catch (error) {
            console.error('[Spotlight] Error loading submissions:', error);
            Alert.alert('Error', 'Failed to load submissions. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadSubmissions();
        setIsRefreshing(false);
    };

    const handleVote = async (type: 'yes' | 'no') => {
        if (submissions.length === 0) return;

        const currentSubmission = submissions[0];
        console.log(`[Spotlight] Voted ${type} on submission: ${currentSubmission.id}`);

        // Record vote in database
        const result = await SpotlightService.voteOnSubmission(currentSubmission.id, type);

        if (result.success) {
            // Award XP for voting
            await GamificationService.awardXP(5, 'spotlight_vote');

            // Remove card from stack
            setSubmissions((prev) => prev.slice(1));
            position.setValue({ x: 0, y: 0 });
        } else {
            console.warn('[Spotlight] Vote failed:', result.error);
            // Still remove card even if vote fails (might be duplicate)
            setSubmissions((prev) => prev.slice(1));
            position.setValue({ x: 0, y: 0 });
        }
    };

    const renderSubmissions = () => {
        if (submissions.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <LucideStar size={64} color="#307b75" style={{ opacity: 0.3, marginBottom: 20 }} />
                    <Text style={styles.emptyTitle}>No more looks to vote on!</Text>
                    <Text style={styles.emptySubtitle}>Check back later for new styles from the community.</Text>
                    <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                        <LucideRefreshCw size={20} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.refreshButtonText}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return submissions.map((item, i) => {
            if (i === 0) {
                return (
                    <Animated.View
                        key={item.id}
                        {...panResponder.panHandlers}
                        style={[rotateAndTranslate, styles.card, { zIndex: 10 }]}
                    >
                        <Animated.View style={[styles.stampContainer, { opacity: likeOpacity, left: 40 }]}>
                            <Text style={[styles.stampText, { color: '#4ADE80', borderColor: '#4ADE80' }]}>YES</Text>
                        </Animated.View>

                        <Animated.View style={[styles.stampContainer, { opacity: dislikeOpacity, right: 40 }]}>
                            <Text style={[styles.stampText, { color: '#F87171', borderColor: '#F87171' }]}>NO</Text>
                        </Animated.View>

                        <Image
                            source={{ uri: item.processed_image_uri }}
                            style={styles.image}
                            resizeMode="cover"
                        />

                        <View style={styles.imageGradient} />

                        <View style={styles.cardInfo}>
                            <View style={styles.cardTextContainer}>
                                <Text style={styles.cardName}>{item.color_name}</Text>
                                <Text style={styles.cardCreator}>by @{item.username}</Text>
                                <TouchableOpacity
                                    style={styles.tryButton}
                                    onPress={() => router.push({
                                        pathname: "/photo-instruction",
                                        params: { color: item.color_hex, colorName: item.color_name }
                                    })}
                                    activeOpacity={0.7}
                                >
                                    <LucidePaintbrush size={14} color="#307b75" style={{ marginRight: 6 }} />
                                    <Text style={styles.tryButtonText}>Try This Shade</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.badgeContainer}>
                                <View style={[styles.colorBadge, { backgroundColor: item.color_hex }]} />
                                <View style={styles.xpBadge}>
                                    <LucideSparkles size={14} color="#FFE66D" />
                                    <Text style={styles.xpText}>+5 XP</Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                );
            } else if (i === 1) {
                return (
                    <Animated.View
                        key={item.id}
                        style={[
                            styles.card,
                            { opacity: nextCardOpacity, transform: [{ scale: nextCardScale }], zIndex: -1 },
                        ]}
                    >
                        <Image
                            source={{ uri: item.processed_image_uri }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardName}>{item.color_name}</Text>
                        </View>
                    </Animated.View>
                );
            }
            return null;
        }).reverse();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Spotlight</Text>
                <Text style={styles.subtitle}>Vote on the community's best looks</Text>
            </View>

            <View style={styles.content}>
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#307b75" />
                        <Text style={styles.loadingText}>Fetching style inspiration...</Text>
                    </View>
                )}
                {!isLoading && renderSubmissions()}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.footerButton, styles.buttonNo]}
                    onPress={() => {
                        Animated.spring(position, {
                            toValue: { x: -width - 100, y: 0 },
                            useNativeDriver: false,
                        }).start(() => handleVote('no'));
                    }}
                >
                    <LucideX size={30} color="#F87171" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.footerButton, styles.buttonYes]}
                    onPress={() => {
                        Animated.spring(position, {
                            toValue: { x: width + 100, y: 0 },
                            useNativeDriver: false,
                        }).start(() => handleVote('yes'));
                    }}
                >
                    <LucideHeart size={30} color="#4ADE80" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1A1A1A',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(26,26,26,0.5)',
        fontWeight: '500',
        marginTop: 4,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        height: height * 0.62,
        width: width - 32,
        backgroundColor: 'white',
        borderRadius: 32,
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
    },
    image: {
        flex: 1,
        width: '100%',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
        backgroundColor: 'transparent',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    cardInfo: {
        padding: 24,
        paddingTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.98)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    cardTextContainer: {
        flex: 1,
    },
    cardName: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1A1A1A',
        letterSpacing: -0.5,
    },
    cardCreator: {
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '600',
        marginTop: 1,
    },
    tryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(105, 125, 89, 0.08)',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 12,
        marginTop: 10,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(105, 125, 89, 0.15)',
    },
    tryButtonText: {
        fontSize: 12,
        color: '#307b75',
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    colorBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 3,
        borderColor: 'white',
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
    },
    xpBadge: {
        backgroundColor: '#1A1A1A',
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    xpText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '900',
        marginLeft: 6,
        letterSpacing: 0.5,
    },
    stampContainer: {
        position: 'absolute',
        top: 60,
        zIndex: 20,
        transform: [{ rotate: '-12deg' }],
    },
    stampText: {
        borderWidth: 7,
        fontSize: 52,
        fontWeight: '900',
        paddingHorizontal: 18,
        paddingVertical: 4,
        borderRadius: 16,
        letterSpacing: 3,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
        paddingTop: 16,
        gap: 50,
        backgroundColor: '#f2f2f2',
    },
    footerButton: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 2,
    },
    buttonNo: {
        borderColor: '#F87171',
    },
    buttonYes: {
        borderColor: '#4ADE80',
    },
    loadingContainer: {
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: 'rgba(26,26,26,0.5)',
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: 'rgba(26,26,26,0.5)',
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#307b75',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 20,
        shadowColor: '#307b75',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    refreshButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '900',
    }
});
