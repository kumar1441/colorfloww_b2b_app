import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput, ScrollView, Dimensions, Share } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { LucideChevronLeft, LucideCheckCircle2, LucideShare2 } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { GamificationService } from '../services/gamification';
import { detectNails, Nail, NailDetectionResult } from '../services/nailDetection';
import { NailOverlaySkia } from '../components/NailOverlaySkia';
import { HistoryService, IntentTag } from '../services/history';
import { AuthService } from '../services/auth';
import { ProfileNudgeModal } from '../components/ProfileNudgeModal';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const INTENTS: { label: IntentTag, icon: string }[] = [
    { label: 'Everyday', icon: '☀️' },
    { label: 'Work', icon: '💼' },
    { label: 'Experiment', icon: '🎨' },
    { label: 'Event', icon: '🎉' },
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
    const [isSaving, setIsSaving] = React.useState(false);
    const [customName, setCustomName] = React.useState((params.colorName as string) || '');

    const abortControllerRef = useRef<AbortController | null>(null);

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
            console.log("[ResultScreen] Detection timed out");
            controller.abort("TIMEOUT");
        }, 60000);

        try {
            const result = await detectNails(params.imageUri as string, controller.signal);
            clearTimeout(timeoutId);
            setNails(result.nails);
            setProcessedImageUri(result.processedImageUri);

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
            console.log("[ResultScreen] Detection Error:", e);

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

    const handleDone = async () => {
        setIsSaving(true);
        try {
            const colorHex = (params.selectedColor as string) || '#697D59';
            const finalName = customName.trim() || 'Custom Shade';

            await HistoryService.saveTryOn({
                colorHex,
                colorName: finalName,
                intent: selectedIntent,
                nailsCount: nails.length,
            });

            await GamificationService.awardXP(30, 'custom_color_creation');
            if (finalName !== params.colorName) {
                await GamificationService.awardKarma(10, 'Universal', 'color_named');
            }

            await AuthService.recordSession();
            const isComplete = await AuthService.isProfileComplete();
            if (!isComplete) {
                setShowNudge(true);
            } else {
                router.dismissAll();
            }
        } catch (e) {
            console.error("Save history error:", e);
            Alert.alert("Error", "Could not save your session. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleShare = async () => {
        try {
            const colorName = customName || params.colorName || 'Custom Shade';
            const result = await Share.share({
                message: `Check out my new nail look with ${colorName}! Painted virtually using ColorFloww.`,
                url: params.imageUri as string, // Note: Sharing local file URIs might not work on all platforms without base64 or sharing-plugins
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
                            imageUri={processedImageUri || params.imageUri as string}
                            nails={nails}
                            selectedColor={(params.selectedColor as string) || '#697D59'}
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
                            <Text style={styles.label}>Color Name</Text>
                            <TextInput
                                style={styles.nameInput}
                                placeholder="Name this shade..."
                                placeholderTextColor="#A1A1A1"
                                value={customName}
                                onChangeText={setCustomName}
                            />
                        </View>
                        <View
                            style={[styles.colorIndicator, { backgroundColor: (params.selectedColor as string) || '#697D59' }]}
                        />
                    </View>

                    <Text style={styles.label}>Set The Vibe</Text>
                    <View style={styles.vibeContainer}>
                        {INTENTS.map((item) => (
                            <TouchableOpacity
                                key={item.label}
                                activeOpacity={0.7}
                                onPress={() => setSelectedIntent(item.label)}
                                style={[
                                    styles.vibeTag,
                                    selectedIntent === item.label ? styles.vibeTagActive : styles.vibeTagInactive
                                ]}
                            >
                                <Text style={styles.vibeIcon}>{item.icon}</Text>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.vibeText, selectedIntent === item.label ? styles.vibeTextActive : styles.vibeTextInactive]}
                                >
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={handleDone}
                        disabled={isSaving || isDetecting}
                        style={[
                            styles.saveButton,
                            (isSaving || isDetecting) && styles.saveButtonDisabled
                        ]}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save & Finish</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.back()}
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
        height: SCREEN_HEIGHT * 0.7,
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
        backgroundColor: 'rgba(105, 125, 89, 0.9)',
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
        marginTop: -40,
        backgroundColor: '#FBFBF9', // brand-cream
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden',
        borderTopWidth: 1,
        borderTopColor: 'rgba(105, 125, 89, 0.1)',
    },
    scrollContent: {
        padding: 24,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
        opacity: 0.9,
    },
    flex1: {
        flex: 1,
        marginRight: 16,
    },
    label: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#697D59',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8,
        opacity: 0.9,
    },
    nameInput: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        padding: 0,
    },
    colorIndicator: {
        width: 56,
        height: 56,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    vibeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    vibeTag: {
        width: (SCREEN_WIDTH - 48 - 24) / 4, // screen width - horizontal padding - gap
        aspectRatio: 1,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    vibeTagActive: {
        backgroundColor: '#697D59',
        borderColor: '#697D59',
        shadowColor: "#697D59",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    vibeTagInactive: {
        backgroundColor: 'white',
        borderColor: 'rgba(0,0,0,0.05)',
    },
    vibeIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    vibeText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: -0.5,
    },
    vibeTextActive: {
        color: 'white',
    },
    vibeTextInactive: {
        color: 'rgba(26,26,26,0.3)',
    },
    saveButton: {
        width: '100%',
        backgroundColor: '#697D59',
        paddingVertical: 20,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: "#697D59",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    saveButtonDisabled: {
        backgroundColor: 'rgba(105, 125, 89, 0.4)',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    backLink: {
        marginTop: 24,
        paddingVertical: 8,
        alignItems: 'center',
    },
    backLinkText: {
        color: 'rgba(26,26,26,0.4)',
        fontWeight: '600',
        fontSize: 16,
    }
});

export default ResultScreen;
