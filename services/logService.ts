import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export interface ActivityItem {
    id: string; // unique string or timestamp
    timestamp: number;
    title: string;
    calories?: number;
    water?: number; // glasses
    type?: "food" | "exercise";
    duration?: number;
    intensity?: string;
    protein?: number;
    carbs?: number;
    fat?: number;
    servingInfo?: string;
}

export interface DailyLog {
    caloriesConsumed: number;
    caloriesBurned: number;
    proteinConsumed: number;
    carbsConsumed: number;
    fatConsumed: number;
    waterConsumed: number; // in glasses
    activities: ActivityItem[];
}

const DEFAULT_LOG: DailyLog = {
    caloriesConsumed: 0,
    caloriesBurned: 0,
    proteinConsumed: 0,
    carbsConsumed: 0,
    fatConsumed: 0,
    waterConsumed: 0,
    activities: [],
};

export const getDailyLog = async (userId: string, date: string): Promise<DailyLog> => {
    try {
        const logRef = doc(db, "users", userId, "dailyLogs", date);
        const logSnap = await getDoc(logRef);

        if (logSnap.exists()) {
            return logSnap.data() as DailyLog;
        }

        // If no log exists for this date, return a default empty log
        return DEFAULT_LOG;
    } catch (error) {
        console.error("Error fetching daily log:", error);
        return DEFAULT_LOG;
    }
};

export const updateDailyLog = async (
    userId: string,
    date: string,
    updates: Partial<DailyLog>,
    newActivity?: ActivityItem // Optional new single activity to append
): Promise<boolean> => {
    try {
        const logRef = doc(db, "users", userId, "dailyLogs", date);
        const logSnap = await getDoc(logRef);

        let currentLog = DEFAULT_LOG;
        if (logSnap.exists()) {
            currentLog = logSnap.data() as DailyLog;
        }

        // Handle backwards compatibility for users who don't have the activities array yet
        const currentActivities = currentLog.activities || [];
        const updatedActivities = newActivity
            ? [...currentActivities, newActivity]
            : currentActivities;

        // Combine existing with updates, adding them together (or setting directly depending on use case)
        // Usually, when adding a log, we *add* to the consumed amount.
        const newLog: DailyLog = {
            caloriesConsumed: currentLog.caloriesConsumed + (updates.caloriesConsumed || 0),
            caloriesBurned: (currentLog.caloriesBurned || 0) + (updates.caloriesBurned || 0),
            proteinConsumed: currentLog.proteinConsumed + (updates.proteinConsumed || 0),
            carbsConsumed: currentLog.carbsConsumed + (updates.carbsConsumed || 0),
            fatConsumed: currentLog.fatConsumed + (updates.fatConsumed || 0),
            waterConsumed: currentLog.waterConsumed + (updates.waterConsumed || 0),
            activities: updatedActivities,
        };

        await setDoc(logRef, newLog, { merge: true });
        console.log(`Daily log updated for ${date}`);
        return true;
    } catch (error) {
        console.error("Error updating daily log:", error);
        return false;
    }
};
