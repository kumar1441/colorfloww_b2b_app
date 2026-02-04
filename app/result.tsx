import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GamificationService } from '../services/gamification';
import { detectNails, Nail } from '../services/nailDetection';
import { NailOverlaySkia } from '../components/NailOverlaySkia';
import { HistoryService, IntentTag } from '../services/history';

/**
 * ResultScreen: Logic for updating streaks and displaying try-on results.
 */
function ResultScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();

    const [nails, setNails] = React.useState<Nail[]>([]);
    const [isDetecting, setIsDetecting] = React.useState(true);
    const [selectedIntent, setSelectedIntent] = React.useState<IntentTag>('Everyday');

    // Store abort controller to cancel requests if user leaves or cancels manually
    const abortControllerRef = useRef<AbortController | null>(null);

    const intents: { label: IntentTag, icon: string }[] = [
        { label: 'Everyday', icon: '☀️' },
        { label: 'Work', icon: '💼' },
        { label: 'Experiment', icon: '🎨' },
        { label: 'Trend', icon: '✨' },
        { label: 'Event', icon: '🎉' },
    ];

    useEffect(() => {
        if (params.imageUri) {
            handleDetection();
        }

        return () => {
            // Cleanup: Cancel any pending detection if unmounting
            if (abortControllerRef.current) {
                console.log("[ResultScreen] Unmounting, aborting detection...");
                abortControllerRef.current.abort();
            }
        };
    }, [params.imageUri]);

    const handleDetection = async () => {
        setIsDetecting(true);
        setNails([]); // safe reset

        // Create new controller for this request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        console.log(`[ResultScreen] Starting detection for Uri: ${params.imageUri?.toString().substring(0, 20)}...`);

        try {
            const detectedNails = await detectNails(params.imageUri as string, controller.signal);
            console.log(`[ResultScreen] Detection finished. Found ${detectedNails.length} nails.`);

            setNails(detectedNails);

            if (detectedNails.length === 0) {
                // Feedback for empty state
                Alert.alert(
                    "No Nails Detected",
                    "We couldn't see any nails in this photo. Please ensure your hand is visible and lighting is good.",
                    [{ text: "OK" }]
                );
            } else {
                // Happy path: Update streak only if we actually found nails and did a try-on
                GamificationService.updateStreak().then(({ streak, reachedMilestone }) => {
                    if (reachedMilestone) {
                        Alert.alert(
                            "🔥 Great job!",
                            `You've painted your nails for ${streak} days in a row! You're on fire!`,
                            [{ text: "Excellent!" }]
                        );
                    }
                });
            }

        } catch (e: any) {
            if (e.message === 'Cancelled') {
                console.log("[ResultScreen] Detection cancelled by user.");
            } else {
                console.error("[ResultScreen] Detection Error:", e);
                Alert.alert(
                    "Detection Failed",
                    "Could not scan nails. Please verify your internet connection and try again.\n\nError: " + (e.message || "Unknown"),
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Retry", onPress: handleDetection }
                    ]
                );
            }
        } finally {
            setIsDetecting(false);
            abortControllerRef.current = null;
        }
    };

    const handleCancelDetection = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsDetecting(false);
        }
    };

    const [isSaving, setIsSaving] = React.useState(false);
    const [customName, setCustomName] = React.useState((params.colorName as string) || '');

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

            // Gamification: Award XP for creating/saving
            await GamificationService.awardXP(30, 'custom_color_creation');

            // If the user changed the name, they "claim" it
            if (finalName !== params.colorName) {
                await GamificationService.awardKarma(10, 'Universal', 'color_named');
            }

            router.dismissAll();
        } catch (e) {
            console.error("Save history error:", e);
            Alert.alert("Error", "Could not save your session to the cloud. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const insets = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-brand-cream dark:bg-brand-cream-dark">
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                <ScrollView contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}>
                    <View className="flex-1 justify-center items-center p-6">
                        <View className="w-full bg-white dark:bg-brand-charcoal rounded-[32px] p-8 shadow-xl items-center border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5">
                            <Text className="text-3xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark mb-4">You look gorgeous!</Text>

                            <View
                                className="w-full h-80 rounded-2xl mb-6 shadow-lg overflow-hidden border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5 bg-black"
                            >
                                {params.imageUri ? (
                                    <View className="flex-1">
                                        <NailOverlaySkia
                                            imageUri={params.imageUri as string}
                                            nails={nails}
                                            selectedColor={(params.selectedColor as string) || '#697D59'}
                                        />
                                        {isDetecting && (
                                            <View className="absolute inset-0 bg-black/60 items-center justify-center p-4">
                                                <ActivityIndicator size="large" color="#ffffff" className="mb-4" />
                                                <Text className="text-white text-lg font-bold mb-6">Scanning Nails...</Text>
                                                <TouchableOpacity
                                                    onPress={handleCancelDetection}
                                                    className="bg-white/20 px-6 py-2 rounded-full border border-white/50"
                                                >
                                                    <Text className="text-white font-medium">Cancel</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                        {!isDetecting && nails.length === 0 && (
                                            <View className="absolute bottom-4 left-0 right-0 items-center">
                                                <View className="bg-black/50 px-4 py-2 rounded-full">
                                                    <Text className="text-white text-sm">No specific nails detected</Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                ) : (
                                    <View className="absolute inset-0 bg-white/10 dark:bg-black/10 items-center justify-center">
                                        <Text className="text-white dark:text-brand-charcoal-dark text-lg font-bold opacity-60">No Image Provided</Text>
                                    </View>
                                )}
                            </View>

                            <Text className="text-lg text-brand-charcoal dark:text-brand-charcoal-dark mb-2">Selected Shade</Text>
                            <View className="w-full mb-6">
                                <TextInput
                                    className="bg-brand-cream/30 dark:bg-brand-cream-dark/20 border border-brand-charcoal-light/10 rounded-2xl py-4 px-5 text-center text-lg text-brand-charcoal dark:text-brand-charcoal-dark"
                                    placeholder="Name your creation..."
                                    value={customName}
                                    onChangeText={setCustomName}
                                />
                                <View className="flex-row items-center justify-center mt-3">
                                    <View
                                        style={{ backgroundColor: (params.selectedColor as string) || '#697D59' }}
                                        className="w-4 h-4 rounded-full mr-2 border border-brand-charcoal-light/10"
                                    />
                                    <Text className="text-base text-brand-charcoal-light dark:text-brand-charcoal-light/60 font-mono">
                                        {params.selectedColor}
                                    </Text>
                                </View>
                            </View>

                            <Text className="text-base font-semibold text-brand-charcoal dark:text-brand-charcoal-dark mb-4">Tag your intent</Text>
                            <View className="flex-row flex-wrap justify-center gap-2 mb-8">
                                {intents.map((item) => (
                                    <TouchableOpacity
                                        key={item.label}
                                        onPress={() => setSelectedIntent(item.label)}
                                        className={`px-4 py-2 rounded-full border ${selectedIntent === item.label
                                            ? 'bg-brand-sage border-brand-sage'
                                            : 'bg-white border-brand-charcoal-light/20'
                                            }`}
                                    >
                                        <Text className={selectedIntent === item.label ? 'text-white font-bold' : 'text-brand-charcoal-light'}>
                                            {item.icon} {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="w-full bg-brand-sage dark:bg-brand-sage-dark py-5 rounded-2xl items-center shadow-md"
                            >
                                <Text className="text-white text-lg font-bold">Try Another Color</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleDone}
                                disabled={isSaving}
                                className="mt-6"
                            >
                                <Text className="text-brand-sage dark:text-brand-sage-dark text-base font-semibold">
                                    {isSaving ? 'Claiming Name...' : 'Save & Finish'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

export default ResultScreen;

const styles = StyleSheet.create({});
