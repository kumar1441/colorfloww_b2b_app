import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideArrowLeft } from 'lucide-react-native';
import { AuthService } from '../services/auth';

const { width } = Dimensions.get('window');

/**
 * LoginScreen: Mirror of Onboarding design for consistency.
 */
export default function LoginScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleLogin = async () => {
        // Simulated Login
        await AuthService.login({ email: formData.email, name: 'Welcome Back User' });
        router.replace('/(main)/community');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <LucideArrowLeft size={20} color="#697D59" />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.card}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="your@email.com"
                                placeholderTextColor="#A1A1A1"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.email}
                                onChangeText={(v) => setFormData({ ...formData, email: v })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor="#A1A1A1"
                                secureTextEntry
                                value={formData.password}
                                onChangeText={(v) => setFormData({ ...formData, password: v })}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleLogin}
                            activeOpacity={0.8}
                            style={styles.primaryButton}
                        >
                            <Text style={styles.buttonText}>Sign In</Text>
                        </TouchableOpacity>

                        <View style={styles.footerTextContainer}>
                            <Text style={styles.footerText}>
                                Don't have an account? <Text style={styles.linkText} onPress={() => router.replace('/onboarding')}>Sign up</Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F7F4',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        marginLeft: 8,
        color: '#697D59',
        fontSize: 16,
        fontWeight: '500',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        padding: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2D2D2D',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#8A8A8A',
        marginBottom: 32,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2D2D2D',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(249, 247, 244, 0.5)',
        borderWidth: 1,
        borderColor: '#E8E5E1',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#2D2D2D',
    },
    primaryButton: {
        backgroundColor: '#697D59',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 24,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footerTextContainer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#8A8A8A',
    },
    linkText: {
        color: '#697D59',
        fontWeight: 'bold',
    },
});
