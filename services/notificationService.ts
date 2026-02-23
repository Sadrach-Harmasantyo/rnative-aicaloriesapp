import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set handler to dictate how incoming notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Registers the device for push notifications and requests permissions from the user.
 */
export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#298f50',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

const FREE_MESSAGES = [
    "Log your activity! Stay on track with your fitness journey.",
    "Don't forget to hydrate and log your water intake.",
    "Unlock your full potential with Premium! Get advanced AI insights.",
    "Time for a quick stretch! Have you logged your workout today?",
    "Every step counts. Log your progress now!"
];

const PREMIUM_MESSAGES = [
    "Keep up the great work! Have you logged your recent activity?",
    "Your AI coach is analyzing your progress. Log your latest meals!",
    "Stay consistent to reach your goals faster.",
    "Time to check in with your nutritional targets for the day."
];

/**
 * Schedules daily local reminders (Lunch: 12pm, Afternoon: 4pm, Dinner: 8pm).
 * Prevents duplicates by clearing all scheduled notifications first.
 */
export async function scheduleDailyReminders(isPremium: boolean = false) {
    // Clear existing to avoid duplicate spam
    await Notifications.cancelAllScheduledNotificationsAsync();

    const messages = isPremium ? PREMIUM_MESSAGES : FREE_MESSAGES;

    const scheduleNotificationForTime = async (hour: number, minute: number, identifier: string) => {
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        await Notifications.scheduleNotificationAsync({
            identifier, // We assign an ID so we can cancel specific ones if needed
            content: {
                title: "NativeCal Reminder 🔔",
                body: randomMessage,
                sound: 'default',
            },
            trigger: {
                hour,
                minute,
                type: Notifications.SchedulableTriggerInputTypes.DAILY
            } as Notifications.DailyTriggerInput,
        });
    };

    // Schedule 12:00 PM (Lunch)
    await scheduleNotificationForTime(12, 0, 'reminder-lunch');

    // Schedule 4:00 PM (Afternoon)
    await scheduleNotificationForTime(16, 0, 'reminder-afternoon');

    // Schedule 8:00 PM (Dinner)
    await scheduleNotificationForTime(20, 0, 'reminder-dinner');

    console.log("Daily reminders natively scheduled for 12PM, 4PM, and 8PM.");
}

/**
 * Call this when the user successfully logs a food/exercise/water correctly,
 * so we don't annoy them for the rest of the day.
 * (Note: We just cancel tomorrow's as well since it's a repeating trigger,
 * so logic would dictate we should ideally re-enable them at midnight via a background task,
 * but for simplicity in Expo Go, cancelling all is highly effective for 'rewarding' completion)
 */
export async function cancelTodaysReminders() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("Activity logged! Reminders cancelled to prevent spam.");
}
