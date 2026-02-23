import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export interface UserData {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    profileImage?: string | null;
    createdAt?: number;
    // Onboarding Data
    gender?: string;
    goal?: string;
    workoutFrequency?: string;
    birthDate?: { day: string; month: string; year: string };
    height?: number; // stored in cm or unit agnostic
    weight?: number; // stored in kg
    weightHistory?: { weight: number; date: number }[]; // historical log
    onboardingCompleted?: boolean;
    fitnessPlan?: {
        dailyCalories: number;
        macros: {
            protein: number;
            carbs: number;
            fats: number;
        };
        waterIntake: string;
        fitnessTips: string[];
        workoutPlan: string;
    };
    aiInsights?: {
        generatedAt: number;
        motivation: string;
        nutritionTip: string;
        activityRecommendation: string;
        overallScore: number; // 1-100 score based on today's logged progress
    };
}

export const saveUserToFirestore = async (user: UserData) => {
    try {
        const userRef = doc(db, "users", user.id);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            // User exists, update fields but don't overwrite createdAt
            await setDoc(userRef, {
                ...user, // Spread new fields to update
            }, { merge: true });
            console.log("User data updated in Firestore");
        } else {
            // User doesn't exist, create new
            await setDoc(userRef, {
                ...user,
                createdAt: Date.now(),
                onboardingCompleted: false, // Default to false for new users
            });
            console.log("New user created in Firestore");
        }
    } catch (error) {
        console.error("Error saving user to Firestore:", error);
    }
};

export const getUserData = async (userId: string): Promise<UserData | null> => {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data() as UserData;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
};

export const updateFitnessGoals = async (
    userId: string,
    newGoals: { dailyCalories: number; protein: number; carbs: number; fats: number }
): Promise<boolean> => {
    try {
        const userRef = doc(db, "users", userId);

        // We only want to update the specific fields inside fitnessPlan without overwriting other things
        await setDoc(userRef, {
            fitnessPlan: {
                dailyCalories: newGoals.dailyCalories,
                macros: {
                    protein: newGoals.protein,
                    carbs: newGoals.carbs,
                    fats: newGoals.fats
                }
            }
        }, { merge: true });

        console.log("Fitness goals updated in Firestore");
        return true;
    } catch (error) {
        console.error("Error updating fitness goals:", error);
        return false;
    }
};

export const updateWaterGoal = async (
    userId: string,
    newWaterGoalMl: number
): Promise<boolean> => {
    try {
        const userRef = doc(db, "users", userId);

        await setDoc(userRef, {
            fitnessPlan: {
                waterIntake: `${newWaterGoalMl}ml`
            }
        }, { merge: true });

        console.log("Water goal updated in Firestore");
        return true;
    } catch (error) {
        console.error("Error updating water goal:", error);
        return false;
    }
};

export const updateUserWeight = async (userId: string, newWeight: number): Promise<boolean> => {
    try {
        const userRef = doc(db, "users", userId);

        await updateDoc(userRef, {
            weight: newWeight,
            weightHistory: arrayUnion({
                weight: newWeight,
                date: Date.now()
            })
        });

        console.log("Weight updated and pushed to history in Firestore");
        return true;
    } catch (error) {
        console.error("Error updating user weight:", error);
        return false;
    }
};

export const updateAiInsights = async (
    userId: string,
    insights: {
        generatedAt: number;
        motivation: string;
        nutritionTip: string;
        activityRecommendation: string;
        overallScore: number;
    }
): Promise<boolean> => {
    try {
        const userRef = doc(db, "users", userId);

        await setDoc(userRef, {
            aiInsights: insights
        }, { merge: true });

        console.log("AI Insights cached safely in Firestore");
        return true;
    } catch (error) {
        console.error("Error updating AI insights:", error);
        return false;
    }
};
