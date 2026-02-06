import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LucideFlame, LucideShare2, LucideCheck } from 'lucide-react-native';

interface StreakCardProps {
    streak: number;
    activityData: boolean[]; // Array of 7 booleans for Sun-Sat
    onShare: () => void;
}

export default function StreakCard({ streak, activityData, onShare }: StreakCardProps) {
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
                    const isActive = activityData?.[index] ?? false;
                    const isToday = index === currentDay;

                    return (
                        <View key={day} className="items-center">
                            <Text className={`text-sm font-semibold mb-2 ${isToday ? 'text-brand-sage dark:text-brand-sage-dark' : 'text-brand-charcoal dark:text-brand-charcoal-dark'}`}>
                                {day}
                            </Text>
                            <View className={`w-8 h-8 rounded-full justify-center items-center ${isActive ? 'bg-brand-sage dark:bg-brand-sage-dark' : 'bg-brand-cream dark:bg-brand-cream-dark/20 border border-brand-charcoal-light/10'}`}>
                                {isActive && <LucideCheck size={12} color="#fff" strokeWidth={3} />}
                                {!isActive && isToday && <View className="w-1.5 h-1.5 rounded-full bg-brand-charcoal-light/30" />}
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({});
