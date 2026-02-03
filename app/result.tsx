import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GamificationService } from '../services/gamification';
import { detectNails, Nail } from '../services/nailDetection';
import { NailOverlaySkia } from '../components/NailOverlaySkia';

/**
 * ResultScreen: Logic for updating streaks and displaying try-on results.
 */
function ResultScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();

    const [nails, setNails] = React.useState<Nail[]>([]);
    const [isDetecting, setIsDetecting] = React.useState(true);

    useEffect(() => {
        if (params.imageUri) {
            handleDetection();
        }

        // Increment streak on every successful try-on (once per day logic inside service)
        GamificationService.updateStreak().then(({ streak, reachedMilestone }) => {
            if (reachedMilestone) {
                Alert.alert(
                    "🔥 Great job!",
                    `You've painted your nails for ${streak} days in a row! You're on fire!`,
                    [{ text: "Excellent!" }]
                );
            }
        });
    }, [params.imageUri]);

    const handleDetection = async () => {
        setIsDetecting(true);
        try {
            const detectedNails = await detectNails(params.imageUri as string);
            console.log("Detected Nails:", JSON.stringify(detectedNails));
            setNails(detectedNails);
        } catch (e) {
            console.error("Detection handling error:", e);
        } finally {
            setIsDetecting(false);
        }
    };

    return (
        <View className="flex-1 bg-brand-cream dark:bg-brand-cream-dark">
            <SafeAreaView className="flex-1">
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
                                        <View className="absolute inset-0 bg-black/40 items-center justify-center">
                                            <Text className="text-white text-lg font-bold">Scanning Nails...</Text>
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
                        <Text className="text-base text-brand-charcoal-light dark:text-brand-charcoal-light/60 font-mono mb-8">
                            {params.selectedColor}
                        </Text>

                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-full bg-brand-sage dark:bg-brand-sage-dark py-5 rounded-2xl items-center shadow-md"
                        >
                            <Text className="text-white text-lg font-bold">Try Another Color</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.dismissAll()}
                            className="mt-6"
                        >
                            <Text className="text-brand-sage dark:text-brand-sage-dark text-base font-semibold">Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

export default ResultScreen;

const styles = StyleSheet.create({});
