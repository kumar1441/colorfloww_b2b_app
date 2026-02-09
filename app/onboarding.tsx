import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { LucideChevronRight, LucideCamera, LucidePalette, LucideUsers, LucideSparkles } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const ONBOARDING_DATA = [
    {
        id: '1',
        title: 'See colors on your hands',
        description: '', // Removing description as per 3-5 words rule
        image: require('../assets/onboarding-try-on.png'),
        tag: 'TRY-ON',
        icon: <LucideCamera size={24} color="#000000" />,
        accent: '#E9EDC9' // Softer accent for background shape
    },
    {
        id: '2',
        title: 'Create any color you imagine',
        description: '',
        image: require('../assets/onboarding-customize.png'),
        tag: 'CUSTOMIZE',
        icon: <LucidePalette size={24} color="#000000" />,
        accent: '#FEFAE0'
    },
    {
        id: '3',
        title: 'Share looks and get inspired',
        description: '',
        image: require('../assets/onboarding-community.png'),
        tag: 'COMMUNITY',
        icon: <LucideUsers size={24} color="#000000" />,
        accent: '#FAEDCD'
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef<FlatList>(null);

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const scrollToNext = () => {
        if (currentIndex < ONBOARDING_DATA.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            completeOnboarding();
        }
    };

    const completeOnboarding = async () => {
        try {
            await SecureStore.setItemAsync('has_seen_onboarding', 'true');
            router.replace('/(main)/community');
        } catch (error) {
            console.error('Error saving onboarding state:', error);
            router.replace('/(main)/community');
        }
    };

    const renderItem = ({ item }: { item: typeof ONBOARDING_DATA[0] }) => {
        return (
            <View style={styles.slide}>
                {/* Image Container with Organic Background */}
                <View style={styles.imageWrapper}>
                    <View style={[styles.organicShape, { backgroundColor: item.accent }]} />
                    <Image source={item.image} style={styles.image} resizeMode="contain" />
                </View>

                {/* Content */}
                <View style={styles.contentContainer}>
                    <View style={styles.tagContainer}>
                        <Text style={styles.tagText}>{item.tag}</Text>
                    </View>

                    <Text style={styles.title}>{item.title}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <TouchableOpacity
                style={[styles.skipButton, { top: Math.max(insets.top, 20) }]}
                onPress={completeOnboarding}
            >
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <FlatList
                data={ONBOARDING_DATA}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                    useNativeDriver: false,
                })}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                scrollEventThrottle={32}
                ref={slidesRef}
                style={{ marginTop: insets.top }}
            />

            {/* Bottom Section */}
            <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 40) }]}>
                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {ONBOARDING_DATA.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [8, 24, 8],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });
                        const backgroundColor = scrollX.interpolate({
                            inputRange,
                            outputRange: ['#CCCCCC', '#697D59', '#CCCCCC'],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                style={[styles.dot, { width: dotWidth, opacity, backgroundColor }]}
                                key={i.toString()}
                            />
                        );
                    })}
                </View>

                {/* Action Button */}
                <TouchableOpacity
                    style={[styles.button, currentIndex === ONBOARDING_DATA.length - 1 && styles.getStartedButton]}
                    onPress={scrollToNext}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>
                        {currentIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                    <LucideChevronRight size={22} color="#FFFFFF" strokeWidth={3} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Clean white background
    },
    skipButton: {
        position: 'absolute',
        top: 60,
        right: 24,
        zIndex: 10,
        padding: 8,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#999999',
    },
    slide: {
        width,
        alignItems: 'center',
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    imageWrapper: {
        width: width * 0.9,
        height: height * 0.5,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    organicShape: {
        position: 'absolute',
        width: width * 0.75,
        height: width * 0.75,
        borderRadius: width * 0.4,
        opacity: 0.6,
        transform: [{ scaleX: 1.2 }, { rotate: '15deg' }],
    },
    image: {
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        alignItems: 'center',
        marginTop: 40,
        width: '100%',
    },
    tagContainer: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 16,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#666666',
        letterSpacing: 1.2,
    },
    title: {
        fontSize: 42,
        fontWeight: '900',
        color: '#000000',
        textAlign: 'center',
        lineHeight: 48,
        letterSpacing: -1,
    },
    bottomContainer: {
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    pagination: {
        flexDirection: 'row',
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    button: {
        backgroundColor: '#000000', // Modern black button
        width: '100%',
        height: 64,
        borderRadius: 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    getStartedButton: {
        backgroundColor: '#697D59', // Brand green for final CTA
        shadowColor: '#697D59',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        marginRight: 8,
    },
});
