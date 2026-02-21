import { ClerkLoaded, ClerkProvider, useUser } from "@clerk/clerk-expo";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Colors } from "../constants/Colors";
import { getUserData, saveUserToFirestore } from "../services/userService";
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
    const inOnboardingGroup = segments[0] === "onboarding";

    if (isSignedIn && !user) return; // Wait for user data

    const checkOnboarding = async () => {
      if (isSignedIn && user) {
        console.log("Checking onboarding for user:", user.id);
        const storageKey = `onboardingCompleted_${user.id}`;

        try {
          // Check local storage first for speed
          const localOnboarding = await AsyncStorage.getItem(storageKey);
          console.log("Local onboarding status:", localOnboarding);

          if (localOnboarding === 'true') {
            if (inAuthGroup || inOnboardingGroup) {
              console.log("Redirecting to Home from Auth/Onboarding (Local=true)");
              router.replace("/(tabs)");
            }
            return;
          }

          // If not in local, check firestore (source of truth)
          console.log("Fetching user data from Firestore...");
          const userData = await getUserData(user.id);
          console.log("Firestore onboarding status:", userData?.onboardingCompleted);

          if (userData?.onboardingCompleted) {
            await AsyncStorage.setItem(storageKey, 'true');
            if (inAuthGroup || inOnboardingGroup) {
              console.log("Redirecting to Home from Auth/Onboarding (Firestore=true)");
              router.replace("/(tabs)");
            }
          } else {
            console.log("Onboarding incomplete. Current segment:", segments[0]);
            if (!inOnboardingGroup) {
              console.log("Redirecting to /onboarding");
              router.replace("/onboarding");
            }
          }
        } catch (e) {
          console.error("Error checking onboarding status", e);
        }
      } else if (!isSignedIn) {
        if (!inAuthGroup) router.replace("/(auth)/sign-in");
      }
    };

    checkOnboarding();
  }, [isSignedIn, isLoaded, user, segments]);

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

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen
        name="add-log"
        options={{
          presentation: "modal",
          title: "Add Activity",
          headerShown: false // Custom UI inside the modal
        }}
      />
      <Stack.Screen name="log-exercise" options={{ headerShown: false }} />
      <Stack.Screen name="exercise-detail" options={{ headerShown: false }} />
      <Stack.Screen name="manual-exercise" options={{ headerShown: false }} />
      <Stack.Screen name="calculated-calories" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <StatusBar backgroundColor={Colors.primary} style="light" />
        <InitialLayout />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
