import React from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LucideCamera, LucideZoomIn, LucideCheckCircle, LucideMaximize } from 'lucide-react-native';

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
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 1000,
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
                    {/* Animated Image Container */}
                    <Animated.View
                        style={{ transform: [{ scale: scaleAnim }] }}
                        className="mb-8"
                    >
                        <View className="w-64 h-64 bg-white/50 dark:bg-white/10 rounded-3xl items-center justify-center p-4 border border-brand-teal/20">
                            <Image
                                source={require('../assets/instruction-closeup.png')}
                                className="w-full h-full"
                                resizeMode="contain"
                            />
                        </View>
                    </Animated.View>

                    {/* Title */}
                    <Text className="text-3xl font-bold text-brand-gray dark:text-brand-gray-light text-center mb-4">
                        Take a Close-Up
                    </Text>

                    {/* Subtitle */}
                    <Text className="text-lg text-brand-gray-medium dark:text-brand-gray-light/80 text-center mb-8 leading-7">
                        Move your hand closer or zoom in for the most <Text className="text-brand-teal font-bold underline">accurate</Text> color match.
                    </Text>

                    {/* Tips */}
                    <View className="w-full mb-16">
                        <TipItem
                            icon={<LucideMaximize size={24} color="#307b75" />}
                            text="Keep your hand close to fill the screen"
                        />
                        <TipItem
                            icon={<LucideZoomIn size={24} color="#307b75" />}
                            text="Focus on your nails for 4K detail"
                        />
                        <TipItem
                            icon={<LucideCheckCircle size={24} color="#307b75" />}
                            text="Ensure bright, even lighting"
                        />
                    </View>

                    {/* Continue Button */}
                    <TouchableOpacity
                        onPress={handleContinue}
                        activeOpacity={0.8}
                        className="w-full bg-brand-teal dark:bg-brand-teal-dark rounded-2xl py-5 items-center shadow-lg"
                    >
                        <Text className="text-white text-lg font-bold">
                            Got It, Open Camera
                        </Text>
                    </TouchableOpacity>

                    {/* Skip Text */}
                    <TouchableOpacity
                        onPress={handleContinue}
                        className="mt-6"
                        activeOpacity={0.6}
                    >
                        <Text className="text-brand-gray-medium dark:text-brand-gray-light/60 text-sm">
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
        <View className="flex-row items-center mb-6 bg-white dark:bg-brand-gray/40 rounded-2xl p-4 border border-brand-gray-medium/10 dark:border-brand-gray-medium/5 shadow-sm">
            <View className="w-12 h-12 rounded-full bg-brand-teal-light dark:bg-brand-teal/20 items-center justify-center mr-4">
                {icon}
            </View>
            <Text className="flex-1 text-base text-brand-gray dark:text-brand-gray-light font-medium">
                {text}
            </Text>
        </View>
    );
}
