import { Colors } from "@/constants/Colors";
import { updateDailyLog } from "@/services/logService";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LogFoodScreen() {
    const router = useRouter();
    const { user } = useUser();

    // Retrieve the passed params from our search results card
    const params = useLocalSearchParams<{
        foodName: string;
        servingSize: string;
        calories: string;
        protein: string;
        carbs: string;
        fat: string;
        isScanned?: string;
    }>();

    // Extract numbers from strings like "100g" -> "100", "g"
    const initialServingStr = params.servingSize || "1 Serving";
    const initialServingNum = initialServingStr.replace(/[^0-9.]/g, '') || "1";
    let initialServingUnit = initialServingStr.replace(/[0-9.\s]/g, '');
    if (!initialServingUnit) initialServingUnit = "Serving";

    // Standardize State with exact numeric default if param exists
    const [foodName, setFoodName] = useState(params.foodName || "Unknown Food");
    const [servingAmount, setServingAmount] = useState(initialServingNum);
    const [servingUnit, setServingUnit] = useState(initialServingUnit);

    const isScanned = params.isScanned === 'true';
    const [calories, setCalories] = useState(params.calories || "0");
    const [protein, setProtein] = useState(params.protein || "0");
    const [carbs, setCarbs] = useState(params.carbs || "0");
    const [fat, setFat] = useState(params.fat || "0");

    const [isSaving, setIsSaving] = useState(false);

    const handleSaveLog = async () => {
        if (!user) {
            Alert.alert("Error", "You must be logged in to save food logs.");
            return;
        }

        const calNum = parseInt(calories, 10);
        const proNum = parseFloat(protein);
        const carbNum = parseFloat(carbs);
        const fatNum = parseFloat(fat);

        if (isNaN(calNum) || calNum < 0) {
            Alert.alert("Invalid Input", "Please enter a valid calorie amount.");
            return;
        }

        setIsSaving(true);
        try {
            const today = format(new Date(), "yyyy-MM-dd");
            const newActivityTitle = `${foodName} (${servingAmount} ${servingUnit})`;

            const success = await updateDailyLog(
                user.id,
                today,
                {
                    caloriesConsumed: calNum,
                    proteinConsumed: isNaN(proNum) ? 0 : proNum,
                    carbsConsumed: isNaN(carbNum) ? 0 : carbNum,
                    fatConsumed: isNaN(fatNum) ? 0 : fatNum,
                },
                {
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    title: foodName || "Unknown Food",
                    calories: calNum,
                    type: "food",
                    protein: isNaN(proNum) ? 0 : proNum,
                    carbs: isNaN(carbNum) ? 0 : carbNum,
                    fat: isNaN(fatNum) ? 0 : fatNum,
                    servingInfo: `${servingAmount} ${servingUnit}`,
                    isScanned: isScanned
                }
            );

            if (success) {
                // Return to home tab cleanly, skipping the search screen in the stack
                router.replace("/(tabs)");
            } else {
                Alert.alert("Error", "Failed to save food log. Please check your connection.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "An unexpected error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={28} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Log Food</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                    {/* Hero Title */}
                    {isScanned ? (
                        <TextInput
                            style={styles.foodNameInput}
                            value={foodName}
                            onChangeText={setFoodName}
                            placeholder="Food Name"
                            placeholderTextColor={Colors.textLight}
                            multiline
                        />
                    ) : (
                        <Text style={styles.foodNameTitle}>{foodName}</Text>
                    )}

                    {/* Serving Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Serving Size</Text>
                        <View style={styles.servingInputWrapper}>
                            <TextInput
                                style={[styles.textInput, { flex: 1, borderWidth: 0 }]}
                                value={servingAmount}
                                onChangeText={(text) => setServingAmount(text.replace(/[^0-9.]/g, ''))} // strictly numeric
                                keyboardType="numeric"
                                placeholder="1"
                                placeholderTextColor={Colors.textLight}
                            />
                            {isScanned ? (
                                <TextInput
                                    style={styles.servingSuffixInput}
                                    value={servingUnit}
                                    onChangeText={setServingUnit}
                                    placeholder="unit"
                                    placeholderTextColor={Colors.textLight}
                                />
                            ) : (
                                <Text style={styles.servingSuffix}>{servingUnit}</Text>
                            )}
                        </View>
                    </View>

                    {/* Calories Input Card */}
                    <View style={[styles.inputGroup, styles.calorieCard]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <Ionicons name="flame" size={20} color="#f59e0b" style={{ marginRight: 6 }} />
                            <Text style={styles.label}>Calories (kcal)</Text>
                        </View>
                        <TextInput
                            style={[styles.textInput, styles.giantInput]}
                            value={calories}
                            onChangeText={setCalories}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={Colors.textLight}
                        />
                    </View>

                    <Text style={styles.sectionDivider}>Macronutrients</Text>

                    {/* Macros Grid */}
                    <View style={styles.macrosContainer}>
                        {/* Protein */}
                        <View style={styles.macroBlock}>
                            <View style={[styles.macroIconCircle, { backgroundColor: '#e0e7ff' }]}>
                                <Ionicons name="fish" size={20} color="#4f46e5" />
                            </View>
                            <Text style={styles.macroLabel}>Protein (g)</Text>
                            <TextInput
                                style={styles.macroInput}
                                value={protein}
                                onChangeText={setProtein}
                                keyboardType="decimal-pad"
                            />
                        </View>

                        {/* Carbs */}
                        <View style={styles.macroBlock}>
                            <View style={[styles.macroIconCircle, { backgroundColor: '#fce7f3' }]}>
                                <Ionicons name="leaf" size={20} color="#db2777" />
                            </View>
                            <Text style={styles.macroLabel}>Carbs (g)</Text>
                            <TextInput
                                style={styles.macroInput}
                                value={carbs}
                                onChangeText={setCarbs}
                                keyboardType="decimal-pad"
                            />
                        </View>

                        {/* Fat */}
                        <View style={styles.macroBlock}>
                            <View style={[styles.macroIconCircle, { backgroundColor: '#fef3c7' }]}>
                                <Ionicons name="water" size={20} color="#d97706" />
                            </View>
                            <Text style={styles.macroLabel}>Fat (g)</Text>
                            <TextInput
                                style={styles.macroInput}
                                value={fat}
                                onChangeText={setFat}
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </View>

                </ScrollView>

                {/* Footer Save Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSaveLog}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={24} color={Colors.white} style={{ marginRight: 8 }} />
                                <Text style={styles.saveButtonText}>Save to Food Log</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        backgroundColor: Colors.white,
    },
    backButton: {
        padding: 8,
        width: 44,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    foodNameTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.text,
        marginBottom: 32,
        lineHeight: 40,
    },
    foodNameInput: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.text,
        marginBottom: 32,
        lineHeight: 40,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: Colors.text,
    },
    servingInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 16,
        paddingRight: 16,
    },
    servingSuffix: {
        fontSize: 16,
        color: Colors.textLight,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    servingSuffixInput: {
        fontSize: 16,
        color: Colors.textLight,
        fontWeight: 'bold',
        marginLeft: 8,
        minWidth: 80,
        textAlign: 'right',
        paddingVertical: 14,
    },
    giantInput: {
        fontSize: 24,
        fontWeight: 'bold',
        paddingVertical: 16,
    },
    calorieCard: {
        backgroundColor: '#fffbeb',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#fef3c7',
    },
    sectionDivider: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginTop: 16,
        marginBottom: 16,
    },
    macrosContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    macroBlock: {
        flex: 1,
        backgroundColor: '#f9fafb',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    macroIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    macroLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textLight,
        marginBottom: 8,
    },
    macroInput: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        width: '100%',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        paddingVertical: 6,
    },
    footer: {
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 16 : 24,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    saveButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
