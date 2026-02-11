import React from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LucideZoomIn, LucideCheckCircle, LucideMaximize } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function PhotoInstructionScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
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

    const handleContinue = () => {
        // Navigate to camera with all the params passed from previous screen
        router.push({
            pathname: "/camera",
            params: params as any
        });
    };

    return (
        <View className="flex-1 bg-brand-peach dark:bg-brand-peach-dark">
            <SafeAreaView edges={['top', 'bottom']} className="flex-1">
                <View className="flex-1 justify-center items-center px-8">
                    {/* Animated Image Container - Slightly larger than original w-64 */}
                    <Animated.View
                        style={{ transform: [{ scale: scaleAnim }] }}
                        className="mb-6"
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

                    {/* Tips - More compact to fit screen */}
                    <View className="w-full mb-10">
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

                    {/* Skip Text */}
                    <TouchableOpacity
                        onPress={handleContinue}
                        className="mt-5"
                        activeOpacity={0.6}
                    >
                        <Text className="text-brand-gray-medium dark:text-brand-gray-light/60 text-sm font-bold">
                            Skip this tip
                        </Text>
                    </TouchableOpacity>
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
