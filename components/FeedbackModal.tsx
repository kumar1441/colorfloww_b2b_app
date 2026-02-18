import React, { useState } from 'react';
import { View, Text, Pressable, Modal, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, StyleSheet, Dimensions } from 'react-native';
import { LucideMessageSquare, LucideX, LucideCheck } from 'lucide-react-native';
import { FeedbackService, FeedbackCategory } from '../services/feedback';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FeedbackModalProps {
    visible: boolean;
    onClose: () => void;
}

const categories: { label: string; value: FeedbackCategory; icon: string }[] = [
    { label: 'Feature Request', value: 'Feature Request', icon: '🚀' },
    { label: 'Love the App', value: 'Like Feature', icon: '❤️' },
    { label: 'Needs Work', value: 'Dislike Feature', icon: '🔧' },
    { label: 'Bug Report', value: 'Bug Report', icon: '🐛' },
    { label: 'General', value: 'General', icon: '📝' },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory | null>(null);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!selectedCategory) {
            Alert.alert('Selection Required', 'Please choose a category for your feedback.');
            return;
        }

        setIsSubmitting(true);
        try {
            await FeedbackService.submitFeedback(selectedCategory, message);
            Alert.alert('Thank You!', 'Your feedback has been received. We appreciate your input!', [
                { text: 'Great', onPress: handleClose }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Could not submit feedback. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSelectedCategory(null);
        setMessage('');
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <View style={styles.modalContent}>
                            {/* Header */}
                            <View style={styles.header}>
                                <View style={styles.headerTitleContainer}>
                                    <View style={styles.iconContainer}>
                                        <LucideMessageSquare size={24} color="#307b75" strokeWidth={2} />
                                    </View>
                                    <Text style={styles.titleText}>Feedback</Text>
                                </View>
                                <Pressable
                                    onPress={handleClose}
                                    style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.5 }]}
                                >
                                    <LucideX size={28} color="#8A8A8A" strokeWidth={2} />
                                </Pressable>
                            </View>

                            <Text style={styles.subtitleText}>How can we help you?</Text>

                            {/* Category Grid */}
                            <View style={styles.categoryGrid}>
                                {categories.map((cat) => (
                                    <Pressable
                                        key={cat.value}
                                        onPress={() => setSelectedCategory(cat.value)}
                                        style={({ pressed }) => [
                                            styles.categoryItem,
                                            selectedCategory === cat.value && styles.categoryItemSelected,
                                            pressed && { opacity: 0.8 }
                                        ]}
                                    >
                                        <Text style={styles.categoryIcon}>{cat.icon}</Text>
                                        <Text
                                            numberOfLines={1}
                                            style={[
                                                styles.categoryText,
                                                selectedCategory === cat.value && styles.categoryTextSelected
                                            ]}
                                        >
                                            {cat.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            {/* Message Input */}
                            <View style={styles.inputSection}>
                                <Text style={styles.inputLabel}>Additional Details (Optional)</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Tell us what's on your mind..."
                                    placeholderTextColor="#A1A1A1"
                                    multiline
                                    value={message}
                                    onChangeText={setMessage}
                                />
                            </View>

                            {/* Submit Button */}
                            <Pressable
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                                style={({ pressed }) => [
                                    styles.submitButton,
                                    pressed && styles.submitButtonPressed,
                                    isSubmitting && { opacity: 0.5 }
                                ]}
                            >
                                <View style={styles.buttonInner}>
                                    {isSubmitting ? (
                                        <ActivityIndicator color="white" style={{ marginRight: 12 }} />
                                    ) : (
                                        <LucideCheck size={20} color="white" style={{ marginRight: 8 }} strokeWidth={3} />
                                    )}
                                    <Text style={styles.submitButtonText}>Submit</Text>
                                </View>
                            </Pressable>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    keyboardView: {
        width: '100%',
    },
    modalContent: {
        backgroundColor: '#f2f2f2',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 64,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 44,
        height: 44,
        backgroundColor: 'rgba(48, 123, 117, 0.1)',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    titleText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        letterSpacing: -0.5,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    subtitleText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#307b75',
        marginBottom: 20,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 28,
        gap: 12,
        justifyContent: 'space-between',
    },
    categoryItem: {
        width: (SCREEN_WIDTH - 48 - 24) / 3, // 3 column grid with gaps
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    categoryItemSelected: {
        backgroundColor: 'rgba(48, 123, 117, 0.05)',
        borderColor: '#307b75',
    },
    categoryIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    categoryText: {
        fontWeight: '700',
        fontSize: 12,
        color: '#1A1A1A',
        textAlign: 'center',
    },
    categoryTextSelected: {
        color: '#307b75',
    },
    inputSection: {
        marginBottom: 32,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 12,
        marginLeft: 4,
    },
    textInput: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 24,
        fontSize: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(0,0,0,0.05)',
        height: 140,
        color: '#1A1A1A',
        textAlignVertical: 'top',
        fontWeight: '500',
    },
    submitButton: {
        backgroundColor: '#307b75',
        width: '100%',
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#307b75',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    submitButtonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    buttonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
});


