import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput, ScrollView, Dimensions, Share, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { LucideChevronLeft, LucideCheckCircle2, LucideShare2 } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { GamificationService, AwardDefinition } from '../services/gamification';
import { detectNails, Nail, NailDetectionResult } from '../services/nailDetection';
import { SpotlightService } from '../services/spotlight';
import { NailOverlaySkia, NailOverlayRef } from '../components/NailOverlaySkia';
import { HistoryService, IntentTag } from '../services/history';
import { AuthService } from '../services/auth';
import { ProfileNudgeModal } from '../components/ProfileNudgeModal';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const INTENTS: { label: IntentTag, icon: string }[] = [
    { label: 'Everyday', icon: '☀️' },
    { label: 'Business', icon: '💼' },
    { label: 'Event', icon: '🎉' },
    { label: 'Trend', icon: '🔥' },
    { label: 'Trying New', icon: '🎨' },
];

/**
 * ResultScreen: Hero image focus with immersive UI.
 * Pure StyleSheet implementation for rock-solid stability and precise layout.
 */
function ResultScreen() {
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const [nails, setNails] = React.useState<Nail[]>([]);
    const [processedImageUri, setProcessedImageUri] = React.useState<string>('');
    const [isDetecting, setIsDetecting] = React.useState(true);
    const [selectedIntent, setSelectedIntent] = React.useState<IntentTag>('Everyday');
    const [showNudge, setShowNudge] = useState(false);
    const [isSubmittingSpotlight, setIsSubmittingSpotlight] = useState(false);
    const [hasSubmittedSpotlight, setHasSubmittedSpotlight] = useState(false);
    const [processedWidth, setProcessedWidth] = useState<number>(0);
    const [processedHeight, setProcessedHeight] = useState<number>(0);
    const [isSaving, setIsSaving] = React.useState(false);
    const [newAwards, setNewAwards] = useState<AwardDefinition[]>([]);
    const [awardModalVisible, setAwardModalVisible] = useState(false);
    const colorName = (params.colorName as string) || 'Custom Shade';

    const abortControllerRef = useRef<AbortController | null>(null);
    const overlayRef = useRef<NailOverlayRef>(null);

    useEffect(() => {
        if (params.imageUri) {
            handleDetection();
        }
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [params.imageUri]);

    const handleDetection = async () => {
        setIsDetecting(true);
        setNails([]);
        if (abortControllerRef.current) abortControllerRef.current.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        // Auto-abort after 60 seconds (server cold start handling)
        const timeoutId = setTimeout(() => {
            controller.abort("TIMEOUT");
        }, 60000);

        try {
            const result = await detectNails(params.imageUri as string, controller.signal);
            clearTimeout(timeoutId);
            setNails(result.nails);
            setProcessedImageUri(result.processedImageUri);
            setProcessedWidth(result.imageWidth);
            setProcessedHeight(result.imageHeight);

            if (result.nails.length === 0) {
                Alert.alert("No Nails Detected", "Try again with better lighting for a perfect rendering.", [{ text: "OK" }]);
            } else {
                GamificationService.updateStreak().then(({ streak, reachedMilestone }) => {
                    if (reachedMilestone) {
                        Alert.alert("🔥 Great job!", `You've painted your nails for ${streak} days in a row!`, [{ text: "Excellent!" }]);
                    }
                });
            }
        } catch (e: any) {
            clearTimeout(timeoutId);

            // Check for timeout or explicit cancellation
            const isTimeout = e === 'TIMEOUT' || (controller.signal.aborted && controller.signal.reason === 'TIMEOUT');

            if (isTimeout) {
                Alert.alert(
                    "Connection Timeout",
                    "The AI server is taking too long to wake up. Please try again in a few seconds.",
                    [{ text: "Retry", onPress: handleDetection }, { text: "Cancel", style: "cancel" }]
                );
            } else if (e.message !== 'Cancelled' && e.name !== 'AbortError') {
                Alert.alert("Detection Failed", "Please verify your connection and try again.", [{ text: "Retry", onPress: handleDetection }]);
            }
        } finally {
            if (abortControllerRef.current === controller) {
                setIsDetecting(false);
                abortControllerRef.current = null;
            }
        }
    };

    const handleCancelDetection = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsDetecting(false);
        }
    };

    const handleSubmitToSpotlight = async () => {
        setIsSubmittingSpotlight(true);
        try {
            const colorHex = (params.selectedColor as string) || '#307b75';
            const finalName = colorName;

            // Capture the masterpiece!
            const base64Image = overlayRef.current?.capture();
            const finalImageUri = base64Image ? `data:image/jpeg;base64,${base64Image}` : (processedImageUri || params.imageUri as string);

            const result = await SpotlightService.submitToSpotlight(
                params.imageUri as string,
                finalImageUri,
                colorHex,
                finalName
            );

            if (result.success) {
                await GamificationService.awardKarma(20, 'spotlight_submission');
                setHasSubmittedSpotlight(true);
                Alert.alert(
                    "✨ Submitted to Spotlight!",
                    "Your look is now live for others to vote on. You earned 20 Karma!",
                    [{ text: "Awesome!" }]
                );
            } else {
                Alert.alert("Error", result.error || "Failed to submit to spotlight");
            }
        } catch (e) {
            console.error("Spotlight submission error:", e);
            Alert.alert("Error", "Could not submit to spotlight. Please try again.");
        } finally {
            setIsSubmittingSpotlight(false);
        }
    };

    const handleDone = async () => {
        setIsSaving(true);
        try {
            const colorHex = (params.selectedColor as string) || '#307b75';
            const finalName = colorName;

            // Capture the processed image for history
            const base64Image = overlayRef.current?.capture();
            const finalImageUri = base64Image ? `data:image/jpeg;base64,${base64Image}` : (processedImageUri || params.imageUri as string);

            const earnedAwards = await HistoryService.saveTryOn({
                colorHex,
                colorName: finalName,
                intent: selectedIntent,
                nailsCount: nails.length,
                processedImageUri: finalImageUri,
            });

            await GamificationService.awardKarma(30, 'custom_color_creation');
            if (colorName !== params.colorName) {
                await GamificationService.awardKarma(10, 'color_named');
            }

            await AuthService.recordSession();

            // Show award celebration if any new awards were earned
            if (earnedAwards && earnedAwards.length > 0) {
                setNewAwards(earnedAwards);
                setAwardModalVisible(true);
                // Navigation will happen when user dismisses the modal
            } else {
                const isComplete = await AuthService.isProfileComplete();
                if (!isComplete) {
                    setShowNudge(true);
                } else {
                    router.dismissAll();
                }
            }
        } catch (e) {
            console.error("Save history error:", e);
            Alert.alert("Error", "Could not save your session. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAwardModalDismiss = async () => {
        setAwardModalVisible(false);
        const isComplete = await AuthService.isProfileComplete();
        if (!isComplete) {
            setShowNudge(true);
        } else {
            router.dismissAll();
        }
    };

    const handleShare = async () => {
        try {
            const finalColorName = colorName;

            // Capture the finished painted nails image
            const base64Image = overlayRef.current?.capture();
            const imageToShare = base64Image ? `data:image/jpeg;base64,${base64Image}` : (processedImageUri || params.imageUri as string);

            const result = await Share.share({
                message: `Check out my custom look painted by ColorFloww!\n\nhttps://colorfloww.com/app`,
                url: imageToShare,
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    return (
        <View style={styles.container}>
            {/* HERO IMAGE SECTION */}
            <View style={styles.heroSection}>
                {params.imageUri ? (
                    <View style={styles.full}>
                        <NailOverlaySkia
                            ref={overlayRef}
                            imageUri={processedImageUri || params.imageUri as string}
                            nails={nails}
                            selectedColor={(params.selectedColor as string) || '#307b75'}
                        />

                        {isDetecting && (
                            <BlurView intensity={20} style={StyleSheet.absoluteFill} className="items-center justify-center">
                                <ActivityIndicator size="large" color="#ffffff" className="mb-4" />
                                <Text className="text-white text-xl font-bold mb-6">Styling Nails...</Text>
                                <TouchableOpacity
                                    onPress={handleCancelDetection}
                                    style={styles.stopButton}
                                >
                                    <Text className="text-white font-bold">Stop</Text>
                                </TouchableOpacity>
                            </BlurView>
                        )}
                    </View>
                ) : (
                    <View style={[styles.full, styles.placeholderBg]}>
                        <Text style={styles.placeholderText}>No preview available</Text>
                    </View>
                )}

                <SafeAreaView style={styles.overlayTop} edges={['top']}>
                    <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.iconButton}
                        >
                            <LucideChevronLeft color="white" size={28} />
                        </TouchableOpacity>

                        {!isDetecting && (
                            <View style={styles.headerRight}>
                                <TouchableOpacity
                                    onPress={handleShare}
                                    style={[styles.iconButton, { marginRight: 12 }]}
                                >
                                    <LucideShare2 color="white" size={24} />
                                </TouchableOpacity>
                                <View style={styles.badge}>
                                    <LucideCheckCircle2 color="white" size={16} style={styles.badgeIcon} />
                                    <Text style={styles.badgeText}>Perfect Look</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </SafeAreaView>
            </View>

            {/* INTERACTIVE CONTROLS SECTION */}
            <View style={styles.controlsSection}>
                <ScrollView
                    style={styles.full}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.nameRow}>
                        <View style={styles.flex1}>
                            <Text style={styles.label}>Selected Color</Text>
                            <Text style={styles.nameDisplay}>{colorName}</Text>
                        </View>
                        <View
                            style={[styles.backplateCircle, { backgroundColor: (params.selectedColor as string) || '#307b75' }]}
                        />
                    </View>

                    <View style={styles.vibeHeader}>
                        <Text style={styles.label}>Set The Vibe</Text>
                        <Text style={styles.selectedVibeLabel}>{selectedIntent}</Text>
                    </View>

                    <View style={styles.vibeBar}>
                        {INTENTS.map((item) => (
                            <TouchableOpacity
                                key={item.label}
                                activeOpacity={0.7}
                                onPress={() => setSelectedIntent(item.label)}
                                style={[
                                    styles.emojiCircle,
                                    selectedIntent === item.label ? styles.emojiCircleActive : styles.emojiCircleInactive
                                ]}
                            >
                                <Text style={styles.emojiText}>{item.icon}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.buttonRow}>
                        {!hasSubmittedSpotlight && (
                            <TouchableOpacity
                                style={styles.spotlightButtonHalf}
                                onPress={handleSubmitToSpotlight}
                                disabled={isSubmittingSpotlight || isDetecting}
                            >
                                <View style={styles.buttonInner}>
                                    {isSubmittingSpotlight ? (
                                        <ActivityIndicator color="#307b75" size="small" />
                                    ) : (
                                        <Text style={styles.spotlightButtonTextSmall}>Spotlight</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={handleDone}
                            disabled={isSaving || isDetecting}
                            style={[
                                styles.doneButtonHalf,
                                (isSaving || isDetecting) && styles.saveButtonDisabled
                            ]}
                        >
                            <View style={styles.buttonInner}>
                                {isSaving ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text style={styles.doneButtonTextSmall}>Done</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.dismissAll()}
                        style={styles.backLink}
                    >
                        <Text style={styles.backLinkText}>Try Another Color</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <ProfileNudgeModal
                visible={showNudge}
                onClose={() => router.dismissAll()}
                onComplete={() => router.dismissAll()}
            />

            {/* Award Celebration Modal */}
            {newAwards.length > 0 && (
                <Modal
                    visible={awardModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={handleAwardModalDismiss}
                >
                    <View style={styles.awardOverlay}>
                        <View style={styles.awardCard}>
                            {/* Confetti header */}
                            <View style={styles.confettiRow}>
                                {['🎉', '✨', '🎊', '💫', '🌟', '🎈', '✨', '🎉'].map((e, i) => (
                                    <Text key={i} style={styles.confettiEmoji}>{e}</Text>
                                ))}
                            </View>

                            <Text style={styles.awardCelebTitle}>
                                {newAwards.length === 1 ? 'Award Unlocked! 🏆' : `${newAwards.length} Awards Unlocked! 🏆`}
                            </Text>

                            {/* All awards in one view */}
                            {newAwards.map((award, i) => (
                                <View key={award.id} style={styles.awardRow}>
                                    <View style={styles.awardRowEmoji}>
                                        <Text style={styles.awardRowEmojiText}>{award.emoji}</Text>
                                    </View>
                                    <View style={styles.awardRowInfo}>
                                        <Text style={styles.awardRowName}>{award.name}</Text>
                                        <Text style={styles.awardRowDesc} numberOfLines={2}>{award.description}</Text>
                                    </View>
                                    <View style={styles.awardRowXP}>
                                        <Text style={styles.awardRowXPText}>+{award.karmaReward}</Text>
                                        <Text style={styles.awardRowXPLabel}>Karma</Text>
                                    </View>
                                </View>
                            ))}

                            <TouchableOpacity
                                style={styles.awardDismissBtn}
                                onPress={handleAwardModalDismiss}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.awardDismissBtnText}>Done 🎉</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    full: {
        flex: 1,
    },
    heroSection: {
        height: SCREEN_HEIGHT * 0.65,
        width: '100%',
        position: 'relative',
    },
    placeholderBg: {
        backgroundColor: '#1A1A1A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 18,
    },
    overlayTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 8,
    },
    stopButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto',
    },
    badge: {
        backgroundColor: 'rgba(48, 123, 117, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 99,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    badgeIcon: {
        marginRight: 8,
    },
    badgeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    controlsSection: {
        flex: 1,
        marginTop: -30,
        backgroundColor: '#f2f2f2',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingTop: 8,
    },
    scrollContent: {
        padding: 24,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    flex1: {
        flex: 1,
        marginRight: 16,
    },
    label: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#307b75',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 4,
    },
    nameDisplay: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A1A1A',
        padding: 0,
    },
    backplateCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 3,
        borderColor: 'white',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    vibeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    selectedVibeLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    vibeBar: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 40,
        justifyContent: 'space-between',
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    emojiCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emojiCircleActive: {
        backgroundColor: '#f2f2f2',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    emojiCircleInactive: {
        backgroundColor: 'transparent',
    },
    emojiText: {
        fontSize: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 12,
    },
    spotlightButtonHalf: {
        flex: 1,
        height: 56,
        backgroundColor: 'white',
        borderRadius: 28,
        borderWidth: 2,
        borderColor: '#307b75',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    spotlightButtonTextSmall: {
        color: '#307b75',
        fontSize: 16,
        fontWeight: '700',
    },
    doneButtonHalf: {
        flex: 1,
        height: 56,
        backgroundColor: '#307b75',
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#307b75",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    doneButtonTextSmall: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    backLink: {
        marginTop: 12,
        alignItems: 'center',
    },
    backLinkText: {
        color: 'rgba(26,26,26,0.4)',
        fontWeight: '600',
        fontSize: 14,
    },
    // Award Celebration Modal
    awardOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 28,
    },
    awardCard: {
        backgroundColor: 'white',
        borderRadius: 36,
        padding: 28,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 12,
    },
    confettiRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 12,
    },
    confettiEmoji: {
        fontSize: 18,
    },
    awardCelebTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#307b75',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 16,
    },
    awardEmojiContainer: {
        width: 100,
        height: 100,
        borderRadius: 30,
        backgroundColor: 'rgba(48,123,117,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    awardBigEmoji: {
        fontSize: 56,
    },
    awardName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 8,
    },
    awardDesc: {
        fontSize: 14,
        color: '#6A6A6A',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    awardXPBadge: {
        backgroundColor: 'rgba(48,123,117,0.1)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 8,
    },
    awardXPText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#307b75',
    },
    awardCounter: {
        fontSize: 12,
        color: '#A0A0A0',
        fontWeight: '600',
        marginBottom: 16,
        marginTop: 4,
    },
    awardDismissBtn: {
        backgroundColor: '#307b75',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 28,
        marginTop: 8,
        width: '100%',
        alignItems: 'center',
    },
    awardDismissBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800',
    },
    // Award row styles (for multi-award display)
    awardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        gap: 12,
    },
    awardRowEmoji: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(48,123,117,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    awardRowEmojiText: {
        fontSize: 24,
    },
    awardRowInfo: {
        flex: 1,
    },
    awardRowName: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    awardRowDesc: {
        fontSize: 11,
        color: '#8A8A8A',
        lineHeight: 15,
    },
    awardRowXP: {
        alignItems: 'center',
    },
    awardRowXPText: {
        fontSize: 15,
        fontWeight: '900',
        color: '#307b75',
    },
    awardRowXPLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: '#307b75',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});

export default ResultScreen;
