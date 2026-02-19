
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export interface UserData {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    profileImage?: string | null;
    createdAt?: number;
}


export const saveUserToFirestore = async (user: UserData) => {
    try {
        const userRef = doc(db, "users", user.id);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            // User exists, update fields but don't overwrite createdAt
            await setDoc(userRef, {
                email: user.email,
                firstName: user.firstName || null,
                lastName: user.lastName || null,
                profileImage: user.profileImage || null,
            }, { merge: true });
            console.log("User data updated in Firestore");
        } else {
            // User doesn't exist, create new
            await setDoc(userRef, {
                ...user,
                createdAt: Date.now(),
            });
            console.log("New user created in Firestore");
        }
    } catch (error) {
        console.error("Error saving user to Firestore:", error);
    }
};
