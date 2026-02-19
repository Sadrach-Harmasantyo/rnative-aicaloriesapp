import { ClerkLoaded, ClerkProvider, useUser } from "@clerk/clerk-expo";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { saveUserToFirestore } from "../services/userService";
import { tokenCache } from "../utils/tokenCache";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env",
  );
}


function InitialLayout() {
  const { isLoaded, isSignedIn, user } = useUser();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (isSignedIn && inAuthGroup) {
      router.replace("/");
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    }
  }, [isSignedIn, isLoaded]);

  useEffect(() => {
    if (isSignedIn && user) {
      // Sync user to firestore on login/load
      saveUserToFirestore({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress!,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.imageUrl,
      });
    }
  }, [isSignedIn, user]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <InitialLayout />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
