import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideSparkles } from 'lucide-react-native';
import { AuthService } from '../services/auth';
import { useEffect, useState } from 'react';

const { width } = Dimensions.get('window');

/**
 * WelcomeScreen: Static premium version. 
 * Re-enables high-end aesthetics while keeping it standard/safe (no Reanimated).
 */
export default function WelcomeScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const loggedIn = await AuthService.isLoggedIn();
        if (loggedIn) {
            router.replace('/(main)/community');
        } else {
            setIsLoading(false);
        }
    };

    if (isLoading) return <View style={styles.container} />;

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.content}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <LucideSparkles
                            size={64}
                            color="#697D59"
                            strokeWidth={1.5}
                        />
                    </View>
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>NailArt</Text>
                    <Text style={styles.subtitle}>
                        Visualize your perfect nail polish color with AI-powered virtual try-on
                    </Text>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={() => router.push('/onboarding')}
                        activeOpacity={0.8}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>Get Started</Text>
                    </TouchableOpacity>

                    <Text style={styles.caption}>
                        Join thousands of users discovering their perfect shade
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F7F4', // Base cream color
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    logoContainer: {
        marginBottom: 48,
    },
    logoCircle: {
        width: 128,
        height: 128,
        backgroundColor: '#fff',
        borderRadius: 64,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    textContainer: {
        alignItems: 'center',
        maxWidth: 320,
    },
    title: {
        fontSize: 56,
        color: '#2D2D2D',
        fontWeight: '300',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        color: '#5A5A5A',
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 48,
    },
    footer: {
        width: '100%',
        alignItems: 'center',
    },
    button: {
        width: '100%',
        backgroundColor: '#697D59',
        paddingVertical: 18,
        borderRadius: 32,
        alignItems: 'center',
        shadowColor: "#697D59",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    caption: {
        marginTop: 24,
        color: '#8A8A8A',
        fontSize: 14,
    }
});
