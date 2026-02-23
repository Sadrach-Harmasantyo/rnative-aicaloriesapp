import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { getUserData, updateUserPreferences } from "../services/userService";

type ThemeOption = 'system' | 'light' | 'dark';

export default function PreferencesScreen() {
    const { userId } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [theme, setTheme] = useState<ThemeOption>('light');
    const [notifications, setNotifications] = useState(false);

    useEffect(() => {
        const fetchPreferences = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const userData = await getUserData(userId);
                if (userData?.preferences) {
                    setTheme(userData.preferences.theme);
                    setNotifications(userData.preferences.notifications);
                }
            } catch (error) {
                console.error("Error fetching preferences:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, [userId]);

    const handleSave = async () => {
        if (!userId) return;

        setSaving(true);
        try {
            await updateUserPreferences(userId, {
                theme,
                notifications
            });
            router.back();
        } catch (error) {
            console.error("Failed to save preferences:", error);
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
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Preferences</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                <Text style={styles.sectionTitle}>App Experience</Text>
                <Text style={styles.sectionSubtitle}>Customize how the app looks and how we communicate with you.</Text>

                {/* Theme Selection */}
                <View style={styles.groupContainer}>
                    <Text style={styles.label}>Appearance</Text>
                    <View style={styles.themeOptionsRow}>

                        {/* System Theme Card */}
                        <TouchableOpacity
                            style={[styles.themeCard, theme === 'system' && styles.themeCardActive]}
                            onPress={() => setTheme('system')}
                        >
                            <Ionicons
                                name="phone-portrait-outline"
                                size={28}
                                color={theme === 'system' ? Colors.primary : Colors.textLight}
                            />
                            <Text style={[styles.themeText, theme === 'system' && styles.themeTextActive]}>System</Text>
                        </TouchableOpacity>

                        {/* Light Theme Card */}
                        <TouchableOpacity
                            style={[styles.themeCard, theme === 'light' && styles.themeCardActive]}
                            onPress={() => setTheme('light')}
                        >
                            <Ionicons
                                name="sunny-outline"
                                size={28}
                                color={theme === 'light' ? Colors.primary : Colors.textLight}
                            />
                            <Text style={[styles.themeText, theme === 'light' && styles.themeTextActive]}>Light</Text>
                        </TouchableOpacity>

                        {/* Dark Theme Card */}
                        <TouchableOpacity
                            style={[styles.themeCard, theme === 'dark' && styles.themeCardActive]}
                            onPress={() => setTheme('dark')}
                        >
                            <Ionicons
                                name="moon-outline"
                                size={28}
                                color={theme === 'dark' ? Colors.primary : Colors.textLight}
                            />
                            <Text style={[styles.themeText, theme === 'dark' && styles.themeTextActive]}>Dark</Text>
                        </TouchableOpacity>

                    </View>
                </View>

                {/* Notifications Toggle */}
                <View style={styles.groupContainer}>
                    <Text style={styles.label}>Notifications</Text>
                    <View style={styles.switchRow}>
                        <View style={styles.switchTextContainer}>
                            <View style={styles.switchIconBackground}>
                                <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
                            </View>
                            <View>
                                <Text style={styles.switchTitle}>Push Notifications</Text>
                                <Text style={styles.switchSubtitle}>Daily reminders and goal updates</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: Colors.border, true: Colors.primary }}
                            thumbColor={Colors.white}
                            ios_backgroundColor={Colors.border}
                            onValueChange={setNotifications}
                            value={notifications}
                        />
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Preferences</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
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
    groupContainer: {
        marginBottom: 32,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 16,
        marginLeft: 4,
    },
    themeOptionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    themeCard: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    themeCardActive: {
        borderColor: Colors.primary,
        backgroundColor: '#ebf5ed',
    },
    themeText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textLight,
    },
    themeTextActive: {
        color: Colors.primary,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    switchTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 16,
    },
    switchIconBackground: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.inputBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    switchTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 2,
    },
    switchSubtitle: {
        fontSize: 12,
        color: Colors.textLight,
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
