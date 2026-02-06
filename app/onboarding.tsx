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
        title: 'Virtual Try-On',
        description: 'Snap a photo of your hands and see how any nail color looks on you in real-time with AI-powered nail detection.',
        image: require('../assets/onboarding-try-on.png'),
        tag: 'See colors on your hands instantly',
        icon: <LucideCamera size={24} color="#000000" />,
        accent: '#697D59'
    },
    {
        id: '2',
        title: 'Create & Customize',
        description: 'Mix custom colors with RGB sliders, browse trending shades, and save your favorites. Name your creations and build your personal collection.',
        image: require('../assets/onboarding-customize.png'),
        tag: 'Your perfect shade awaits',
        icon: <LucidePalette size={24} color="#000000" />,
        accent: '#A3B18A'
    },
    {
        id: '3',
        title: 'Share & Discover',
        description: 'Share your looks on social media, discover colors from top creators, earn achievements, and inspire others with your style.',
        image: require('../assets/onboarding-community.png'),
        tag: 'Join the community',
        icon: <LucideUsers size={24} color="#000000" />,
        accent: '#333333'
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
                {/* Image Container */}
                <View style={styles.imageWrapper}>
                    <Image source={item.image} style={styles.image} resizeMode="cover" />
                    <View style={styles.floatingIcon}>
                        {item.icon}
                    </View>
                </View>

                {/* Content */}
                <View style={styles.contentContainer}>
                    <View style={styles.tagContainer}>
                        <LucideSparkles size={14} color="#697D59" style={{ marginRight: 6 }} />
                        <Text style={styles.tagText}>{item.tag}</Text>
                    </View>

                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
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
            <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {ONBOARDING_DATA.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [10, 20, 10],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                style={[styles.dot, { width: dotWidth, opacity }]}
                                key={i.toString()}
                            />
                        );
                    })}
                </View>

                {/* Action Button */}
                <TouchableOpacity style={styles.button} onPress={scrollToNext}>
                    <Text style={styles.buttonText}>
                        {currentIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                    <LucideChevronRight size={20} color="#FFFFFF" strokeWidth={3} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF9F6', // brand-cream
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
        fontWeight: '700',
        color: '#666666',
    },
    slide: {
        width,
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    imageWrapper: {
        width: width * 0.85,
        height: height * 0.45,
        borderRadius: 40,
        overflow: 'hidden',
        marginTop: 100,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 2,
        borderColor: '#000000',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    floatingIcon: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        width: 56,
        height: 56,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2.5,
        borderColor: '#000000',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    contentContainer: {
        alignItems: 'center',
        marginTop: 40,
        paddingHorizontal: 10,
    },
    tagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(105, 125, 89, 0.08)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 99,
        marginBottom: 20,
    },
    tagText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#697D59',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 36,
        fontWeight: '900',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -1,
    },
    description: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4A4A4A',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    bottomContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        alignItems: 'center',
    },
    pagination: {
        flexDirection: 'row',
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: '#697D59',
        marginHorizontal: 4,
    },
    button: {
        backgroundColor: '#697D59',
        width: '100%',
        height: 72,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#697D59',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '900',
        marginRight: 8,
        letterSpacing: 0.5,
    },
});
