import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { updateDailyLog } from "../services/logService";
import { cancelTodaysReminders } from "../services/notificationService";

export default function AddWater() {
    const router = useRouter();
    const { userId } = useAuth();

    // Track water in milliliters (0 to 1000 max)
    const [waterMl, setWaterMl] = useState(0);
    const [loading, setLoading] = useState(false);

    // Increment/Decrement by 125ml (Half Glass)
    const STEP_ML = 125;
    const MAX_ML = 1000; // 4 Full Glasses

    const handleAdd = () => {
        if (waterMl < MAX_ML) {
            setWaterMl(waterMl + STEP_ML);
        }
    };

    const handleRemove = () => {
        if (waterMl > 0) {
            setWaterMl(waterMl - STEP_ML);
        }
    };

    const handleLogWater = async () => {
        if (!userId || waterMl === 0) return;
        setLoading(true);

        try {
            const dateKey = format(new Date(), "yyyy-MM-dd");
            // Standard conversion: 250ml = 1 full glass.
            // Using precise float if they log a half glass
            const glassesFloat = waterMl / 250;

            // Generate an Activity record for the timeline
            const newActivity = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                title: "Drank Water",
                water: glassesFloat,
                type: "food" as const // Using food to group non-exercises, or just generic
            };

            await updateDailyLog(userId, dateKey, { waterConsumed: glassesFloat }, newActivity);

            // Cancel remaining reminders today to reward user for tracking
            await cancelTodaysReminders();

            router.back();
        } catch (error) {
            console.error("Error logging water", error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate how many glasses to render based on Math
    const renderGlasses = () => {
        // If 0, just show one empty glass
        if (waterMl === 0) {
            return (
                <View style={styles.glassWrapper}>
                    <Image source={require('../assets/images/empty_glass.png')} style={styles.glassImage} resizeMode="contain" />
                </View>
            );
        }

        const fullGlassesCount = Math.floor(waterMl / 250);
        const hasHalfGlass = (waterMl % 250) !== 0;

        const glasses = [];

        // Render full glasses
        for (let i = 0; i < fullGlassesCount; i++) {
            glasses.push(
                <View key={`full-${i}`} style={styles.glassWrapper}>
                    <Image source={require('../assets/images/full_glass.png')} style={styles.glassImage} resizeMode="contain" />
                </View>
            );
        }

        // Render half glass if remainder exists
        if (hasHalfGlass) {
            glasses.push(
                <View key="half" style={styles.glassWrapper}>
                    <Image source={require('../assets/images/half_glass.png')} style={styles.glassImage} resizeMode="contain" />
                </View>
            );
        }

        return glasses;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Water Intake</Text>
                {/* Empty view to balance the header flex space */}
                <View style={{ width: 28 }} />
            </View>

            {/* Main Content */}
            <View style={styles.container}>

                {/* Instruction / Top Label */}
                <Text style={styles.subtitle}>
                    Track your hydration. Tap the buttons below to add or remove water.
                </Text>

                {/* Glasses Display Area */}
                <View style={styles.glassesContainer}>
                    {renderGlasses()}
                </View>

                {/* Controls Area (Minus - Amount - Plus) */}
                <View style={styles.controlsRow}>
                    <TouchableOpacity
                        style={[styles.controlButton, waterMl === 0 && styles.controlButtonDisabled]}
                        onPress={handleRemove}
                        disabled={waterMl === 0}
                    >
                        <Ionicons name="remove" size={32} color={waterMl === 0 ? Colors.border : Colors.primary} />
                    </TouchableOpacity>

                    <View style={styles.amountDisplay}>
                        <Text style={styles.amountText}>{waterMl}</Text>
                        <Text style={styles.unitText}>ml</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.controlButton, waterMl === MAX_ML && styles.controlButtonDisabled]}
                        onPress={handleAdd}
                        disabled={waterMl === MAX_ML}
                    >
                        <Ionicons name="add" size={32} color={waterMl === MAX_ML ? Colors.border : Colors.primary} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.maxLabel}>
                    {waterMl === MAX_ML ? "Maximum limit reached" : `Up to ${MAX_ML} ml per log`}
                </Text>

            </View>

            {/* Footer */}
            <View style={styles.footerContainer}>
                <TouchableOpacity
                    style={[styles.logButton, (loading || waterMl === 0) && styles.disabledButton]}
                    onPress={handleLogWater}
                    disabled={loading || waterMl === 0}
                >
                    <Text style={styles.logButtonText}>
                        {loading ? "Saving..." : "Log Water"}
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    subtitle: {
        fontSize: 15,
        color: Colors.textLight,
        textAlign: 'center',
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    glassesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        minHeight: 180, // Provides stable height even when empty
        marginBottom: 40,
    },
    glassWrapper: {
        width: 100,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glassImage: {
        width: '100%',
        height: '100%',
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        marginBottom: 16,
    },
    controlButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: Colors.border + '50',
    },
    controlButtonDisabled: {
        backgroundColor: '#f3f4f6',
        shadowOpacity: 0,
        elevation: 0,
    },
    amountDisplay: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        minWidth: 120,
    },
    amountText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    unitText: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.textLight,
        marginLeft: 8,
    },
    maxLabel: {
        fontSize: 13,
        color: Colors.textLight,
        fontWeight: '500',
    },
    footerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        paddingTop: 12,
        backgroundColor: Colors.background,
        borderTopWidth: 1,
        borderTopColor: Colors.border + '50',
    },
    logButton: {
        backgroundColor: Colors.primary,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: Colors.textLight,
        opacity: 0.5,
    },
    logButtonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
