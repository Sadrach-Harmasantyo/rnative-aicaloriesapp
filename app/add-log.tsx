import { Colors } from "@/constants/Colors";
import { useUser } from "@clerk/clerk-expo";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { updateDailyLog } from "../services/logService";
import { cancelTodaysReminders } from "../services/notificationService";

export default function AddLogScreen() {
    const { user } = useUser();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [calories, setCalories] = useState("");
    const [protein, setProtein] = useState("");
    const [carbs, setCarbs] = useState("");
    const [fat, setFat] = useState("");
    const [water, setWater] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);

        const dateKey = format(new Date(), "yyyy-MM-dd");

        const parsedCalories = calories ? parseInt(calories) : 0;
        const parsedWater = water ? parseInt(water) : 0;

        const updates = {
            caloriesConsumed: parsedCalories,
            proteinConsumed: protein ? parseInt(protein) : 0,
            carbsConsumed: carbs ? parseInt(carbs) : 0,
            fatConsumed: fat ? parseInt(fat) : 0,
            waterConsumed: parsedWater,
        };

        if (updates.caloriesConsumed > 0 || updates.proteinConsumed > 0 || updates.carbsConsumed > 0 || updates.fatConsumed > 0 || updates.waterConsumed > 0) {

            // Generate a default title if empty
            let finalTitle = title.trim();
            if (!finalTitle) {
                if (parsedCalories > 0 && parsedWater === 0) finalTitle = "Nutrition Logged";
                else if (parsedWater > 0 && parsedCalories === 0) finalTitle = "Water Logged";
                else finalTitle = "Activity Logged";
            }

            const newActivity = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                title: finalTitle,
                calories: parsedCalories > 0 ? parsedCalories : undefined,
                water: parsedWater > 0 ? parsedWater : undefined,
            };

            await updateDailyLog(user.id, dateKey, updates, newActivity);

            // Re-ward the user by silencing today's remaining local push notifications
            await cancelTodaysReminders();
        }

        setLoading(false);
        router.back();
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <Text style={styles.title}>Add Activity</Text>
            <Text style={styles.subtitle}>Log your consumption for today</Text>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Activity Name (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Lunch, Morning Water"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.label}>Calories (kcal)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="0"
                            value={calories}
                            onChangeText={setCalories}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                        <Text style={styles.label}>Water (glasses)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="0"
                            value={water}
                            onChangeText={setWater}
                        />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.label}>Protein (g)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="0"
                            value={protein}
                            onChangeText={setProtein}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginHorizontal: 4 }]}>
                        <Text style={styles.label}>Carbs (g)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="0"
                            value={carbs}
                            onChangeText={setCarbs}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                        <Text style={styles.label}>Fat (g)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="0"
                            value={fat}
                            onChangeText={setFat}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    <Text style={styles.saveButtonText}>
                        {loading ? "Saving..." : "Save Log"}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: Colors.text,
        marginTop: 20,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textLight,
        marginBottom: 32,
    },
    form: {
        gap: 20,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
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
