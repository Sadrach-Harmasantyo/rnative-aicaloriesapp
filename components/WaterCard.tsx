import { Colors } from "@/constants/Colors";
import { useAuth } from "@clerk/clerk-expo";
import { format } from "date-fns";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DailyLog, getDailyLog } from "../services/logService";
import { getUserData, UserData } from "../services/userService";

export function WaterCard({ selectedDate }: { selectedDate: Date }) {
    const { userId } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const dateStr = format(selectedDate, "yyyy-MM-dd");
            const [fetchedUser, fetchedLog] = await Promise.all([
                getUserData(userId),
                getDailyLog(userId, dateStr)
            ]);
            setUserData(fetchedUser);
            setDailyLog(fetchedLog);
        } catch (error) {
            console.error("Error fetching water data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedDate, userId]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [selectedDate, userId])
    );

    if (loading) {
        return (
            <View style={[styles.cardContainer, { minHeight: 180, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    // 1. Calculate the Goal in Glasses (Assume 1 Glass = 250ml)
    // The user goal might be stored as "3L" or just "3"
    const waterGoalRaw = userData?.fitnessPlan?.waterIntake || "2L";
    let waterGoalLiters = 2; // default
    if (waterGoalRaw.toLowerCase().includes('l')) {
        waterGoalLiters = parseFloat(waterGoalRaw.replace(/[^0-9.]/g, '')) || 2;
    } else {
        waterGoalLiters = parseFloat(waterGoalRaw) || 2;
    }

    const mlGoal = waterGoalLiters * 1000;
    const ML_PER_GLASS = 250;
    const totalGlassesGoal = Math.ceil(mlGoal / ML_PER_GLASS);

    // Only keep 1 row, maximum 9 glasses.
    const MAX_GLASSES_UI = 9;
    const uiGlassesGoal = Math.min(totalGlassesGoal, MAX_GLASSES_UI);

    // 2. Determine Consumed Glasses
    const consumedGlassesRaw = dailyLog?.waterConsumed || 0;

    // Scale consumed glasses for the UI if the actual goal is larger than 9 glasses
    let uiConsumedGlasses = consumedGlassesRaw;
    if (totalGlassesGoal > MAX_GLASSES_UI) {
        uiConsumedGlasses = (consumedGlassesRaw / totalGlassesGoal) * MAX_GLASSES_UI;
    }

    const fullGlassesCount = Math.floor(uiConsumedGlasses);
    const hasHalfGlass = (uiConsumedGlasses - fullGlassesCount) >= 0.5;

    // We never show more *filled* glasses than the UI allows drawn
    let fullToRender = Math.min(fullGlassesCount, uiGlassesGoal);
    let halfToRender = hasHalfGlass && fullToRender < uiGlassesGoal ? 1 : 0;
    let emptyToRender = Math.max(0, uiGlassesGoal - fullToRender - halfToRender);

    // Render array
    const renderGlasses = [];
    for (let i = 0; i < fullToRender; i++) {
        renderGlasses.push(<Image key={`full-${i}`} source={require('../assets/images/full_glass.png')} style={styles.glassImage} resizeMode="contain" />);
    }
    for (let i = 0; i < halfToRender; i++) {
        renderGlasses.push(<Image key={`half-${i}`} source={require('../assets/images/half_glass.png')} style={styles.glassImage} resizeMode="contain" />);
    }
    for (let i = 0; i < emptyToRender; i++) {
        renderGlasses.push(<Image key={`empty-${i}`} source={require('../assets/images/empty_glass.png')} style={styles.glassImage} resizeMode="contain" />);
    }

    const glassesLeftRaw = totalGlassesGoal - consumedGlassesRaw;
    const glassesLeft = Math.max(0, glassesLeftRaw);

    return (
        <View style={styles.cardContainer}>
            <View style={styles.headerRow}>
                <Text style={styles.headerText}>Water</Text>

                <TouchableOpacity style={styles.editButton} onPress={() => { }}>
                    <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.glassesContainer}>
                {renderGlasses}
            </View>

            <View style={styles.footerRow}>
                {glassesLeft > 0 ? (
                    <Text style={styles.footerText}>
                        <Text style={styles.footerHighlight}>{glassesLeft}</Text> glasses of water left
                    </Text>
                ) : (
                    <Text style={styles.footerText}>
                        <Text style={[styles.footerHighlight, { color: '#22c55e' }]}>Goal Reached!</Text> Well done.
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        marginHorizontal: 16,
        marginTop: 16,
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        // Elevation for Android
        elevation: 3,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: "bold",
        color: Colors.text,
    },
    editButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.white,
    },
    glassesContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    glassImage: {
        width: 28,
        height: 42,
    },
    footerRow: {
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 16,
    },
    footerText: {
        fontSize: 16,
        color: Colors.textLight,
    },
    footerHighlight: {
        fontWeight: "bold",
        color: '#3b82f6', // Water blue
    }
});
