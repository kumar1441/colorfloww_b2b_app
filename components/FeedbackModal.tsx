import React, { useState } from 'react';
import { View, Text, Pressable, Modal, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import { LucideMessageSquare, LucideX, LucideCheck } from 'lucide-react-native';
import { FeedbackService, FeedbackCategory } from '../services/feedback';

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
                                        <LucideMessageSquare size={28} color="#000000" strokeWidth={2.5} />
                                    </View>
                                    <Text style={styles.titleText}>Feedback</Text>
                                </View>
                                <Pressable
                                    onPress={handleClose}
                                    style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.5 }]}
                                >
                                    <LucideX size={32} color="#000000" strokeWidth={3} />
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
                                            pressed && { opacity: 0.7 }
                                        ]}
                                    >
                                        <Text style={styles.categoryIcon}>{cat.icon}</Text>
                                        <Text style={[
                                            styles.categoryText,
                                            selectedCategory === cat.value && styles.categoryTextSelected
                                        ]}>
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
                                    placeholderTextColor="#777777"
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
                                    pressed && { backgroundColor: '#F0F0F0' },
                                    isSubmitting && { opacity: 0.5 }
                                ]}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#000000" style={{ marginRight: 12 }} />
                                ) : (
                                    <LucideCheck size={26} color="#000000" style={{ marginRight: 12 }} strokeWidth={4} />
                                )}
                                <Text style={styles.submitButtonText}>Submit Feedback</Text>
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
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    keyboardView: {
        width: '100%',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 24,
        paddingTop: 36,
        paddingBottom: 64,
        borderWidth: 3,
        borderColor: '#000000',
        borderBottomWidth: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 56,
        height: 56,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 3,
        borderColor: '#000000',
    },
    titleText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#000000',
        letterSpacing: -0.5,
    },
    closeButton: {
        padding: 8,
    },
    subtitleText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#000000',
        marginBottom: 24,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 32,
        gap: 12,
    },
    categoryItem: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 2.5,
        borderColor: '#000000',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginBottom: 4,
    },
    categoryItemSelected: {
        backgroundColor: '#000000',
    },
    categoryIcon: {
        marginRight: 10,
        fontSize: 20,
    },
    categoryText: {
        fontWeight: '900',
        fontSize: 15,
        color: '#000000',
    },
    categoryTextSelected: {
        color: '#FFFFFF',
    },
    inputSection: {
        marginBottom: 40,
    },
    inputLabel: {
        fontSize: 18,
        fontWeight: '900',
        color: '#000000',
        marginBottom: 14,
    },
    textInput: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 24,
        fontSize: 17,
        borderWidth: 2.5,
        borderColor: '#000000',
        height: 160,
        color: '#000000',
        textAlignVertical: 'top',
        fontWeight: '700',
    },
    submitButton: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        paddingVertical: 24,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#000000',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 0, // Hard shadow for gorgeous brutalist look
        elevation: 10,
    },
    submitButtonText: {
        color: '#000000',
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
});
