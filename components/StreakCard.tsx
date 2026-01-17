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
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.flameContainer}>
                    <LucideFlame size={32} color="#F97316" fill="#F97316" />
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{streak}</Text>
                    </View>
                </View>

                <View style={styles.titleColumn}>
                    <Text style={styles.title}>Your streak</Text>
                </View>

                <TouchableOpacity onPress={onShare} style={styles.shareBtn}>
                    <LucideShare2 size={24} color="#8A8A8A" />
                </TouchableOpacity>
            </View>

            <View style={styles.daysRow}>
                {days.map((day, index) => {
                    const isCompleted = index <= currentDay;
                    return (
                        <View key={day} style={styles.dayItem}>
                            <Text style={styles.dayLabel}>{day}</Text>
                            <View style={[
                                styles.dot,
                                isCompleted ? styles.dotActive : styles.dotInactive
                            ]}>
                                {isCompleted && <LucideCheck size={12} color="#fff" strokeWidth={3} />}
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    flameContainer: {
        position: 'relative',
        marginRight: 16,
    },
    badge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#fff',
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1.5,
        borderColor: '#F97316',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#2D2D2D',
    },
    titleColumn: {
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2D2D2D',
    },
    shareBtn: {
        padding: 4,
    },
    daysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayItem: {
        alignItems: 'center',
    },
    dayLabel: {
        fontSize: 14,
        color: '#2D2D2D',
        fontWeight: '600',
        marginBottom: 8,
    },
    dot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dotActive: {
        backgroundColor: '#A78BFA', // Matching the purple/blue gradient from ref image
    },
    dotInactive: {
        backgroundColor: '#F9F7F4',
        borderWidth: 1,
        borderColor: '#E8E5E1',
    }
});
