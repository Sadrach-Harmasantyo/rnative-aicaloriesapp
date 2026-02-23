import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";

export default function PrivacyPolicyScreen() {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.lastUpdated}>Effective Date: December 2026</Text>

                <View style={styles.section}>
                    <Text style={styles.heading}>1. Information We Collect</Text>
                    <Text style={styles.paragraph}>
                        When you use NativeCal, we collect information you provide directly to us (such as profile details, weight, fitness goals, and daily macros). We also collect authentication details through Clerk and store secure JSON payloads within Google Firebase.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>2. How We Use Your Data</Text>
                    <Text style={styles.paragraph}>
                        We use the information we collect to provide, maintain, and improve our services. This includes calculating targeted fitness metrics, generating AI insights via Google Gemini, and persisting your calendar history for analytical trends over time.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>3. Data Sharing and AI</Text>
                    <Text style={styles.paragraph}>
                        When utilizing the "Scan Food" or "AI Insights" features, specific, anonymous image data and generalized fitness statistics are securely transmitted to Google's Gemini API for processing. We do not sell your personal data to third-party data brokers.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>4. Data Security</Text>
                    <Text style={styles.paragraph}>
                        We implement rigorous security measures, including HTTPS encryption and secure credential vaults, to protect your personal information against unauthorized access or alteration. However, no method of transmission over the Internet is 100% secure.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>5. Your Rights</Text>
                    <Text style={styles.paragraph}>
                        Depending on your location, you may have the right to access, correct, or delete your personal data. You can delete your account or contact our support team at admin@nativecal.com to exercise these rights.
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
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
    lastUpdated: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 24,
        fontStyle: 'italic',
    },
    section: {
        marginBottom: 24,
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 24,
        color: Colors.text,
    },
});
