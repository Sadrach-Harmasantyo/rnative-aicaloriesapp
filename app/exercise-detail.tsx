import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import Slider from '@react-native-community/slider';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { getUserData } from "../services/userService";

export default function ExerciseDetail() {
    const router = useRouter();
    const { name } = useLocalSearchParams<{ name: string }>();

    // State for Intensity logic (1 = Low, 2 = Medium, 3 = High)
    const [intensity, setIntensity] = useState<number>(2);

    // State for Duration logic
    const [selectedChipDuration, setSelectedChipDuration] = useState<number | null>(30);
    const [manualDuration, setManualDuration] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const { userId } = useAuth();

    // Core MET Values Table dictating intensity multiplier
    const MET_VALUES: Record<string, { Low: number, Medium: number, High: number }> = {
        'Run': { Low: 6.0, Medium: 8.3, High: 11.0 },
        'Weight Lifting': { Low: 3.0, Medium: 4.5, High: 6.0 }
    };

    const durationChips = [15, 30, 60, 90];

    const handleChipSelect = (mins: number) => {
        setSelectedChipDuration(mins);
        setManualDuration(''); // Clear manual if chip is selected
    };

    const handleManualChange = (text: string) => {
        setManualDuration(text);
        if (text.trim() !== '') {
            setSelectedChipDuration(null); // Clear chip if typing manually
        }
    };

    const getIntensityLabel = (value: number) => {
        switch (value) {
            case 1: return "Low";
            case 2: return "Medium";
            case 3: return "High";
            default: return "Medium";
        }
    };

    const handleContinueBtn = async () => {
        if (!userId) return;

        // Extract raw number value for active duration
        let activeDuration = 30; // default safe fallback
        if (selectedChipDuration) {
            activeDuration = selectedChipDuration;
        } else if (manualDuration) {
            activeDuration = parseInt(manualDuration) || 0;
        }

        // Prevent calculating zeros
        if (activeDuration <= 0) return;

        setLoading(true);

        try {
            const userData = await getUserData(userId);
            const userWeightKg = userData?.weight || 70; // Apple/Fitbit standard fallback if unknown

            // Extract the right MET table matching the route parameter
            const exerciseTypeClean = name || 'Run';
            const table = MET_VALUES[exerciseTypeClean] || MET_VALUES['Run'];

            // Link integer slider state to String intensity name
            const intensityLabel = getIntensityLabel(intensity) as 'Low' | 'Medium' | 'High';
            const exactMET = table[intensityLabel];

            // Primary Calorie Metric Formula (Apple/Fitbit Standard)
            // Calories = (MET * Weight(kg) * 3.5) / 200 * duration(m)
            const rawCalories = (exactMET * userWeightKg * 3.5) / 200 * activeDuration;
            const finalCalories = Math.round(rawCalories);

            // Output safely to new screen
            router.push({
                pathname: '/calculated-calories',
                params: {
                    cals: finalCalories.toString(),
                    name: exerciseTypeClean,
                    duration: activeDuration.toString(),
                    intensity: intensityLabel
                }
            } as any);

        } catch (error) {
            console.error("Error calculating exact calories", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{name || "Log Exercise"}</Text>
                </View>

                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

                    {/* Description Header */}
                    <Text style={styles.subtitle}>
                        Logging a new {name?.toLowerCase() || 'workout'} session. Fill out the details below so we can estimate your calories burned.
                    </Text>

                    {/* INTENSITY CARD */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardHeaderTitle}>
                                <Ionicons name="flame-outline" size={24} color={Colors.primary} />
                                <Text style={styles.cardTitle}>Intensity</Text>
                            </View>
                            <View style={styles.intensityBadge}>
                                <Text style={styles.intensityBadgeText}>{getIntensityLabel(intensity)}</Text>
                            </View>
                        </View>

                        <Slider
                            style={{ width: '100%', height: 40 }}
                            minimumValue={1}
                            maximumValue={3}
                            step={1}
                            value={intensity}
                            onValueChange={(val) => setIntensity(val)}
                            minimumTrackTintColor={Colors.primary}
                            maximumTrackTintColor={Colors.border}
                            thumbTintColor={Colors.primary}
                        />

                        {/* Slider Labels Row */}
                        <View style={styles.sliderLabels}>
                            <Text style={styles.sliderLabelText}>Low</Text>
                            <Text style={styles.sliderLabelText}>Medium</Text>
                            <Text style={styles.sliderLabelText}>High</Text>
                        </View>
                    </View>

                    {/* DURATION CARD */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardHeaderTitle}>
                                <Ionicons name="timer-outline" size={24} color={Colors.primary} />
                                <Text style={styles.cardTitle}>Duration</Text>
                            </View>
                            <Text style={styles.durationSuffix}>Minutes</Text>
                        </View>

                        {/* Chips Row */}
                        <View style={styles.chipsContainer}>
                            {durationChips.map((mins) => {
                                const isSelected = selectedChipDuration === mins;
                                return (
                                    <TouchableOpacity
                                        key={mins}
                                        style={[styles.chip, isSelected && styles.chipActive]}
                                        onPress={() => handleChipSelect(mins)}
                                    >
                                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                                            {mins}m
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View style={styles.divider} />

                        {/* Manual Input */}
                        <Text style={styles.manualInputLabel}>Or enter custom duration:</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g. 45"
                            placeholderTextColor={Colors.textLight}
                            keyboardType="numeric"
                            value={manualDuration}
                            onChangeText={handleManualChange}
                            maxLength={3}
                        />
                    </View>

                </ScrollView>

                {/* BOTTOM BUTTON */}
                <View style={styles.footerContainer}>
                    <TouchableOpacity
                        style={[styles.continueButton, loading && styles.disabledButton]}
                        onPress={handleContinueBtn}
                        disabled={loading}
                    >
                        <Text style={styles.continueButtonText}>
                            {loading ? "Calculating..." : "Continue"}
                        </Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
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
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    subtitle: {
        fontSize: 15,
        color: Colors.textLight,
        marginBottom: 24,
        lineHeight: 22,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardHeaderTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    intensityBadge: {
        backgroundColor: '#ecfdf5',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.primary + '30',
    },
    intensityBadgeText: {
        color: Colors.primary,
        fontSize: 13,
        fontWeight: 'bold',
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        marginTop: -4,
    },
    sliderLabelText: {
        fontSize: 12,
        color: Colors.textLight,
        fontWeight: '500',
    },
    durationSuffix: {
        fontSize: 14,
        color: Colors.textLight,
        fontWeight: '500',
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    chip: {
        flex: 1,
        minWidth: '20%',
        backgroundColor: '#f3f4f6',
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    chipActive: {
        backgroundColor: Colors.primary + '10',
        borderColor: Colors.primary,
    },
    chipText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textLight,
    },
    chipTextActive: {
        color: Colors.primary,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        width: '100%',
        marginBottom: 16,
    },
    manualInputLabel: {
        fontSize: 13,
        color: Colors.textLight,
        marginBottom: 8,
        fontWeight: '500',
    },
    textInput: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: Colors.text,
    },
    footerContainer: {
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 12 : 24,
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
    }
});
