import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated, PanResponder } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LucideHeart, LucideX, LucideStar, LucideSparkles } from 'lucide-react-native';
import { GamificationService } from '../../services/gamification';

const { width, height } = Dimensions.get('window');

/**
 * SpotlightScreen: Tinder-style voting for user looks.
 * Collects preference data and awards XP.
 */
export default function SpotlightScreen() {
    const insets = useSafeAreaInsets();
    const [looks, setLooks] = useState([
        { id: '1', name: 'Midnight Velvet', creator: 'Alice', image: 'https://images.unsplash.com/photo-1604654894611-6973b376cbde?q=80&w=600' },
        { id: '2', name: 'Sunset Glow', creator: 'Bob', image: 'https://images.unsplash.com/photo-1632345031435-0727463135b8?q=80&w=600' },
        { id: '3', name: 'Cyber Neon', creator: 'Charlie', image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=600' },
    ]);

    const position = new Animated.ValueXY();
    const rotate = position.x.interpolate({
        inputRange: [-width / 2, 0, width / 2],
        outputRange: ['-10deg', '0deg', '10deg'],
        extrapolate: 'clamp',
    });

    const rotateAndTranslate = {
        transform: [
            { rotate: rotate },
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
        outputRange: [1, 0.8, 1],
        extrapolate: 'clamp',
    });

    const nextCardScale = position.x.interpolate({
        inputRange: [-width / 2, 0, width / 2],
        outputRange: [1, 0.9, 1],
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
                    useNativeDriver: true,
                }).start(() => {
                    handleVote('like');
                });
            } else if (gestureState.dx < -120) {
                Animated.spring(position, {
                    toValue: { x: -width - 100, y: gestureState.dy },
                    useNativeDriver: true,
                }).start(() => {
                    handleVote('dislike');
                });
            } else {
                Animated.spring(position, {
                    toValue: { x: 0, y: 0 },
                    friction: 4,
                    useNativeDriver: true,
                }).start();
            }
        },
    });

    const handleVote = async (type: 'like' | 'dislike') => {
        console.log(`[Spotlight] Voted ${type} on card`);
        await GamificationService.awardXP(5, 'spotlight_vote');
        setLooks((prev) => prev.slice(1));
        position.setValue({ x: 0, y: 0 });
    };

    const renderCards = () => {
        return looks.map((item, i) => {
            if (i === 0) {
                return (
                    <Animated.View
                        key={item.id}
                        {...panResponder.panHandlers}
                        style={[rotateAndTranslate, styles.card]}
                    >
                        <Animated.View style={[styles.stampContainer, { opacity: likeOpacity, left: 40 }]}>
                            <Text style={[styles.stampText, { color: '#4ADE80', borderColor: '#4ADE80' }]}>HOT</Text>
                        </Animated.View>

                        <Animated.View style={[styles.stampContainer, { opacity: dislikeOpacity, right: 40 }]}>
                            <Text style={[styles.stampText, { color: '#F87171', borderColor: '#F87171' }]}>NOT</Text>
                        </Animated.View>

                        <Image source={{ uri: item.image }} style={styles.image} />

                        <View style={styles.cardInfo}>
                            <View>
                                <Text style={styles.cardName}>{item.name}</Text>
                                <Text style={styles.cardCreator}>by {item.creator}</Text>
                            </View>
                            <View style={styles.xpBadge}>
                                <LucideSparkles size={16} color="#FFE66D" />
                                <Text style={styles.xpText}>+5 XP</Text>
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
                        <Image source={{ uri: item.image }} style={styles.image} />
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardName}>{item.name}</Text>
                        </View>
                    </Animated.View>
                );
            }
            return null;
        }).reverse();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Spotlight</Text>
                <Text style={styles.headerSubtitle}>Swipe to rate the latest trends</Text>
            </View>

            <View style={styles.cardsContainer}>
                {looks.length > 0 ? (
                    renderCards()
                ) : (
                    <View style={styles.emptyState}>
                        <LucideStar size={64} color="#697D59" />
                        <Text style={styles.emptyText}>You've seen all the looks!</Text>
                        <TouchableOpacity
                            onPress={() => setLooks([
                                { id: '4', name: 'Pearl Mist', creator: 'Eve', image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=600' },
                                { id: '5', name: 'Ruby Wine', creator: 'Frank', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600' },
                            ])}
                            style={styles.refreshButton}
                        >
                            <Text style={styles.refreshText}>Refresh Gallery</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 40) }]}>
                <TouchableOpacity style={[styles.button, styles.dislikeButton]} onPress={() => handleVote('dislike')}>
                    <LucideX size={32} color="#F87171" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.likeButton]} onPress={() => handleVote('like')}>
                    <LucideHeart size={32} color="#4ADE80" fill="#4ADE80" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF9F6',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#000000',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666666',
        fontWeight: '600',
    },
    cardsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        height: height * 0.6,
        width: width - 40,
        padding: 10,
        position: 'absolute',
        backgroundColor: 'white',
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    image: {
        flex: 1,
        width: null,
        height: null,
        resizeMode: 'cover',
        borderRadius: 24,
    },
    cardInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    cardName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#000000',
    },
    cardCreator: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
    xpBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000000',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    xpText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '900',
        marginLeft: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingBottom: 40,
    },
    button: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    likeButton: {
        borderColor: '#4ADE80',
        borderWidth: 1.5,
    },
    dislikeButton: {
        borderColor: '#F87171',
        borderWidth: 1.5,
    },
    stampContainer: {
        position: 'absolute',
        top: 50,
        zIndex: 10,
        transform: [{ rotate: '-15deg' }],
    },
    stampText: {
        borderWidth: 4,
        fontSize: 32,
        fontWeight: '900',
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#666666',
        marginTop: 20,
        textAlign: 'center',
    },
    refreshButton: {
        marginTop: 30,
        backgroundColor: '#697D59',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    refreshText: {
        color: 'white',
        fontWeight: '800',
    },
});
