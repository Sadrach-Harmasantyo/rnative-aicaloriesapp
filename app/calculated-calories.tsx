import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { updateDailyLog } from "../services/logService";
import { cancelTodaysReminders } from "../services/notificationService";

export default function CalculatedCalories() {
    const router = useRouter();
    const { userId } = useAuth();
    const { cals, name, duration, intensity } = useLocalSearchParams<{ cals: string, name: string, duration: string, intensity: string }>();

    const [loading, setLoading] = useState(false);

    const handleLog = async () => {
        if (!userId) return;

        const parsedCalories = parseInt(cals || '0');
        if (parsedCalories <= 0) return;

        setLoading(true);

        const dateKey = format(new Date(), "yyyy-MM-dd");

        const newActivity = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            title: `${name || 'Exercise'} Session (${duration || '0'}m)`,
            calories: parsedCalories,
            type: "exercise" as const,
            duration: parseInt(duration || '0'),
            intensity: intensity || 'Medium'
        };

        const updates = {
            caloriesBurned: parsedCalories,
        };

        await updateDailyLog(userId, dateKey, updates, newActivity);

        await cancelTodaysReminders(); // Re-ward the user by silencing today's alerts

        setLoading(false);
        router.push('/(tabs)');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Details</Text>
            </View>

            {/* Main Content */}
            <View style={styles.container}>

                <View style={styles.iconWrapper}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="flame" size={80} color={Colors.primary} style={{ marginLeft: 4 }} />
                    </View>
                </View>

                <Text style={styles.title}>Your Workout Burned</Text>

                <View style={styles.calsContainer}>
                    <Text style={styles.calsText}>{cals || '0'}</Text>
                    <Text style={styles.unitText}>Cals</Text>
                </View>

                <Text style={styles.subtitle}>
                    Based on your profile data, active duration ({duration}m), and selected intensity for {name}.
                </Text>

            </View>

            {/* Footer Button */}
            <View style={styles.footerContainer}>
                <TouchableOpacity
                    style={[styles.continueButton, loading && styles.disabledButton]}
                    onPress={handleLog}
                    disabled={loading}
                >
                    <Text style={styles.continueButtonText}>
                        {loading ? "Saving to Log..." : "Log Activity"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    backButton: {
        marginRight: 16,
        padding: 4,
        marginLeft: -4,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.text,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
        marginTop: -60,
    },
    iconWrapper: {
        marginBottom: 24,
    },
    iconCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textLight,
        marginBottom: 8,
        textAlign: 'center',
    },
    calsContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginBottom: 20,
    },
    calsText: {
        fontSize: 80,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'center',
    },
    unitText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.textLight,
        marginLeft: 8,
    },
    subtitle: {
        fontSize: 15,
        color: Colors.textLight,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 24,
    },
    footerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        paddingTop: 12,
        backgroundColor: Colors.background,
        borderTopWidth: 1,
        borderTopColor: Colors.border + '50',
    },
    continueButton: {
        backgroundColor: Colors.primary,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: Colors.textLight,
        opacity: 0.5,
    },
    continueButtonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
