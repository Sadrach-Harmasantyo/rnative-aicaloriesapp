import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";
import { generateFitnessPlan } from "../../services/aiService";
import { saveUserToFirestore, UserData } from "../../services/userService";

const LOADING_STEPS = [
    "Analyzing your profile...",
    "Calculating metabolic rate...",
    "Designing your workout plan...",
    "Finalizing your nutrition guide..."
];

export default function GeneratingScreen() {
    const router = useRouter();
    const { user } = useUser();
    const params = useLocalSearchParams();

    const [currentStep, setCurrentStep] = useState(0);
    const [aiData, setAiData] = useState<any>(null);
    const [isFinished, setIsFinished] = useState(false);

    // Simulate progress for the first few steps
    useEffect(() => {
        if (currentStep < LOADING_STEPS.length - 1) {
            const timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 2000); // 2 seconds per step
            return () => clearTimeout(timer);
        }
    }, [currentStep]);

    // Trigger AI Generation in parallel
    useEffect(() => {
        if (!user || !params) return;

        const generatePlan = async () => {
            try {
                const userData: UserData = {
                    id: user.id,
                    email: user.primaryEmailAddress?.emailAddress!,
                    gender: params.gender as string,
                    goal: params.goal as string,
                    workoutFrequency: params.workoutFrequency as string,
                    birthDate: JSON.parse(params.birthDate as string),
                    height: parseFloat(params.height as string),
                    weight: parseFloat(params.weight as string),
                    onboardingCompleted: true,
                };

                const fitnessPlan = await generateFitnessPlan(userData);
                setAiData({ ...userData, fitnessPlan });
            } catch (error) {
                console.error("AI Generation Error:", error);
                Alert.alert("Error", "Failed to generate plan. Please try again.", [
                    { text: "Retry", onPress: () => router.back() }
                ]);
            }
        };

        generatePlan();
    }, [user, params]);

    // Watch for both AI Completion AND Animation Completion
    useEffect(() => {
        if (aiData && currentStep === LOADING_STEPS.length - 1 && !isFinished) {
            // Both done, finish up
            finishOnboarding();
        }
    }, [aiData, currentStep, isFinished]);

    const finishOnboarding = async () => {
        if (!aiData || !user) return;
        setIsFinished(true);

        // Slight delay to show the final checkmark
        setTimeout(async () => {
            try {
                // Save to Firestore
                await saveUserToFirestore(aiData);

                // Save to Local Storage
                await AsyncStorage.setItem('userData', JSON.stringify(aiData));
                await AsyncStorage.setItem(`onboardingCompleted_${user.id}`, 'true');

                // Navigate Home
                router.replace("/(tabs)");
            } catch (error) {
                console.error("Error saving data:", error);
            }
        }, 1000);
    };

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>Creating your plan</Text>

                <View style={styles.stepsContainer}>
                    {LOADING_STEPS.map((step, index) => {
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;

                        return (
                            <View key={index} style={styles.stepRow}>
                                <View style={styles.iconContainer}>
                                    {isCompleted ? (
                                        <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                                    ) : isActive ? (
                                        <ActivityIndicator size="small" color={Colors.primary} />
                                    ) : (
                                        <View style={styles.pendingCircle} />
                                    )}
                                </View>
                                <Text style={[
                                    styles.stepText,
                                    isCompleted ? styles.completedText : isActive ? styles.activeText : styles.pendingText
                                ]}>
                                    {step}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    contentContainer: {
        width: '100%',
        maxWidth: 320,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: 40,
    },
    stepsContainer: {
        gap: 20,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 24,
        alignItems: 'center',
    },
    pendingCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Colors.border,
    },
    stepText: {
        fontSize: 16,
        fontWeight: '500',
    },
    activeText: {
        color: Colors.text,
        fontWeight: 'bold',
    },
    completedText: {
        color: Colors.text,
        opacity: 0.8,
    },
    pendingText: {
        color: Colors.textLight,
    },
});
