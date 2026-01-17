import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideUser, LucideSettings, LucideTrophy, LucideLogOut, LucideChevronRight, LucideFlame } from 'lucide-react-native';
import { GamificationService } from '../../services/gamification';
import StreakCard from '../../components/StreakCard';
import StreakShareModal from '../../components/StreakShareModal';

/**
 * ProfileScreen: Displays user info and gamification stats (streaks, awards).
 */
export default function ProfileScreen() {
    const router = useRouter();
    const [streak, setStreak] = useState(0);
    const [isShareModalVisible, setShareModalVisible] = useState(false);

    useEffect(() => {
        GamificationService.getStreak().then(setStreak);
    }, []);

    const handleLogout = () => {
        router.replace('/');
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.titleRow}>
                        <LucideUser size={32} color="#697D59" strokeWidth={1.5} />
                        <Text style={styles.title}>Profile</Text>
                    </View>
                    <TouchableOpacity style={styles.settingsBtn}>
                        <LucideSettings size={22} color="#8A8A8A" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* User Info */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <LucideUser size={48} color="#697D59" />
                    </View>
                    <Text style={styles.userName}>Nail Enthusiast</Text>
                    <Text style={styles.userEmail}>nail.lover@example.com</Text>
                </View>

                {/* Streak Card */}
                <StreakCard 
                    streak={streak} 
                    onShare={() => setShareModalVisible(true)} 
                />

                {/* Share Modal */}
                <StreakShareModal 
                    visible={isShareModalVisible}
                    streak={streak}
                    onClose={() => setShareModalVisible(false)}
                />

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <LucideFlame size={20} color="#F97316" style={{ marginBottom: 4 }} />
                        <Text style={styles.statValue}>{streak}</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                    </View>
                    <View style={styles.statCard}>
                        <LucideTrophy size={20} color="#FBBF24" style={{ marginBottom: 4 }} />
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Looks</Text>
                    </View>
                    <View style={styles.statCard}>
                        <LucideTrophy size={20} color="#A78BFA" style={{ marginBottom: 4 }} />
                        <Text style={styles.statValue}>4</Text>
                        <Text style={styles.statLabel}>Awards</Text>
                    </View>
                </View>

                {/* Menu Sections */}
                <View style={styles.menu}>
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: '#F0F9FF' }]}>
                                <LucideTrophy size={18} color="#0EA5E9" />
                            </View>
                            <Text style={styles.menuText}>Achievements</Text>
                        </View>
                        <LucideChevronRight size={20} color="#E8E5E1" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        style={[styles.menuItem, styles.logoutItem]}
                    >
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: '#FEF2F2' }]}>
                                <LucideLogOut size={18} color="#EF4444" />
                            </View>
                            <Text style={[styles.menuText, styles.logoutText]}>Log Out</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F7F4',
    },
    header: {
        backgroundColor: 'rgba(249, 247, 244, 0.8)',
    },
    headerContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 28,
        color: '#2D2D2D',
        fontWeight: '700',
    },
    settingsBtn: {
        padding: 4,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 120,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2D2D2D',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#8A8A8A',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 20,
        padding: 16,
        marginHorizontal: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#697D59',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#8A8A8A',
        fontWeight: '600',
    },
    menu: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F9F7F4',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D2D2D',
    },
    logoutItem: {
        borderBottomWidth: 0,
    },
    logoutText: {
        color: '#EF4444',
    }
});
