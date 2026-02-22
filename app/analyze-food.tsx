import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { analyzeFoodImage } from "../services/aiService";

export default function AnalyzeFoodScreen() {
    const router = useRouter();
    const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

    // State logic
    const [step1Done, setStep1Done] = useState(false);
    const [step2Done, setStep2Done] = useState(false);
    const [step3Done, setStep3Done] = useState(false);

    // Result payload
    const [resultData, setResultData] = useState<any>(null);

    useEffect(() => {
        let isMounted = true;

        const processImage = async () => {
            if (!imageUri) return;

            try {
                // Step 1: Analyzing Food (Convert to Base64)
                setStep1Done(false);
                setStep2Done(false);
                setStep3Done(false);

                // Read local file as base64 string
                const base64Image = await FileSystem.readAsStringAsync(imageUri, {
                    encoding: 'base64',
                });

                if (isMounted) setStep1Done(true); // Base64 encoding complete

                // Step 2: Getting nutrition data (Fire Gemini API)
                const data = await analyzeFoodImage(base64Image);

                if (isMounted) {
                    setStep2Done(true); // AI response complete
                    setResultData(data); // Save JSON payload

                    // Step 3: Final result rendering
                    setTimeout(() => {
                        if (isMounted) setStep3Done(true);
                    }, 500); // Tiny pause for visual flair
                }

            } catch (error: any) {
                console.error("/// GEMINI API CRASHED ///");
                console.error(error);
                console.error(error?.message);

                if (isMounted) {
                    Alert.alert(
                        "Analysis Failed",
                        `We couldn't process this image. Error: ${error?.message || 'Unknown error. Check terminal.'}`,
                        [{ text: "OK", onPress: () => router.back() }]
                    );
                }
            }
        };

        processImage();

        return () => {
            isMounted = false;
        };
    }, [imageUri]);

    const LoadingRow = ({ label, isDone }: { label: string, isDone: boolean }) => (
        <View style={styles.loadingRow}>
            {isDone ? (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
            ) : (
                <ActivityIndicator size="small" color={Colors.primary} />
            )}
            <Text style={[styles.loadingText, isDone ? { color: Colors.text, fontWeight: 'bold' } : {}]}>
                {label}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Analyzing Food</Text>
                <View style={{ width: 40 }} />
            </View>
            <View style={styles.content}>
                {imageUri ? (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: imageUri }} style={styles.image} />
                    </View>
                ) : (
                    <View style={[styles.imageContainer, { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="image-outline" size={48} color={Colors.textLight} />
                    </View>
                )}

                <View style={styles.stepsContainer}>
                    <LoadingRow label="Analyzing food..." isDone={step1Done} />
                    <LoadingRow label="Getting nutrition data..." isDone={step2Done} />
                    <LoadingRow label="Final result" isDone={step3Done} />
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.continueButton, !step3Done && styles.disabledButton]}
                    disabled={!step3Done}
                    onPress={() => {
                        if (resultData) {
                            router.push({
                                pathname: '/log-food',
                                params: {
                                    foodName: resultData.foodName || 'Unknown Food',
                                    calories: resultData.calories?.toString() || '0',
                                    protein: resultData.protein?.toString() || '0',
                                    carbs: resultData.carbs?.toString() || '0',
                                    fat: resultData.fat?.toString() || '0',
                                    servingSize: resultData.servingSize || '1 serving',
                                    isScanned: 'true'
                                }
                            });
                        }
                    }}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        backgroundColor: '#fff',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    stepsContainer: {
        width: '100%',
        backgroundColor: '#f9fafb', // Colors.cardContext replacement if undefined
        padding: 24,
        borderRadius: 20,
        gap: 20,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        color: Colors.textLight,
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
    },
    continueButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: Colors.border,
        opacity: 0.7,
    },
    continueButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    }
});
