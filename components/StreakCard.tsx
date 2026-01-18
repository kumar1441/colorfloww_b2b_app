import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LucideFlame, LucideShare2, LucideCheck } from 'lucide-react-native';

interface StreakCardProps {
    streak: number;
    onShare: () => void;
}

export default function StreakCard({ streak, onShare }: StreakCardProps) {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const currentDay = new Date().getDay();

    return (
        <View className="bg-white dark:bg-brand-charcoal rounded-[24px] p-6 w-full shadow-sm mb-6 border border-brand-charcoal-light/10 dark:border-brand-charcoal-light/5">
            <View className="flex-row items-center mb-6">
                <View className="relative mr-4">
                    <LucideFlame size={32} color="#F97316" fill="#F97316" />
                    <View className="absolute -bottom-1 -right-1 bg-white dark:bg-brand-charcoal w-[18px] h-[18px] rounded-full border-1.5 border-[#F97316] justify-center items-center">
                        <Text className="text-[10px] font-bold text-brand-charcoal dark:text-brand-charcoal-dark">{streak}</Text>
                    </View>
                </View>

                <View className="flex-1">
                    <Text className="text-2xl font-bold text-brand-charcoal dark:text-brand-charcoal-dark">Your streak</Text>
                </View>

                <TouchableOpacity onPress={onShare} className="p-1">
                    <LucideShare2 size={24} color="#8A8A8A" />
                </TouchableOpacity>
            </View>

            <View className="flex-row justify-between">
                {days.map((day, index) => {
                    const isCompleted = index <= currentDay;
                    return (
                        <View key={day} className="items-center">
                            <Text className="text-sm text-brand-charcoal dark:text-brand-charcoal-dark font-semibold mb-2">{day}</Text>
                            <View className={`w-8 h-8 rounded-full justify-center items-center ${isCompleted ? 'bg-brand-sage dark:bg-brand-sage-dark' : 'bg-brand-cream dark:bg-brand-cream-dark/20 border border-brand-charcoal-light/10'}`}>
                                {isCompleted && <LucideCheck size={12} color="#fff" strokeWidth={3} />}
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({});
