import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * NotificationService: Handles daily reminders for the user.
 */
export const NotificationService = {
    /**
     * Request permissions and schedule daily reminder.
     */
    async setupDailyReminders() {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') return;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#697D59',
            });
        }

        // Cancel existing and schedule new one for 10 AM every day
        await Notifications.cancelAllScheduledNotificationsAsync();

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "💅 Ready for a fresh look?",
                body: "Don't break your streak! Try on a new nail color today.",
                data: { url: '/(main)/community' },
                ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
            },
            trigger: {
                type: 'calendar',
                hour: 10,
                minute: 0,
                repeats: true,
            } as Notifications.CalendarTriggerInput,
        });
    }
};
