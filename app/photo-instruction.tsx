import React from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LucideZoomIn, LucideCheckCircle, LucideMaximize, LucideChevronLeft, LucideEyeOff } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');
const CLOSEUP_TIP_KEY = 'has_seen_closeup_tip';

export default function PhotoInstructionScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const scaleAnim = React.useRef(new Animated.Value(1)).current;
    const [isChecking, setIsChecking] = React.useState(true);

    const handleContinue = () => {
        // Navigate to camera with all the params passed from previous screen
        router.replace({
            pathname: "/camera",
            params: params as any
        });
    };

    React.useEffect(() => {
        const checkPersistence = async () => {
            try {
                const hasSeenTip = await SecureStore.getItemAsync(CLOSEUP_TIP_KEY);
                if (hasSeenTip === 'true') {
                    handleContinue();
                    return;
                }
            } catch (e) {
                console.error("Error reading SecureStore", e);
            }
            setIsChecking(false);
        };

        checkPersistence();

        // Pulse animation for the hand/camera icon
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.05,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handleDontShowAgain = async () => {
        try {
            await SecureStore.setItemAsync(CLOSEUP_TIP_KEY, 'true');
        } catch (e) {
            console.error("Error saving to SecureStore", e);
        }
        handleContinue();
    };

    if (isChecking) {
        return <View className="flex-1 bg-brand-peach dark:bg-brand-peach-dark" />;
    }

    return (
        <View className="flex-1 bg-brand-peach dark:bg-brand-peach-dark">
            <SafeAreaView edges={['top', 'bottom']} className="flex-1">
                {/* Clear Back Button */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute top-6 left-6 z-10 w-12 h-12 rounded-full bg-white dark:bg-brand-gray/80 items-center justify-center shadow-md"
                    activeOpacity={0.7}
                >
                    <LucideChevronLeft size={28} color="#307b75" />
                </TouchableOpacity>

                <View className="flex-1 justify-center items-center px-8 mt-8">
                    {/* Animated Image Container */}
                    <Animated.View
                        style={{ transform: [{ scale: scaleAnim }] }}
                        className="mb-8"
                    >
                        <View className="w-80 h-80 bg-white/70 dark:bg-white/10 rounded-[40px] items-center justify-center p-6 border border-brand-teal/20 shadow-xl">
                            <Image
                                source={require('../assets/instruction-closeup.png')}
                                className="w-full h-full"
                                resizeMode="contain"
                            />
                        </View>
                    </Animated.View>

                    {/* Title */}
                    <Text className="text-3xl font-black text-brand-gray dark:text-brand-gray-light text-center mb-2 tracking-tighter">
                        Take a Close-Up
                    </Text>

                    {/* Subtitle */}
                    <Text className="text-base text-brand-gray-medium dark:text-brand-gray-light/80 text-center mb-6 leading-6">
                        Position your hand close or zoom in for the most <Text className="text-brand-teal font-bold underline">accurate</Text> detection.
                    </Text>

                    {/* Tips */}
                    <View className="w-full mb-8">
                        <TipItem
                            icon={<LucideMaximize size={22} color="#307b75" />}
                            text="Keep your hand close to fill the screen"
                        />
                        <TipItem
                            icon={<LucideZoomIn size={22} color="#307b75" />}
                            text="Focus on your nails for 4K detail"
                        />
                        <TipItem
                            icon={<LucideCheckCircle size={22} color="#307b75" />}
                            text="Ensure bright, even lighting"
                        />
                    </View>

                    {/* Button Layout */}
                    <View className="w-full gap-y-4">
                        {/* Continue Button */}
                        <TouchableOpacity
                            onPress={handleContinue}
                            activeOpacity={0.8}
                            className="w-full bg-brand-teal dark:bg-brand-teal-dark rounded-3xl py-5 items-center shadow-lg"
                        >
                            <Text className="text-white text-lg font-black">
                                Got It, Open Camera
                            </Text>
                        </TouchableOpacity>

                        {/* Don't Show Again Button */}
                        <TouchableOpacity
                            onPress={handleDontShowAgain}
                            className="flex-row items-center justify-center py-2"
                            activeOpacity={0.6}
                        >
                            <LucideEyeOff size={16} color="#307b75" className="mr-2" />
                            <Text className="text-brand-teal dark:text-brand-teal-light text-sm font-bold underline">
                                Don't show this again
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

// Tip Item Component
function TipItem({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <View className="flex-row items-center mb-3 bg-white/80 dark:bg-brand-gray/40 rounded-2xl p-4 border border-brand-teal/5 shadow-sm">
            <View className="w-10 h-10 rounded-full bg-brand-teal/10 items-center justify-center mr-4">
                {icon}
            </View>
            <Text className="flex-1 text-sm text-brand-gray dark:text-brand-gray-light font-bold">
                {text}
            </Text>
        </View>
    );
}
