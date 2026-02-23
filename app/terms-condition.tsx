import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";

export default function TermsConditionScreen() {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms and Conditions</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.lastUpdated}>Last updated: January 2026</Text>

                <View style={styles.section}>
                    <Text style={styles.heading}>1. Acceptance of Terms</Text>
                    <Text style={styles.paragraph}>
                        By accessing or using the NativeCal application, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the service.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>2. Medical Disclaimer</Text>
                    <Text style={styles.paragraph}>
                        NativeCal provides fitness and nutritional tracking tools for informational purposes only. The app is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or qualified health provider with any questions you may have regarding a medical condition or fitness regimen.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>3. User Accounts & Data</Text>
                    <Text style={styles.paragraph}>
                        You are responsible for safeguarding the password that you use to access the service. We are committed to protecting your personal data, which is securely stored via Google Firebase and Clerk Authentication.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>4. Acceptable Use</Text>
                    <Text style={styles.paragraph}>
                        You agree not to use the application to engage in any legally prohibited activities, transmit harmful code, or interfere with the security features of the service.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>5. Changes to Terms</Text>
                    <Text style={styles.paragraph}>
                        We reserve the right to modify or replace these Terms at any time. Material changes will be communicated via the application or email prior to taking effect.
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
