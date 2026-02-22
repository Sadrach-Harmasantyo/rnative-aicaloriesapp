import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { addDays, format, startOfWeek } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { getDailyLog } from "../../services/logService";
import { getUserData, UserData } from "../../services/userService";

interface DayStreak {
    label: string;
    modalLabel: string;
    hasActivity: boolean;
}

export default function AnalyticsScreen() {
    const { userId } = useAuth();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [weekStreak, setWeekStreak] = useState<DayStreak[]>([]);
    const [currentStreakCount, setCurrentStreakCount] = useState(0);
    const [streakModalVisible, setStreakModalVisible] = useState(false);

    const fetchAnalyticsData = async () => {
        if (!userId) return;
        setLoading(true);

        try {
            // Fetch User Weight Data
            const user = await getUserData(userId);
            setUserData(user);

            // Fetch Current Week Streak Data
            const start = startOfWeek(new Date(), { weekStartsOn: 0 }); // Sunday start
            const weeklyData: DayStreak[] = [];
            let streakCount = 0;

            for (let i = 0; i < 7; i++) {
                const dayDate = addDays(start, i);
                const dateStr = format(dayDate, "yyyy-MM-dd");
                const log = await getDailyLog(userId, dateStr);

                // Check if user has ANY activity or consumed calories logged on this specific day
                const hasActivity = (log.activities && log.activities.length > 0) || log.caloriesConsumed > 0 || log.waterConsumed > 0;

                if (hasActivity) {
                    streakCount++;
                }

                weeklyData.push({
                    label: format(dayDate, "EEEEE"), // S, M, T, etc.
                    modalLabel: format(dayDate, "EEE"), // Sun, Mon, Tue
                    hasActivity
                });
            }

            setWeekStreak(weeklyData);
            setCurrentStreakCount(streakCount);

        } catch (error) {
            console.error("Error fetching analytics data:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAnalyticsData();
        }, [userId])
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <LinearGradient
                colors={['#86efac', Colors.background]} // Gradient from light green to background
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.3 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.title}>Progress</Text>

                    <View style={styles.cardsRow}>
                        {/* Daily Streak Card */}
                        <Pressable style={[styles.card, styles.streakCard]} onPress={() => setStreakModalVisible(true)}>
                            <View style={styles.streakHeader}>
                                <View style={styles.fireIconContainer}>
                                    <Image source={require("../../assets/images/fire.png")} style={styles.fireIcon} />
                                </View>
                                <View>
                                    <Text style={styles.streakCountText}>{currentStreakCount} Days</Text>
                                    <Text style={styles.cardSubtitle}>Day Streak</Text>
                                </View>
                            </View>

                            {/* Week Checkboxes */}
                            <View style={styles.weekRow}>
                                {weekStreak.map((day, index) => (
                                    <View key={index} style={styles.dayCol}>
                                        <View style={[styles.checkbox, day.hasActivity && styles.checkboxActive]}>
                                            {day.hasActivity && <Ionicons name="checkmark" size={12} color={Colors.white} />}
                                        </View>
                                        <Text style={styles.dayLabel}>{day.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </Pressable>

                        {/* Weight Card */}
                        <View style={[styles.card, styles.weightCard]}>
                            <View style={styles.weightHeader}>
                                <View style={styles.scaleIconContainer}>
                                    <Ionicons name="scale-outline" size={24} color="#3b82f6" />
                                </View>
                            </View>
                            <Text style={styles.weightValue}>
                                {userData?.weight ? userData.weight : "--"}
                                <Text style={styles.weightUnit}> kg</Text>
                            </Text>
                            <Text style={styles.cardSubtitle}>My Weight</Text>
                        </View>
                    </View>

                </ScrollView>
            </LinearGradient>

            {/* Detailed Streak Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={streakModalVisible}
                onRequestClose={() => setStreakModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setStreakModalVisible(false)}
                >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHeaderRow}>
                            <Image source={require("../../assets/images/fire.png")} style={styles.modalFireIcon} />
                            <View style={styles.modalHeaderTextContent}>
                                <Text style={styles.modalStreakCount}>{currentStreakCount}</Text>
                                <Text style={styles.modalStreakSubtitle}>Daily Streak</Text>
                            </View>
                        </View>

                        <View style={styles.modalMotivationRow}>
                            <Text style={styles.modalMotivationText}>Keep it up 🔥</Text>
                        </View>

                        <View style={styles.modalWeekRow}>
                            {weekStreak.map((day, index) => (
                                <View key={index} style={styles.modalDayCol}>
                                    <View style={[styles.modalCheckbox, day.hasActivity && styles.modalCheckboxActive]}>
                                        {day.hasActivity && <Ionicons name="checkmark" size={16} color={Colors.white} />}
                                    </View>
                                    <Text style={styles.modalDayLabel}>{day.modalLabel}</Text>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.closeButton} onPress={() => setStreakModalVisible(false)}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#86efac',
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.background,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: "900",
        color: Colors.text,
        marginBottom: 24,
    },
    cardsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 20,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    streakCard: {
        flex: 3,
    },
    weightCard: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    streakHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    fireIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fffbeb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fireIcon: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
    },
    streakCountText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
    },
    cardSubtitle: {
        fontSize: 13,
        color: Colors.textLight,
        fontWeight: '600',
        marginTop: 2,
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dayCol: {
        alignItems: 'center',
        gap: 6,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: '#f59e0b', // Amber/Fire color for streak
        borderColor: '#f59e0b',
    },
    dayLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.textLight,
    },
    weightHeader: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    scaleIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    weightValue: {
        fontSize: 26,
        fontWeight: 'bold',
        color: Colors.text,
    },
    weightUnit: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textLight,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalFireIcon: {
        width: 64,
        height: 64,
        resizeMode: 'contain',
        marginRight: 16,
    },
    modalHeaderTextContent: {
        flex: 1,
    },
    modalStreakCount: {
        fontSize: 48,
        fontWeight: '900',
        color: Colors.text,
        lineHeight: 48,
    },
    modalStreakSubtitle: {
        fontSize: 18,
        color: Colors.textLight,
        fontWeight: '600',
    },
    modalMotivationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 24,
    },
    modalMotivationText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#f59e0b',
    },
    modalWeekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32,
    },
    modalDayCol: {
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    modalCheckbox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCheckboxActive: {
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
    },
    modalDayLabel: {
        fontSize: 13,
        fontWeight: 'bold',
        color: Colors.textLight,
    },
    closeButton: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
    }
});
