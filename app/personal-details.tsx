import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { getUserData, updateFitnessGoals, updateWaterGoal } from "../services/userService";

export default function PersonalDetailsScreen() {
    const { userId } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Goal States
    const [calories, setCalories] = useState("");
    const [protein, setProtein] = useState("");
    const [carbs, setCarbs] = useState("");
    const [fat, setFat] = useState("");
    const [water, setWater] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const userData = await getUserData(userId);
                if (userData?.fitnessPlan) {
                    setCalories(userData.fitnessPlan.dailyCalories?.toString() || "");
                    setProtein(userData.fitnessPlan.macros?.protein?.toString() || "");
                    setCarbs(userData.fitnessPlan.macros?.carbs?.toString() || "");
                    setFat(userData.fitnessPlan.macros?.fats?.toString() || "");

                    // Parse "2000ml" to "2000"
                    const waterVal = userData.fitnessPlan.waterIntake?.replace(/\D/g, '');
                    setWater(waterVal || "");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleSave = async () => {
        if (!userId) return;

        const pCals = parseInt(calories);
        const pProtein = parseInt(protein);
        const pCarbs = parseInt(carbs);
        const pFat = parseInt(fat);
        const pWater = parseInt(water);

        if (isNaN(pCals) || isNaN(pProtein) || isNaN(pCarbs) || isNaN(pFat) || isNaN(pWater)) {
            Alert.alert("Invalid input", "Please ensure all fields are valid numbers.");
            return;
        }

        setSaving(true);
        try {
            await Promise.all([
                updateFitnessGoals(userId, {
                    dailyCalories: pCals,
                    protein: pProtein,
                    carbs: pCarbs,
                    fats: pFat
                }),
                updateWaterGoal(userId, pWater)
            ]);

            router.back();
        } catch (error) {
            console.error("Failed to save goals:", error);
            Alert.alert("Error", "Could not save your preferences. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Personal details</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                    <Text style={styles.sectionTitle}>Daily Targets</Text>
                    <Text style={styles.sectionSubtitle}>Update your macro and water goals to tailor your experience.</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Daily Calories</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="flame-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={calories}
                                onChangeText={setCalories}
                                keyboardType="number-pad"
                                placeholder="e.g. 2000"
                                placeholderTextColor={Colors.textLight}
                            />
                            <Text style={styles.unitText}>kcal</Text>
                        </View>
                    </View>

                    <View style={styles.macrosContainer}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Protein</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={[styles.input, styles.macroInput]}
                                    value={protein}
                                    onChangeText={setProtein}
                                    keyboardType="number-pad"
                                    placeholder="e.g. 150"
                                    placeholderTextColor={Colors.textLight}
                                />
                                <Text style={styles.unitText}>g</Text>
                            </View>
                        </View>

                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Carbs</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={[styles.input, styles.macroInput]}
                                    value={carbs}
                                    onChangeText={setCarbs}
                                    keyboardType="number-pad"
                                    placeholder="e.g. 200"
                                    placeholderTextColor={Colors.textLight}
                                />
                                <Text style={styles.unitText}>g</Text>
                            </View>
                        </View>

                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Fat</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={[styles.input, styles.macroInput]}
                                    value={fat}
                                    onChangeText={setFat}
                                    keyboardType="number-pad"
                                    placeholder="e.g. 70"
                                    placeholderTextColor={Colors.textLight}
                                />
                                <Text style={styles.unitText}>g</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Daily Water Intake</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="water-outline" size={20} color="#3b82f6" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={water}
                                onChangeText={setWater}
                                keyboardType="number-pad"
                                placeholder="e.g. 2500"
                                placeholderTextColor={Colors.textLight}
                            />
                            <Text style={styles.unitText}>ml</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.text,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 60,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.text,
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 32,
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    macrosContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 60,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text,
    },
    macroInput: {
        textAlign: 'center',
        fontSize: 20,
    },
    unitText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.textLight,
        marginLeft: 8,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        borderRadius: 16,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
