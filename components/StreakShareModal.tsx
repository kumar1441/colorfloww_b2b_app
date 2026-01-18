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
            <View className="flex-1 bg-black/80 justify-center items-center p-6">
                <View className="w-full items-center">
                    <TouchableOpacity className="absolute -top-16 right-0 bg-white dark:bg-brand-charcoal w-11 h-11 rounded-full justify-center items-center" onPress={onClose}>
                        <LucideX size={24} color="#2D2D2D" className="dark:text-brand-charcoal-dark" />
                    </TouchableOpacity>

                    <View className="w-full bg-white dark:bg-brand-charcoal rounded-[32px] p-10 items-center">
                        <View className="relative mb-5">
                            <LucideFlame size={80} color="#F97316" fill="#F97316" />
                            <View className="absolute bottom-2.5 left-1/2 -ml-5 bg-white dark:bg-brand-charcoal w-10 h-10 rounded-full border-3 border-[#F97316] justify-center items-center">
                                <Text className="text-lg font-bold text-brand-charcoal dark:text-brand-charcoal-dark">{streak}</Text>
                            </View>
                        </View>

                        <Text className="text-3xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark mb-4">day streak</Text>
                        <Text className="text-base text-brand-charcoal/70 dark:text-brand-charcoal-light/80 text-center leading-6 mb-10">
                            I've made a habit of visualizing new nail colors every day!
                        </Text>

                        <View className="flex-row items-center bg-brand-cream dark:bg-brand-cream-dark/20 px-4 py-2 rounded-xl">
                            <View className="w-3 h-3 rounded-full bg-brand-charcoal dark:bg-brand-charcoal-dark mr-2" />
                            <Text className="text-sm font-semibold text-brand-charcoal dark:text-brand-charcoal-dark">nailart.app</Text>
                        </View>
                    </View>

                    <TouchableOpacity className="bg-brand-sage dark:bg-brand-sage-dark w-full py-4.5 rounded-2xl flex-row justify-center items-center mt-6 shadow-lg" onPress={handleShare}>
                        <LucideShare2 size={20} color="#fff" className="mr-2" />
                        <Text className="text-white text-lg font-bold">Share Streak</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({});
