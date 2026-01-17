import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
// import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { LucidePalette, LucideSliders, LucideUpload, LucideSparkles } from 'lucide-react-native';

export default function ColorCustomizer() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"sliders" | "upload">("sliders");
    const [rgb, setRgb] = useState({ r: 105, g: 125, b: 89 });
    const [colorName, setColorName] = useState("");
    const [showNameInput, setShowNameInput] = useState(false);

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

    const handleTryOn = () => {
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
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.titleRow}>
                        <LucidePalette size={32} color="#697D59" strokeWidth={1.5} />
                        <Text style={styles.title}>Custom Colors</Text>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            onPress={() => setActiveTab("sliders")}
                            style={[styles.tab, activeTab === "sliders" && styles.activeTab]}
                        >
                            <LucideSliders size={20} color={activeTab === "sliders" ? "#fff" : "#8A8A8A"} />
                            <Text style={[styles.tabText, activeTab === "sliders" && styles.activeTabText]}>Sliders</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveTab("upload")}
                            style={[styles.tab, activeTab === "upload" && styles.activeTab]}
                        >
                            <LucideUpload size={20} color={activeTab === "upload" ? "#fff" : "#8A8A8A"} />
                            <Text style={[styles.tabText, activeTab === "upload" && styles.activeTabText]}>Upload</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Preview Card */}
                <View style={styles.previewCard}>
                    <Text style={styles.previewLabel}>Preview</Text>
                    <View style={[styles.colorPreview, { backgroundColor: currentColor }]}>
                        <View style={styles.shine} />
                    </View>
                    <View style={styles.colorInfo}>
                        <Text style={styles.hexText}>{currentColor}</Text>
                        <Text style={styles.rgbText}>RGB({Math.round(rgb.r)}, {Math.round(rgb.g)}, {Math.round(rgb.b)})</Text>
                    </View>
                </View>

                {/* Name Input */}
                {showNameInput && (
                    <View style={styles.glassCard}>
                        <View style={styles.labelRow}>
                            <LucideSparkles size={18} color="#697D59" />
                            <Text style={styles.cardLabel}>Name Your Creation</Text>
                        </View>
                        <TextInput
                            value={colorName}
                            onChangeText={setColorName}
                            placeholder="e.g., Morning Dew..."
                            placeholderTextColor="#8A8A8A"
                            style={styles.input}
                        />
                    </View>
                )}

                {/* Sliders */}
                {activeTab === "sliders" && (
                    <View style={styles.controls}>
                        {['r', 'g', 'b'].map((channel) => (
                            <View key={channel} style={styles.sliderCard}>
                                <View style={styles.sliderHeader}>
                                    <Text style={styles.channelLabel}>{channel === 'r' ? 'Red' : channel === 'g' ? 'Green' : 'Blue'}</Text>
                                    <Text style={styles.channelValue}>{Math.round(rgb[channel as keyof typeof rgb])}</Text>
                                </View>
                                <Slider
                                    minimumValue={0}
                                    maximumValue={255}
                                    value={rgb[channel as keyof typeof rgb]}
                                    onValueChange={(v) => handleSliderChange(channel as any, v)}
                                    minimumTrackTintColor={channel === 'r' ? '#FF4B4B' : channel === 'g' ? '#4BFF4B' : '#4B4BFF'}
                                    maximumTrackTintColor="#E8E5E1"
                                    thumbTintColor="#697D59"
                                />
                            </View>
                        ))}
                    </View>
                )}

                {activeTab === "upload" && (
                    <View style={styles.glassCard}>
                        <Text style={styles.cardLabel}>Upload logic placeholder</Text>
                        <Text style={styles.subtitle}>In the native app, you can pick colors directly from your camera roll or using the color picker.</Text>
                    </View>
                )}

                <TouchableOpacity
                    onPress={handleTryOn}
                    activeOpacity={0.8}
                    style={styles.primaryButton}
                >
                    <Text style={styles.buttonText}>
                        {showNameInput && colorName ? "Save & Try This Color" : "Try This Color"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F7F4',
    },
    header: {
        backgroundColor: 'rgba(249, 247, 244, 0.8)',
    },
    headerContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        color: '#2D2D2D',
        fontWeight: '700',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 20,
        padding: 4,
        gap: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 16,
        gap: 8,
    },
    activeTab: {
        backgroundColor: '#697D59',
    },
    tabText: {
        fontSize: 14,
        color: '#8A8A8A',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#fff',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 120,
    },
    previewCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 32,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        alignItems: 'center',
    },
    previewLabel: {
        alignSelf: 'flex-start',
        fontSize: 14,
        color: '#8A8A8A',
        marginBottom: 16,
    },
    colorPreview: {
        width: '100%',
        height: 160,
        borderRadius: 24,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
    },
    shine: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        transform: [{ skewX: '-20deg' }, { translateX: -50 }],
    },
    colorInfo: {
        alignItems: 'center',
    },
    hexText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2D2D2D',
        marginBottom: 4,
    },
    rgbText: {
        fontSize: 14,
        color: '#8A8A8A',
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    cardLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D2D2D',
    },
    subtitle: {
        fontSize: 14,
        color: '#8A8A8A',
        lineHeight: 20,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 16,
        padding: 14,
        fontSize: 16,
        color: '#2D2D2D',
        borderWidth: 1,
        borderColor: '#E8E5E1',
    },
    controls: {
        gap: 16,
        marginBottom: 32,
    },
    sliderCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    channelLabel: {
        fontSize: 14,
        color: '#2D2D2D',
        fontWeight: '600',
    },
    channelValue: {
        fontSize: 14,
        color: '#8A8A8A',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    primaryButton: {
        backgroundColor: '#697D59',
        borderRadius: 20,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: "#697D59",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    }
});
