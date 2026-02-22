import { Colors } from "@/constants/Colors";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { DailyLog, getDailyLog } from "../services/logService";
import { getUserData, updateFitnessGoals, UserData } from "../services/userService";
import { SegmentedHalfCircleProgress30 } from "./HalfProgress";

// Helper component for individual macros
const MacroItem = ({ icon, label, amount, color }: { icon: keyof typeof Ionicons.glyphMap, label: string, amount: string, color: string }) => (
    <View style={styles.macroItem}>
        <Ionicons name={icon} size={28} color={color} />
        <View style={styles.macroTextContainer}>
            <Text style={styles.macroLabel}>{label}</Text>
            <Text style={styles.macroAmount}>{amount}</Text>
        </View>
    </View>
);

export function CaloriesCard({ selectedDate }: { selectedDate: Date }) {
    const { userId } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editCalories, setEditCalories] = useState("");
    const [editProtein, setEditProtein] = useState("");
    const [editCarbs, setEditCarbs] = useState("");
    const [editFat, setEditFat] = useState("");
    const [savingGoals, setSavingGoals] = useState(false);

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

            // Pre-fill edit modal form with current goals
            if (fetchedUser?.fitnessPlan) {
                setEditCalories(fetchedUser.fitnessPlan.dailyCalories.toString());
                setEditProtein(fetchedUser.fitnessPlan.macros.protein.toString());
                setEditCarbs(fetchedUser.fitnessPlan.macros.carbs.toString());
                setEditFat(fetchedUser.fitnessPlan.macros.fats.toString());
            }

        } catch (error) {
            console.error("Error fetching calories data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch when date changes
    useEffect(() => {
        fetchData();
    }, [selectedDate, userId]);

    // Re-fetch when screen comes into focus (e.g., coming back from add-log modal)
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [selectedDate, userId])
    );

    const handleSaveGoals = async () => {
        if (!userId) return;
        setSavingGoals(true);

        const newGoals = {
            dailyCalories: parseInt(editCalories) || 2000,
            protein: parseInt(editProtein) || 100,
            carbs: parseInt(editCarbs) || 200,
            fats: parseInt(editFat) || 60,
        };

        const success = await updateFitnessGoals(userId, newGoals);

        if (success) {
            // Optimistic UI update
            setUserData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    fitnessPlan: {
                        ...prev.fitnessPlan!,
                        dailyCalories: newGoals.dailyCalories,
                        macros: {
                            protein: newGoals.protein,
                            carbs: newGoals.carbs,
                            fats: newGoals.fats
                        }
                    }
                };
            });
            setEditModalVisible(false);
        }

        setSavingGoals(false);
    };

    if (loading) {
        return (
            <View style={[styles.cardContainer, { minHeight: 250, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    // Default goals if onboarding wasn't fully completed or data is missing
    const defaultGoal = 2000;
    const defaultProtein = 100;
    const defaultCarbs = 200;
    const defaultFat = 60;

    const caloriesGoal = userData?.fitnessPlan?.dailyCalories || defaultGoal;
    const proteinGoal = userData?.fitnessPlan?.macros.protein || defaultProtein;
    const carbsGoal = userData?.fitnessPlan?.macros.carbs || defaultCarbs;
    const fatGoal = userData?.fitnessPlan?.macros.fats || defaultFat;

    const caloriesConsumed = dailyLog?.caloriesConsumed || 0;
    const caloriesBurned = dailyLog?.caloriesBurned || 0;
    const proteinConsumed = dailyLog?.proteinConsumed || 0;
    const carbsConsumed = dailyLog?.carbsConsumed || 0;
    const fatConsumed = dailyLog?.fatConsumed || 0;

    // Remaining calories are what you have allowed to eat = Goal - Consumed + Burned
    const caloriesLeft = Math.max(0, caloriesGoal - caloriesConsumed + caloriesBurned);
    const proteinLeft = Number(Math.max(0, proteinGoal - proteinConsumed).toFixed(2));
    const carbsLeft = Number(Math.max(0, carbsGoal - carbsConsumed).toFixed(2));
    const fatLeft = Number(Math.max(0, fatGoal - fatConsumed).toFixed(2));

    // Progress = consumed / total allowable (Goal + Burned) capped between 0 and 1
    const totalAllowed = caloriesGoal + caloriesBurned;
    const progress = Math.min(1, Math.max(0, caloriesConsumed / totalAllowed));

    const macros = {
        carbs: `${carbsLeft}g`,
        protein: `${proteinLeft}g`,
        fat: `${fatLeft}g`
    };

    return (
        <View style={styles.cardContainer}>
            <View style={styles.headerRow}>
                <Text style={styles.headerText}>Calories</Text>

                <TouchableOpacity style={styles.editButton} onPress={() => setEditModalVisible(true)}>
                    <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
                <SegmentedHalfCircleProgress30
                    progress={progress}
                    size={300}
                    strokeWidth={50}
                    segments={16}
                    gapAngle={20}
                    value={caloriesLeft}
                    label="Remaining"
                />
            </View>

            <View style={styles.macrosContainer}>
                <MacroItem icon="nutrition" label="Carbs" amount={macros.carbs} color={Colors.primary} />
                <MacroItem icon="barbell" label="Protein" amount={macros.protein} color="#3b82f6" />
                <MacroItem icon="flame" label="Fat" amount={macros.fat} color="#f59e0b" />
            </View>

            {/* Edit Goals Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Daily Goals</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color={Colors.textLight} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalForm}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Calories (kcal)</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={editCalories}
                                    onChangeText={setEditCalories}
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.label}>Protein (g)</Text>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        value={editProtein}
                                        onChangeText={setEditProtein}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1, marginHorizontal: 4 }]}>
                                    <Text style={styles.label}>Carbs (g)</Text>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        value={editCarbs}
                                        onChangeText={setEditCarbs}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={styles.label}>Fat (g)</Text>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        value={editFat}
                                        onChangeText={setEditFat}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, savingGoals && styles.saveButtonDisabled]}
                                onPress={handleSaveGoals}
                                disabled={savingGoals}
                            >
                                <Text style={styles.saveButtonText}>
                                    {savingGoals ? "Saving..." : "Save Goals"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
    progressContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 24, // Gives space for the text inside the half progress and bottom separation
    },
    macrosContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12, // Gap between cards
        marginTop: 10,
    },
    macroItem: {
        flex: 1, // Let each column take equal space
        backgroundColor: Colors.primary + '15', // Light primary background (15% opacity) to each section
        padding: 12,
        borderRadius: 16,
        alignItems: "center",
        flexDirection: "column",
        gap: 8,
    },
    macroTextContainer: {
        alignItems: "center",
    },
    macroIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    macroLabel: {
        fontSize: 12,
        color: Colors.textLight,
        marginBottom: 2,
    },
    macroAmount: {
        fontSize: 14,
        fontWeight: "bold",
        color: Colors.text,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    modalForm: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text,
    },
    input: {
        backgroundColor: Colors.inputBackground,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: Colors.text,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    saveButton: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
});
