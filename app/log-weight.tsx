import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RulerPicker } from "react-native-ruler-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { getUserData, updateUserWeight } from "../services/userService";

const { width } = Dimensions.get("window");

export default function LogWeightScreen() {
    const { user } = useUser();
    const [currentWeight, setCurrentWeight] = useState<number>(70);
    const [selectedWeight, setSelectedWeight] = useState<number>(70);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user?.id) {
                const data = await getUserData(user.id);
                if (data?.weight) {
                    setCurrentWeight(data.weight);
                    setSelectedWeight(data.weight);
                }
            }
            setIsLoading(false);
        };
        fetchUserData();
    }, [user?.id]);

    const handleSaveWeight = async () => {
        if (!user?.id) return;
        setIsSaving(true);

        await updateUserWeight(user.id, selectedWeight);

        setIsSaving(false);
        router.back();
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Update Weight</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.weightDisplayContainer}>
                    <Text style={styles.weightValuePicker}>
                        {selectedWeight}
                        <Text style={styles.weightUnitPicker}> kg</Text>
                    </Text>
                    <Text style={styles.weightSubtitle}>Drag the ruler to select</Text>
                </View>

                {/* Ruler Picker Container */}
                <View style={styles.rulerContainer}>
                    <RulerPicker
                        min={30}
                        max={200}
                        step={1}
                        fractionDigits={0}
                        initialValue={currentWeight}
                        onValueChange={(number) => setSelectedWeight(parseInt(number, 10))}
                        onValueChangeEnd={(number) => setSelectedWeight(parseInt(number, 10))}
                        unit="kg"
                        width={width}
                        height={120}
                        indicatorHeight={60}
                        indicatorColor={Colors.primary}
                        stepWidth={2}
                        gapBetweenSteps={12}
                        shortStepHeight={20}
                        longStepHeight={40}
                        shortStepColor="#d1d5db"
                        longStepColor="#9ca3af"
                        valueTextStyle={{ color: 'transparent' }} // We hide the built-in text since we custom-styled our own above
                        unitTextStyle={{ color: 'transparent' }}
                    />
                </View>

                {/* Save Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                        onPress={handleSaveWeight}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={styles.saveButtonText}>Update Weight</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f3f4f6",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.text,
    },
    content: {
        flex: 1,
        justifyContent: "space-between",
        paddingTop: 60,
    },
    weightDisplayContainer: {
        alignItems: "center",
    },
    weightValuePicker: {
        fontSize: 72,
        fontWeight: "900",
        color: Colors.text,
    },
    weightUnitPicker: {
        fontSize: 24,
        fontWeight: "600",
        color: Colors.textLight,
    },
    weightSubtitle: {
        fontSize: 16,
        color: Colors.textLight,
        marginTop: 8,
    },
    rulerContainer: {
        alignItems: "center",
        justifyContent: "center",
        height: 200,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#f3f4f6",
    },
    footer: {
        padding: 24,
        paddingBottom: 40, // Safe area lift
    },
    saveButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: "center",
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
        fontWeight: "bold",
    },
});
