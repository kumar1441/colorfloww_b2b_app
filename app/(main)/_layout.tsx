import React from 'react';
import { Tabs } from 'expo-router';
import { LucideLayoutGrid, LucidePalette, LucideHistory, LucideUser } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet } from 'react-native';

/**
 * Main Layout: Provides the bottom tab navigation.
 * Uses BlurView for a premium glassmorphism effect on iOS.
 */
export default function MainLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#697D59',
                tabBarInactiveTintColor: '#8A8A8A',
                tabBarStyle: styles.tabBar,
                tabBarBackground: () => (
                    Platform.OS === 'ios' ? (
                        <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="light" />
                    ) : null
                ),
            }}
        >
            <Tabs.Screen
                name="community"
                options={{
                    title: 'Community',
                    tabBarIcon: ({ color, size }) => <LucideLayoutGrid size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="custom"
                options={{
                    title: 'Mix',
                    tabBarIcon: ({ color, size }) => <LucidePalette size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color, size }) => <LucideHistory size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <LucideUser size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        borderTopWidth: 0,
        elevation: 0,
        height: Platform.OS === 'ios' ? 88 : 64,
        paddingBottom: Platform.OS === 'ios' ? 32 : 12,
        backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#fff',
    }
});
