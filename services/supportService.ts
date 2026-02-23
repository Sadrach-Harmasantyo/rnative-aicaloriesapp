import { addDoc, arrayRemove, arrayUnion, collection, doc, getDocs, increment, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export interface FeatureRequest {
    id?: string;
    title: string;
    description: string;
    userId: string;
    userFullName: string;
    upvotes: number;
    upvotedBy: string[]; // Array of user IDs to prevent double voting
    createdAt: number;
}

const COLLECTION_NAME = "featureRequests";

/**
 * Submit a new feature request from a user
 */
export const submitFeatureRequest = async (request: Omit<FeatureRequest, 'id'>): Promise<string | null> => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), request);
        console.log("Feature request submitted with ID: ", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error submitting feature request:", error);
        return null;
    }
};

/**
 * Get all feature requests ordered by highest upvotes
 */
export const getFeatureRequests = async (): Promise<FeatureRequest[]> => {
    try {
        const q = query(collection(db, COLLECTION_NAME), orderBy("upvotes", "desc"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const features: FeatureRequest[] = [];
        querySnapshot.forEach((docSnap) => {
            features.push({ id: docSnap.id, ...docSnap.data() } as FeatureRequest);
        });

        return features;
    } catch (error) {
        console.error("Error fetching feature requests:", error);
        return [];
    }
};

/**
 * Toggle an upvote for a specific feature request by the current user
 * Uses atomic updates to safely increment/decrement across concurrent users
 */
export const toggleUpvote = async (requestId: string, userId: string, isCurrentlyUpvoted: boolean): Promise<boolean> => {
    try {
        const reqRef = doc(db, COLLECTION_NAME, requestId);

        if (isCurrentlyUpvoted) {
            // Remove Upvote
            await updateDoc(reqRef, {
                upvotes: increment(-1),
                upvotedBy: arrayRemove(userId)
            });
            console.log(`User ${userId} removed vote from ${requestId}`);
        } else {
            // Add Upvote
            await updateDoc(reqRef, {
                upvotes: increment(1),
                upvotedBy: arrayUnion(userId)
            });
            console.log(`User ${userId} upvoted ${requestId}`);
        }

        return true;
    } catch (error) {
        console.error("Error toggling upvote:", error);
        return false;
    }
};
