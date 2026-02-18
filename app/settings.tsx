import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideChevronLeft, LucideEdit3, LucideShield, LucideChevronRight, LucideInfo, LucideSettings } from 'lucide-react-native';

export default function SettingsScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-brand-peach dark:bg-brand-peach-dark">
            <SafeAreaView edges={['top']} className="bg-brand-peach/80 dark:bg-brand-peach-dark/80">
                <View className="px-6 py-4 flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 rounded-full bg-white dark:bg-brand-gray/80 items-center justify-center shadow-sm">
                        <LucideChevronLeft size={24} color="#307b75" />
                    </TouchableOpacity>
                    <View className="flex-row items-center gap-x-2">
                        <LucideSettings size={28} color="#307b75" strokeWidth={1.5} />
                        <Text className="text-2xl font-bold text-brand-gray dark:text-brand-gray-light">Settings</Text>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
                <Text className="text-lg font-bold text-brand-gray dark:text-brand-gray-light mb-4 px-2">Account</Text>

                <View className="bg-white/60 dark:bg-brand-gray/40 rounded-[32px] overflow-hidden border border-brand-gray-medium/10 dark:border-brand-gray-medium/5 shadow-sm mb-8">
                    <TouchableOpacity
                        className="flex-row items-center justify-between p-5"
                        onPress={() => router.push('/edit-profile')}
                    >
                        <View className="flex-row items-center gap-x-4">
                            <View className="w-10 h-10 rounded-2xl bg-brand-teal/10 items-center justify-center">
                                <LucideEdit3 size={20} color="#307b75" />
                            </View>
                            <Text className="text-base font-bold text-brand-gray dark:text-brand-gray-light">Edit Profile</Text>
                        </View>
                        <LucideChevronRight size={20} color="#A1A1A1" />
                    </TouchableOpacity>
                </View>

                <Text className="text-lg font-bold text-brand-gray dark:text-brand-gray-light mb-4 px-2">About & Legal</Text>

                <View className="bg-white/60 dark:bg-brand-gray/40 rounded-[32px] overflow-hidden border border-brand-gray-medium/10 dark:border-brand-gray-medium/5 shadow-sm">
                    <TouchableOpacity
                        onPress={() => Linking.openURL('https://colorfloww.com/privacy')}
                        className="flex-row items-center justify-between p-5 border-b border-brand-peach dark:border-brand-peach-dark/20"
                    >
                        <View className="flex-row items-center gap-x-4">
                            <View className="w-10 h-10 rounded-2xl bg-brand-teal/10 items-center justify-center">
                                <LucideShield size={20} color="#307b75" />
                            </View>
                            <Text className="text-base font-bold text-brand-gray dark:text-brand-gray-light">Privacy Policy</Text>
                        </View>
                        <LucideChevronRight size={20} color="#A1A1A1" />
                    </TouchableOpacity>

                    <View className="p-5 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-x-4">
                            <View className="w-10 h-10 rounded-2xl bg-brand-teal/10 items-center justify-center">
                                <LucideInfo size={20} color="#307b75" />
                            </View>
                            <Text className="text-base font-bold text-brand-gray dark:text-brand-gray-light">Version</Text>
                        </View>
                        <Text className="text-sm font-bold text-brand-gray-medium">1.1.0</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
