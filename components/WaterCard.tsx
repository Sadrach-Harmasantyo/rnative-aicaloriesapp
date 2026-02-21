import { Colors } from "@/constants/Colors";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { DailyLog, getDailyLog } from "../services/logService";
import { getUserData, updateWaterGoal, UserData } from "../services/userService";

export function WaterCard({ selectedDate }: { selectedDate: Date }) {
    const { userId } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
    const [loading, setLoading] = useState(true);

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editWaterGoal, setEditWaterGoal] = useState("");
    const [savingGoals, setSavingGoals] = useState(false);

    // Helper to extract mL from goal string
    const getMlGoal = (waterIntakeStr?: string): number => {
        const raw = waterIntakeStr || "2L";
        const lowerRaw = raw.toLowerCase();
        if (lowerRaw.includes('ml')) {
            return parseFloat(lowerRaw.replace(/[^0-9.]/g, '')) || 2000;
        } else if (lowerRaw.includes('l')) {
            return (parseFloat(lowerRaw.replace(/[^0-9.]/g, '')) || 2) * 1000;
        } else {
            const val = parseFloat(raw) || 2;
            return val < 100 ? val * 1000 : val;
        }
    };

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

            if (fetchedUser?.fitnessPlan) {
                setEditWaterGoal(getMlGoal(fetchedUser.fitnessPlan.waterIntake).toString());
            }
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

    const mlGoal = getMlGoal(userData?.fitnessPlan?.waterIntake);
    const ML_PER_GLASS = 250;
    const totalGlassesGoal = Math.ceil(mlGoal / ML_PER_GLASS);

    const handleSaveGoal = async () => {
        if (!userId) return;
        setSavingGoals(true);

        const newGoalMl = parseInt(editWaterGoal) || 2000;
        const success = await updateWaterGoal(userId, newGoalMl);

        if (success) {
            setUserData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    fitnessPlan: {
                        ...prev.fitnessPlan!,
                        waterIntake: `${newGoalMl}ml`
                    }
                };
            });
            setEditModalVisible(false);
        }

        setSavingGoals(false);
    };

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

    const consumedMl = consumedGlassesRaw * ML_PER_GLASS;
    const glassesLeft = Math.max(0, totalGlassesGoal - consumedGlassesRaw);

    return (
        <View style={styles.cardContainer}>
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.headerText}>Water</Text>
                    <Text style={styles.waterCountSubtitle}>{consumedMl} ml / {mlGoal} ml</Text>
                </View>

                <TouchableOpacity style={styles.editButton} onPress={() => setEditModalVisible(true)}>
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

            {/* Edit Water Goal Modal */}
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
                            <Text style={styles.modalTitle}>Daily Hydration Goal</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color={Colors.textLight} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalForm}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Water Goal (ml)</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={editWaterGoal}
                                    onChangeText={setEditWaterGoal}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, savingGoals && styles.saveButtonDisabled]}
                                onPress={handleSaveGoal}
                                disabled={savingGoals}
                            >
                                <Text style={styles.saveButtonText}>
                                    {savingGoals ? "Saving..." : "Save Goal"}
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
    waterCountSubtitle: {
        fontSize: 14,
        color: Colors.textLight,
        fontWeight: '500',
        marginTop: 2,
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
        backgroundColor: Colors.inputBackground || "#f9fafb",
        borderWidth: 1,
        borderColor: Colors.inputBorder || "#e5e7eb",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: Colors.text,
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
    }
});
