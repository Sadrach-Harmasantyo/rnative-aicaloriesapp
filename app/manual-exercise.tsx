import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { updateDailyLog } from "../services/logService";

export default function ManualExercise() {
    const router = useRouter();
    const { userId } = useAuth();
    const [calories, setCalories] = useState('0');
    const [loading, setLoading] = useState(false);

    const handleLog = async () => {
        if (!userId) return;

        const parsedCalories = parseInt(calories) || 0;
        if (parsedCalories <= 0) return;

        setLoading(true);

        const dateKey = format(new Date(), "yyyy-MM-dd");

        const newActivity = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            title: "Manual Exercise",
            calories: parsedCalories,
            type: "exercise" as const
        };

        const updates = {
            caloriesBurned: parsedCalories,
        };

        await updateDailyLog(userId, dateKey, updates, newActivity);

        setLoading(false);
        router.push('/(tabs)');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Manual Entry</Text>
                </View>

                {/* Main Content */}
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

                    <View style={styles.iconWrapper}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="flame" size={64} color={Colors.primary} style={{ marginLeft: 4 }} />
                        </View>
                    </View>

                    <Text style={styles.title}>Calories Burned</Text>
                    <Text style={styles.subtitle}>Enter the exact amount of calories you burned during your unlisted activity.</Text>

                    {/* Big Input Area */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="0"
                            placeholderTextColor={Colors.textLight}
                            keyboardType="numeric"
                            value={calories}
                            onChangeText={setCalories}
                            maxLength={4}
                            autoFocus={true}
                            selectionColor={Colors.primary}
                        />
                        <Text style={styles.unitText}>kcal</Text>
                    </View>

                </ScrollView>

                {/* Footer Button */}
                <View style={styles.footerContainer}>
                    <TouchableOpacity
                        style={[styles.continueButton, (!calories || calories === '0' || loading) && styles.disabledButton]}
                        onPress={handleLog}
                        disabled={!calories || calories === '0' || loading}
                    >
                        <Text style={styles.continueButtonText}>
                            {loading ? "Logging..." : "Log Activity"}
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
        flex: 1, // fill space automatically
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
        marginTop: -40, // offset header visual weight slightly
    },
    iconWrapper: {
        marginBottom: 24,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: Colors.textLight,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 40,
        paddingHorizontal: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
    },
    textInput: {
        fontSize: 64,
        fontWeight: 'bold',
        color: Colors.text,
        minWidth: 80,
        textAlign: 'center',
    },
    unitText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textLight,
        marginLeft: 8,
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
    },
});
