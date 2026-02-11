import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, Image, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import { LucidePalette, LucideSliders, LucideUpload, LucideSparkles, LucideCamera, LucideImage, LucideX } from 'lucide-react-native';
import { AuthService } from '../../services/auth';

const { width } = Dimensions.get('window');

export default function ColorCustomizer() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"sliders" | "upload">("sliders");
    const [rgb, setRgb] = useState({ r: 105, g: 125, b: 89 });
    const [colorName, setColorName] = useState("");
    const [showNameInput, setShowNameInput] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isPickingColor, setIsPickingColor] = useState(false);

    const rgbToHex = (r: number, g: number, b: number) => {
        return "#" + [r, g, b].map(x => {
            const hex = Math.round(x).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("").toUpperCase();
    };

    const currentColor = rgbToHex(rgb.r, rgb.g, rgb.b);

    const handleSliderChange = (channel: "r" | "g" | "b", value: number) => {
        setRgb(prev => ({ ...prev, [channel]: value }));
    };

    const requestCameraPermission = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Camera permission is required to take photos.');
            return false;
        }
        return true;
    };

    const requestGalleryPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Gallery permission is required to select photos.');
            return false;
        }
        return true;
    };

    const takePhoto = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return;

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setUploadedImage(result.assets[0].uri);
            setIsPickingColor(true);
        }
    };

    const pickImageFromGallery = async () => {
        const hasPermission = await requestGalleryPermission();
        if (!hasPermission) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setUploadedImage(result.assets[0].uri);
            setIsPickingColor(true);
        }
    };

    const handleImagePress = async (event: any) => {
        if (!uploadedImage) return;

        const { locationX, locationY } = event.nativeEvent;

        // For a more accurate color extraction, we would need to use canvas or image manipulation
        // For now, we'll use a simplified approach with react-native-image-colors or similar
        // Since we don't have that library, we'll simulate color picking by using a predefined color
        // In production, you'd want to use expo-image-manipulator or a similar library

        Alert.alert(
            'Color Picker',
            'Tap confirmed! In production, this would extract the exact pixel color. For now, using a sample color.',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        // Simulate color extraction - in production, extract actual pixel color
                        // For demo purposes, we'll use a random-ish color based on position
                        const r = Math.floor((locationX / width) * 255);
                        const g = Math.floor((locationY / width) * 255);
                        const b = Math.floor(((locationX + locationY) / (width * 2)) * 255);

                        setRgb({ r, g, b });
                        setIsPickingColor(false);
                    }
                }
            ]
        );
    };

    const clearImage = () => {
        setUploadedImage(null);
        setIsPickingColor(false);
    };

    const handleTryOn = async () => {
        const loggedIn = await AuthService.isLoggedIn();
        if (!loggedIn) {
            router.push({
                pathname: "/signup",
                params: { returnTo: "/camera", color: currentColor }
            });
            return;
        }

        if (!showNameInput && !colorName) {
            setShowNameInput(true);
        } else {
            router.push({
                pathname: "/camera",
                params: { color: currentColor, colorName }
            });
        }
    };

    return (
        <View className="flex-1 bg-brand-cream dark:bg-brand-cream-dark">
            <SafeAreaView edges={['top']} className="bg-brand-cream/80 dark:bg-brand-cream-dark/80">
                <View className="px-6 pt-4 pb-5">
                    <View className="flex-row items-center gap-x-3 mb-5">
                        <LucidePalette size={32} color="#697D59" strokeWidth={1.5} />
                        <Text className="text-3xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark">Custom Mix</Text>
                    </View>

                    {/* Tabs */}
                    <View className="flex-row bg-white/60 dark:bg-brand-charcoal/40 rounded-2xl p-1 gap-x-1 border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5">
                        <TouchableOpacity
                            onPress={() => setActiveTab("sliders")}
                            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl gap-x-2 ${activeTab === "sliders" ? "bg-brand-sage dark:bg-brand-sage-dark" : ""}`}
                        >
                            <LucideSliders size={18} color={activeTab === "sliders" ? "#fff" : "#8A8A8A"} />
                            <Text className={`text-sm font-semibold ${activeTab === "sliders" ? "text-white" : "text-brand-charcoal-light"}`}>Sliders</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveTab("upload")}
                            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl gap-x-2 ${activeTab === "upload" ? "bg-brand-sage dark:bg-brand-sage-dark" : ""}`}
                        >
                            <LucideUpload size={18} color={activeTab === "upload" ? "#fff" : "#8A8A8A"} />
                            <Text className={`text-sm font-semibold ${activeTab === "upload" ? "text-white" : "text-brand-charcoal-light"}`}>Upload</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                {/* Preview Card */}
                <View className="bg-white/60 dark:bg-brand-charcoal/40 rounded-[32px] p-6 mb-6 border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5 items-center shadow-sm">
                    <Text className="self-start text-sm text-brand-charcoal-light dark:text-brand-charcoal-light/60 mb-4">Preview</Text>
                    <View
                        className="w-full h-40 rounded-3xl mb-5 overflow-hidden shadow-lg"
                        style={{ backgroundColor: currentColor }}
                    >
                        <View className="absolute inset-0 bg-white/10 -skew-x-[20deg] -translate-x-[50px]" />
                    </View>
                    <View className="items-center">
                        <Text className="text-3xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark mb-1">{currentColor}</Text>
                        <Text className="text-sm text-brand-charcoal-light dark:text-brand-charcoal-light/60">
                            RGB({Math.round(rgb.r)}, {Math.round(rgb.g)}, {Math.round(rgb.b)})
                        </Text>
                    </View>
                </View>

                {/* Name Input */}
                {showNameInput && (
                    <View className="bg-white/60 dark:bg-brand-charcoal/40 rounded-3xl p-5 mb-6 border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5">
                        <View className="flex-row items-center gap-x-2 mb-3">
                            <LucideSparkles size={18} color="#697D59" />
                            <Text className="text-base font-semibold text-brand-charcoal dark:text-brand-charcoal-dark">Name Your Creation</Text>
                        </View>
                        <TextInput
                            value={colorName}
                            onChangeText={setColorName}
                            placeholder="e.g., Morning Dew..."
                            placeholderTextColor="#A1A1A1"
                            className="bg-white/80 dark:bg-brand-charcoal/60 rounded-xl p-4 text-base text-brand-charcoal dark:text-brand-charcoal-dark border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5"
                        />
                    </View>
                )}

                {/* Sliders */}
                {activeTab === "sliders" && (
                    <View className="gap-y-4 mb-8">
                        {['r', 'g', 'b'].map((channel) => (
                            <View key={channel} className="bg-white/40 dark:bg-brand-charcoal/20 rounded-2xl p-4 border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5">
                                <View className="flex-row justify-between mb-3">
                                    <Text className="text-sm font-semibold text-brand-charcoal dark:text-brand-charcoal-dark">
                                        {channel === 'r' ? 'Red' : channel === 'g' ? 'Green' : 'Blue'}
                                    </Text>
                                    <Text className="text-sm text-brand-charcoal-light dark:text-brand-charcoal-light/60 font-mono">
                                        {Math.round(rgb[channel as keyof typeof rgb])}
                                    </Text>
                                </View>
                                <Slider
                                    minimumValue={0}
                                    maximumValue={255}
                                    value={rgb[channel as keyof typeof rgb]}
                                    onValueChange={(v) => handleSliderChange(channel as any, v)}
                                    minimumTrackTintColor={channel === 'r' ? '#FF4B4B' : channel === 'g' ? '#4BFF4B' : '#4B4BFF'}
                                    maximumTrackTintColor={Platform.OS === 'ios' ? '#E8E5E1' : '#D1D1D1'}
                                    thumbTintColor="#697D59"
                                />
                            </View>
                        ))}
                    </View>
                )}

                {/* Upload Tab */}
                {activeTab === "upload" && (
                    <View className="mb-8">
                        {!uploadedImage ? (
                            <View className="gap-y-4">
                                <TouchableOpacity
                                    onPress={takePhoto}
                                    className="bg-white/60 dark:bg-brand-charcoal/40 rounded-3xl p-6 border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5 flex-row items-center gap-x-4"
                                    activeOpacity={0.7}
                                >
                                    <View className="w-14 h-14 rounded-2xl bg-brand-sage/10 items-center justify-center">
                                        <LucideCamera size={28} color="#697D59" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-brand-charcoal dark:text-brand-charcoal-dark mb-1">Take Photo</Text>
                                        <Text className="text-sm text-brand-charcoal-light dark:text-brand-charcoal-light/60">
                                            Capture a color from your camera
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={pickImageFromGallery}
                                    className="bg-white/60 dark:bg-brand-charcoal/40 rounded-3xl p-6 border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5 flex-row items-center gap-x-4"
                                    activeOpacity={0.7}
                                >
                                    <View className="w-14 h-14 rounded-2xl bg-brand-sage/10 items-center justify-center">
                                        <LucideImage size={28} color="#697D59" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-brand-charcoal dark:text-brand-charcoal-dark mb-1">Choose from Gallery</Text>
                                        <Text className="text-sm text-brand-charcoal-light dark:text-brand-charcoal-light/60">
                                            Pick a color from your photos
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View className="bg-white/60 dark:bg-brand-charcoal/40 rounded-3xl p-5 border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5">
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-base font-semibold text-brand-charcoal dark:text-brand-charcoal-dark">
                                        {isPickingColor ? 'Tap on image to pick a color' : 'Color selected!'}
                                    </Text>
                                    <TouchableOpacity onPress={clearImage} className="w-8 h-8 rounded-full bg-red-100 items-center justify-center">
                                        <LucideX size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity
                                    onPress={handleImagePress}
                                    activeOpacity={isPickingColor ? 0.8 : 1}
                                    disabled={!isPickingColor}
                                >
                                    <Image
                                        source={{ uri: uploadedImage }}
                                        className="w-full h-64 rounded-2xl"
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                                {isPickingColor && (
                                    <View className="mt-4 bg-brand-sage/10 rounded-2xl p-4">
                                        <Text className="text-sm text-brand-charcoal dark:text-brand-charcoal-dark text-center font-medium">
                                            👆 Tap anywhere on the image to extract that color
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                )}

                <TouchableOpacity
                    onPress={handleTryOn}
                    activeOpacity={0.8}
                    className="bg-brand-sage dark:bg-brand-sage-dark rounded-2xl py-5 items-center shadow-lg"
                >
                    <Text className="text-white text-lg font-bold">
                        {showNameInput && colorName ? "Save & Try This Color" : "Try This Color"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({});

