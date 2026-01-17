import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideArrowLeft, LucideShieldCheck, LucideCheck } from 'lucide-react-native';
import { AuthService } from '../services/auth';

const { width, height } = Dimensions.get('window');

/**
 * OnboardingScreen: Matches the user-provided design reference precisely.
 * Features a multi-step flow for account creation and profile details.
 */
export default function OnboardingScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [showConsent, setShowConsent] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        age: "",
        gender: "",
        city: "",
        zipcode: ""
    });

    const handleContinue = () => {
        if (step === 1) {
            setStep(2);
        } else {
            setShowConsent(true);
        }
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
        } else {
            router.back();
        }
    };

    const finalizeOnboarding = async () => {
        await AuthService.login(formData);
        setShowConsent(false);
        router.push('/(main)/community');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <LucideArrowLeft size={20} color="#697D59" />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.card}>
                        <Text style={styles.title}>
                            {step === 1 ? "Create Account" : "About You"}
                        </Text>
                        <Text style={styles.subtitle}>
                            {step === 1 ? "Let's get you started" : "Help us personalize your experience"}
                        </Text>

                        {step === 1 ? (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Full Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your name"
                                        placeholderTextColor="#A1A1A1"
                                        value={formData.name}
                                        onChangeText={(v) => setFormData({ ...formData, name: v })}
                                    />
                                </View>

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
                                        placeholder="Create a password"
                                        placeholderTextColor="#A1A1A1"
                                        secureTextEntry
                                        value={formData.password}
                                        onChangeText={(v) => setFormData({ ...formData, password: v })}
                                    />
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                        <Text style={styles.label}>Age</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="25"
                                            placeholderTextColor="#A1A1A1"
                                            keyboardType="numeric"
                                            value={formData.age}
                                            onChangeText={(v) => setFormData({ ...formData, age: v })}
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                        <Text style={styles.label}>Gender</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Female"
                                            placeholderTextColor="#A1A1A1"
                                            value={formData.gender}
                                            onChangeText={(v) => setFormData({ ...formData, gender: v })}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>City Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="New York"
                                        placeholderTextColor="#A1A1A1"
                                        value={formData.city}
                                        onChangeText={(v) => setFormData({ ...formData, city: v })}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Zipcode</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="10001"
                                        placeholderTextColor="#A1A1A1"
                                        keyboardType="numeric"
                                        value={formData.zipcode}
                                        onChangeText={(v) => setFormData({ ...formData, zipcode: v })}
                                    />
                                </View>
                            </>
                        )}

                        <TouchableOpacity
                            onPress={handleContinue}
                            activeOpacity={0.8}
                            style={styles.primaryButton}
                        >
                            <Text style={styles.buttonText}>
                                {step === 1 ? "Continue" : "Finish Set Up"}
                            </Text>
                        </TouchableOpacity>

                        {step === 1 && (
                            <View style={styles.footerTextContainer}>
                                <Text style={styles.footerText}>
                                    Already have an account? <Text style={styles.linkText} onPress={() => router.replace('/login')}>Log in</Text>
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.indicatorContainer}>
                        <View style={[styles.dot, step === 1 && styles.activeDot]} />
                        <View style={[styles.dot, step === 2 && styles.activeDot]} />
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Consent Modal */}
            <Modal
                visible={showConsent}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIcon}>
                            <LucideShieldCheck size={48} color="#697D59" />
                        </View>
                        <Text style={styles.modalTitle}>Data Privacy</Text>
                        <Text style={styles.modalBody}>
                            We value your privacy. Can we collect anonymized data to improve the virtual try-on experience? This data is encrypted and never linked to your personal identity.
                        </Text>

                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={finalizeOnboarding}
                        >
                            <LucideCheck size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.confirmText}>I Agree</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.skipButton}
                            onPress={finalizeOnboarding}
                        >
                            <Text style={styles.skipText}>Maybe Later</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E8E5E1',
    },
    activeDot: {
        backgroundColor: '#697D59',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 32,
        width: '100%',
        alignItems: 'center',
    },
    modalIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F9F7F4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D2D2D',
        marginBottom: 16,
    },
    modalBody: {
        fontSize: 16,
        color: '#5A5A5A',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    confirmButton: {
        backgroundColor: '#697D59',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    confirmText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    skipButton: {
        paddingVertical: 12,
    },
    skipText: {
        color: '#8A8A8A',
        fontSize: 16,
        fontWeight: '500',
    }
});
