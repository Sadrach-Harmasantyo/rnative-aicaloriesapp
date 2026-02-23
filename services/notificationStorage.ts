import { addDoc, collection, doc, getDocs, orderBy, query, updateDoc, where } from "firebase/firestore";
import { db } from "../config/firebase";

export interface AppNotification {
    id?: string;
    title: string;
    body: string;
    type: 'system' | 'admin';
    isRead: boolean;
    createdAt: number;
}

export interface AdminBroadcast {
    id?: string;
    title: string;
    body: string;
    target: 'all' | 'free' | 'premium';
    createdAt: number;
}

/**
 * Fetches the user's localized notification history ledger.
 */
export const getUserNotificationHistory = async (userId: string): Promise<AppNotification[]> => {
    try {
        const q = query(
            collection(db, "users", userId, "notificationsHistory"),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);

        const notifications: AppNotification[] = [];
        querySnapshot.forEach((docSnap) => {
            notifications.push({ id: docSnap.id, ...docSnap.data() } as AppNotification);
        });

        return notifications;
    } catch (error) {
        console.error("Error fetching notification history:", error);
        return [];
    }
};

/**
 * Marks a specific notification as 'read'.
 */
export const markNotificationAsRead = async (userId: string, notificationId: string): Promise<boolean> => {
    try {
        const notifRef = doc(db, "users", userId, "notificationsHistory", notificationId);
        await updateDoc(notifRef, {
            isRead: true
        });
        return true;
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return false;
    }
};

/**
 * System Hook: Adds a local system notification to the user's ledger (e.g., Streak achievements)
 */
export const addSystemNotification = async (userId: string, title: string, body: string): Promise<void> => {
    try {
        const notifRef = collection(db, "users", userId, "notificationsHistory");
        await addDoc(notifRef, {
            title,
            body,
            type: 'system',
            isRead: false,
            createdAt: Date.now()
        });
    } catch (error) {
        console.error("Error adding system notification:", error);
    }
};

/**
 * Fetch and sync Admin broadcasts.
 * Merges general broadcasts down into the specific user's local notification history to avoid
 * the user seeing the same global broadcast twice.
 */
export const syncAdminBroadcasts = async (userId: string, isPremium: boolean): Promise<void> => {
    try {
        // 1. Fetch recent admin broadcasts
        const adminQ = query(collection(db, "adminNotifications"), orderBy("createdAt", "desc"));
        const adminSnap = await getDocs(adminQ);

        // 2. Fetch user's current history to avoid duplicates
        const userQ = query(collection(db, "users", userId, "notificationsHistory"), where("type", "==", "admin"));
        const userSnap = await getDocs(userQ);

        const existingAdminIds = new Set();
        userSnap.forEach(docSnap => {
            // We use the admin document ID directly for tracking
            existingAdminIds.add(docSnap.data().adminBroadcastId);
        });

        const targetUserStatus = isPremium ? 'premium' : 'free';

        // 3. Sync missing broadcasts into the user's ledger
        const promises: Promise<any>[] = [];

        adminSnap.forEach((docSnap) => {
            const broadcast = { id: docSnap.id, ...docSnap.data() } as AdminBroadcast & { id: string };

            // Only add if we haven't seen it AND it targets our user tier
            if (!existingAdminIds.has(broadcast.id) && (broadcast.target === 'all' || broadcast.target === targetUserStatus)) {

                const notifRef = collection(db, "users", userId, "notificationsHistory");
                promises.push(
                    addDoc(notifRef, {
                        adminBroadcastId: broadcast.id, // track to prevent duplicates
                        title: broadcast.title,
                        body: broadcast.body,
                        type: 'admin',
                        isRead: false,
                        createdAt: broadcast.createdAt // Keep original broadcast time
                    })
                );
            }
        });

        await Promise.all(promises);
        if (promises.length > 0) {
            console.log(`Synced ${promises.length} new admin broadcasts to user ledger.`);
        }

    } catch (error) {
        console.error("Error syncing admin broadcasts:", error);
    }
};
