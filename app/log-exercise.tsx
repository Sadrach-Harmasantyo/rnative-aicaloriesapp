import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";

export default function LogExercise() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Log Exercise</Text>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity
                    style={styles.optionCard}
                    onPress={() => router.push({ pathname: '/exercise-detail', params: { name: 'Run' } })}
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#fef3c7' }]}>
                        <Ionicons name="walk" size={32} color="#f59e0b" />
                    </View>
                    <View style={styles.optionTextContainer}>
                        <Text style={styles.optionTitle}>Run</Text>
                        <Text style={styles.optionDesc}>Running, Walking, Cycling etc</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.optionCard}
                    onPress={() => router.push({ pathname: '/exercise-detail', params: { name: 'Weight Lifting' } })}
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#e0e7ff' }]}>
                        <Ionicons name="barbell" size={32} color="#6366f1" />
                    </View>
                    <View style={styles.optionTextContainer}>
                        <Text style={styles.optionTitle}>Weight Lifting</Text>
                        <Text style={styles.optionDesc}>Gym, Machine etc</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.optionCard}
                    onPress={() => router.push('/manual-exercise')}
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#fce7f3' }]}>
                        <Ionicons name="create" size={32} color="#ec4899" />
                    </View>
                    <View style={styles.optionTextContainer}>
                        <Text style={styles.optionTitle}>Manual</Text>
                        <Text style={styles.optionDesc}>Enter calories Burn Manually</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
                </TouchableOpacity>
            </ScrollView>
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
        paddingBottom: 24,
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
        gap: 16,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    optionDesc: {
        fontSize: 14,
        color: Colors.textLight,
    },
});
