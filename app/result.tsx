import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GamificationService } from '../services/gamification';

/**
 * ResultScreen: Logic for updating streaks and displaying try-on results.
 */
export default function ResultScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();

    useEffect(() => {
        // Increment streak on every successful try-on (once per day logic inside service)
        GamificationService.updateStreak().then(({ streak, reachedMilestone }) => {
            if (reachedMilestone) {
                Alert.alert(
                    "🔥 Great job!",
                    `You've painted your nails for ${streak} days in a row! You're on fire!`,
                    [{ text: "Excellent!" }]
                );
            }
        });
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Result Screen</Text>
                <Text style={styles.subtitle}>Selected Color: {params.selectedColor}</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    title: { fontSize: 32, color: '#fff', marginBottom: 12 },
    subtitle: { fontSize: 18, color: '#ccc', marginBottom: 24 },
    button: { backgroundColor: '#374151', padding: 18, borderRadius: 16, width: '100%', alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
