import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Share } from 'react-native';
import { LucideFlame, LucideX, LucideShare2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface StreakShareModalProps {
    visible: boolean;
    streak: number;
    onClose: () => void;
}

export default function StreakShareModal({ visible, streak, onClose }: StreakShareModalProps) {
    const handleShare = async () => {
        try {
            await Share.share({
                message: `I've been using NailArt for ${streak} days straight! 🔥💅 Join me and try on some colors!`,
                title: 'NailArt Streak'
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <LucideX size={24} color="#2D2D2D" />
                    </TouchableOpacity>

                    <View style={styles.card}>
                        <View style={styles.flameContainer}>
                            <LucideFlame size={80} color="#F97316" fill="#F97316" />
                            <View style={styles.streakBadge}>
                                <Text style={styles.streakNumber}>{streak}</Text>
                            </View>
                        </View>

                        <Text style={styles.title}>day streak</Text>
                        <Text style={styles.subtitle}>
                            I've made a habit of visualizing new nail colors every day!
                        </Text>

                        <View style={styles.branding}>
                            <View style={styles.logoDot} />
                            <Text style={styles.brandText}>nailart.app</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                        <LucideShare2 size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.shareText}>Share Streak</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    container: {
        width: '100%',
        alignItems: 'center',
    },
    closeBtn: {
        position: 'absolute',
        top: -60,
        right: 0,
        backgroundColor: '#fff',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 40,
        alignItems: 'center',
    },
    flameContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    streakBadge: {
        position: 'absolute',
        bottom: 10,
        left: '50%',
        transform: [{ translateX: -20 }],
        backgroundColor: '#fff',
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#F97316',
        justifyContent: 'center',
        alignItems: 'center',
    },
    streakNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D2D2D',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2D2D2D',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#5A5A5A',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    branding: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F7F4',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    logoDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#2D2D2D',
        marginRight: 8,
    },
    brandText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2D2D2D',
    },
    shareButton: {
        backgroundColor: '#697D59',
        width: '100%',
        paddingVertical: 18,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    shareText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});
