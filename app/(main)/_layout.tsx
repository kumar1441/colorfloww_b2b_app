import React from 'react';
import { Tabs } from 'expo-router';
import { LucideHome, LucidePalette, LucideHistory, LucideUser, LucideSparkles, LucideTrophy } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MainLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#307b75',
                tabBarInactiveTintColor: '#8A8A8A',
                tabBarLabelStyle: {
                    fontWeight: '700',
                    fontSize: 10,
                },
                tabBarStyle: [
                    styles.tabBar,
                    {
                        height: 64 + insets.bottom,
                        paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
                    }
                ],
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
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <LucideHome size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="spotlight"
                options={{
                    title: 'Spotlight',
                    tabBarIcon: ({ color, size }) => <LucideSparkles size={size} color={color} />,
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
                name="leaderboard"
                options={{
                    title: 'Ranks',
                    tabBarIcon: ({ color, size }) => <LucideTrophy size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    href: null, // Move history to profile or hide from tabs to make room
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Me',
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
