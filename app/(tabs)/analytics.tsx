import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { addDays, format, startOfWeek } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BarChart, LineChart, StackedBarChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import { AiBentoGrid } from "../../components/AiBentoGrid";
import { Colors } from "../../constants/Colors";
import { getDailyLog } from "../../services/logService";
import { getUserData, UserData } from "../../services/userService";

const { width } = Dimensions.get("window");

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
    const [chartData, setChartData] = useState<{ labels: string[], data: number[] }>({ labels: [], data: [] });

    // New Weekly Energy States
    const [energyChartData, setEnergyChartData] = useState<{ labels: string[], data: number[][] }>({ labels: [], data: [] });
    const [weeklyBurnedTotal, setWeeklyBurnedTotal] = useState(0);
    const [weeklyConsumedTotal, setWeeklyConsumedTotal] = useState(0);

    // New Weekly Water States
    const [waterChartData, setWaterChartData] = useState<{ labels: string[], data: number[] }>({ labels: [], data: [] });
    const [weeklyWaterTotal, setWeeklyWaterTotal] = useState(0);

    const [currentStreakCount, setCurrentStreakCount] = useState(0);
    const [streakModalVisible, setStreakModalVisible] = useState(false);

    const fetchAnalyticsData = async () => {
        if (!userId) return;
        setLoading(true);

        try {
            // Fetch User Weight Data
            const user = await getUserData(userId);
            setUserData(user);

            // Fetch Current Week Streak & Chart Data
            const start = startOfWeek(new Date(), { weekStartsOn: 0 }); // Sunday start
            const weeklyData: DayStreak[] = [];
            const chartLabels: string[] = [];
            const chartCalories: number[] = [];

            const energyChartLabels: string[] = [];
            const energyChartValues: number[][] = [];
            let totalBurned = 0;
            let totalConsumed = 0;

            const waterChartLabels: string[] = [];
            const waterChartValues: number[] = [];
            let totalWater = 0;

            let streakCount = 0;

            for (let i = 0; i < 7; i++) {
                const dayDate = addDays(start, i);
                const dateStr = format(dayDate, "yyyy-MM-dd");
                const log = await getDailyLog(userId, dateStr);

                // Check if user has ANY activity or consumed calories logged on this specific day
                const hasActivity = (log.activities && log.activities.length > 0) || log.caloriesConsumed > 0 || log.waterConsumed > 0;

                // Track daily calories for chart (limit negative boundaries)
                const safeCalories = Math.max(0, log.caloriesConsumed || 0);
                const safeBurned = Math.max(0, log.caloriesBurned || 0);
                const safeWater = Math.max(0, log.waterConsumed || 0);

                if (hasActivity) {
                    streakCount++;
                }

                weeklyData.push({
                    label: format(dayDate, "EEEEE"), // S, M, T, etc.
                    modalLabel: format(dayDate, "EEE"), // Sun, Mon, Tue
                    hasActivity
                });

                chartLabels.push(format(dayDate, "EEE"));
                chartCalories.push(safeCalories);

                energyChartLabels.push(format(dayDate, "EEE"));
                // Stacked chart format: [Burned, Consumed]
                energyChartValues.push([safeBurned, safeCalories]);

                waterChartLabels.push(format(dayDate, "EEE"));
                // Convert glasses to ml (assuming 1 glass = 250ml)
                const safeMl = safeWater * 250;
                waterChartValues.push(safeMl);

                totalBurned += safeBurned;
                totalConsumed += safeCalories;
                totalWater += safeMl;
            }

            setWeekStreak(weeklyData);
            setChartData({ labels: chartLabels, data: chartCalories });

            setEnergyChartData({ labels: energyChartLabels, data: energyChartValues });
            setWeeklyBurnedTotal(totalBurned);
            setWeeklyConsumedTotal(totalConsumed);

            setWaterChartData({ labels: waterChartLabels, data: waterChartValues });
            setWeeklyWaterTotal(totalWater);

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

                    <View style={{ marginBottom: 16 }}>
                        <AiBentoGrid selectedDate={new Date()} />
                    </View>

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
                        <TouchableOpacity style={[styles.card, styles.weightCard]} onPress={() => router.push("/log-weight")}>
                            <View style={styles.weightCardTop}>
                                <View style={styles.weightHeaderSmall}>
                                    <Ionicons name="scale-outline" size={28} color="#3b82f6" />
                                </View>
                                <Text style={styles.cardSubtitle}>My Weight</Text>
                            </View>
                            <View style={styles.weightCardBottom}>
                                <Text style={styles.weightValue}>
                                    {userData?.weight ? userData.weight : "--"}
                                    <Text style={styles.weightUnit}> kg</Text>
                                </Text>
                                <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Weekly Calories Chart */}
                    <View style={[styles.card, styles.chartCard]}>
                        <View style={styles.chartHeader}>
                            <View style={styles.chartTitleRow}>
                                <Ionicons name="bar-chart" size={20} color={Colors.primary} />
                                <Text style={styles.chartTitle}>Calories Consumed</Text>
                            </View>
                            <Text style={styles.cardSubtitle}>This Week</Text>
                        </View>

                        {chartData.labels.length > 0 && (
                            <BarChart
                                data={{
                                    labels: chartData.labels,
                                    datasets: [{ data: chartData.data }]
                                }}
                                width={width - 88} // Screen width minus padding & margins
                                height={220}
                                yAxisLabel=""
                                yAxisSuffix=" kcal"
                                yAxisInterval={1}
                                chartConfig={{
                                    backgroundColor: Colors.white,
                                    backgroundGradientFrom: Colors.white,
                                    backgroundGradientTo: Colors.white,
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(41, 143, 80, ${opacity})`, // App Primary Green #298f50
                                    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // Gray-500 for text
                                    style: {
                                        borderRadius: 16,
                                    },
                                    barPercentage: 0.6,
                                    propsForBackgroundLines: {
                                        strokeWidth: 1,
                                        stroke: "#e5e7eb",
                                        strokeDasharray: "0",
                                    },
                                }}
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16,
                                    marginLeft: -10, // Small negative margin to align Y axis tightly
                                }}
                                showValuesOnTopOfBars={false} // Clean modern look
                                fromZero={true}
                            />
                        )}
                    </View>

                    {/* Weekly Energy Chart */}
                    <View style={[styles.card, styles.chartCard]}>
                        <View style={styles.chartHeader}>
                            <View style={styles.chartTitleRow}>
                                <Ionicons name="flash" size={20} color="#f59e0b" />
                                <Text style={styles.chartTitle}>Weekly Energy</Text>
                            </View>
                            <Text style={styles.cardSubtitle}>This Week</Text>
                        </View>

                        <View style={styles.energySummaryRow}>
                            <View style={styles.energySummaryCol}>
                                <Text style={styles.energySummaryValue}>{weeklyBurnedTotal}</Text>
                                <Text style={styles.energySummaryLabel}>Burned</Text>
                            </View>
                            <View style={styles.energySummaryDivider} />
                            <View style={styles.energySummaryCol}>
                                <Text style={styles.energySummaryValue}>{weeklyConsumedTotal}</Text>
                                <Text style={styles.energySummaryLabel}>Consumed</Text>
                            </View>
                            <View style={styles.energySummaryDivider} />
                            <View style={styles.energySummaryCol}>
                                <Text style={styles.energySummaryValue}>{weeklyConsumedTotal - weeklyBurnedTotal}</Text>
                                <Text style={styles.energySummaryLabel}>Difference</Text>
                            </View>
                        </View>

                        {energyChartData.labels.length > 0 && (
                            <StackedBarChart
                                data={{
                                    labels: energyChartData.labels,
                                    data: energyChartData.data,
                                    barColors: ["#f59e0b", "#298f50"], // Amber for Burned, Green for Consumed
                                    legend: [] // Intentionally blank, custom legend building below
                                }}
                                hideLegend={true}
                                width={width - 88} // Screen width minus padding & margins
                                height={220}
                                yAxisLabel=""
                                yAxisSuffix=""
                                formatYLabel={(yValue) => Math.round(Number(yValue)).toString()}
                                chartConfig={{
                                    backgroundColor: Colors.white,
                                    backgroundGradientFrom: Colors.white,
                                    backgroundGradientTo: Colors.white,
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // Gray-500 for text
                                    style: {
                                        borderRadius: 16,
                                    },
                                    barPercentage: 0.6,
                                    propsForBackgroundLines: {
                                        strokeWidth: 1,
                                        stroke: "#e5e7eb",
                                        strokeDasharray: "0",
                                    },
                                }}
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16,
                                    marginLeft: -10,
                                }}
                            />
                        )}

                        <View style={styles.chartLegendContainer}>
                            <View style={styles.chartLegendItem}>
                                <View style={[styles.chartLegendColor, { backgroundColor: '#f59e0b' }]} />
                                <Text style={styles.chartLegendText}>Burned</Text>
                            </View>
                            <View style={styles.chartLegendItem}>
                                <View style={[styles.chartLegendColor, { backgroundColor: '#298f50' }]} />
                                <Text style={styles.chartLegendText}>Consumed</Text>
                            </View>
                        </View>
                    </View>

                    {/* Weekly Water Chart */}
                    <View style={[styles.card, styles.chartCard]}>
                        <View style={styles.chartHeader}>
                            <View style={styles.chartTitleRow}>
                                <Ionicons name="water" size={20} color="#3b82f6" />
                                <Text style={styles.chartTitle}>Water Consumption</Text>
                            </View>
                            <Text style={styles.cardSubtitle}>This Week</Text>
                        </View>

                        <View style={styles.energySummaryRow}>
                            <View style={styles.energySummaryCol}>
                                <Text style={styles.energySummaryValue}>{weeklyWaterTotal} ml</Text>
                                <Text style={styles.energySummaryLabel}>Total</Text>
                            </View>
                            <View style={styles.energySummaryDivider} />
                            <View style={styles.energySummaryCol}>
                                <Text style={styles.energySummaryValue}>{Math.round(weeklyWaterTotal / 7)} ml</Text>
                                <Text style={styles.energySummaryLabel}>Daily Avg</Text>
                            </View>
                        </View>

                        {waterChartData.labels.length > 0 && (
                            <LineChart
                                data={{
                                    labels: waterChartData.labels,
                                    datasets: [{ data: waterChartData.data }]
                                }}
                                width={width - 88} // Screen width minus padding & margins
                                height={220}
                                yAxisLabel=""
                                yAxisSuffix=" ml"
                                yAxisInterval={1}
                                chartConfig={{
                                    backgroundColor: Colors.white,
                                    backgroundGradientFrom: Colors.white,
                                    backgroundGradientTo: Colors.white,
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue #3b82f6
                                    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // Gray-500
                                    style: {
                                        borderRadius: 16,
                                    },
                                    propsForBackgroundLines: {
                                        strokeWidth: 1,
                                        stroke: "#e5e7eb",
                                        strokeDasharray: "0",
                                    },
                                    propsForDots: {
                                        r: "5",
                                        strokeWidth: "2",
                                        stroke: "#3b82f6",
                                    }
                                }}
                                bezier
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16,
                                    marginLeft: -10,
                                }}
                                fromZero={true}
                            />
                        )}
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
        paddingBottom: 100,
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
    chartCard: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    chartTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
    },
    energySummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    energySummaryCol: {
        alignItems: 'center',
        flex: 1,
    },
    energySummaryDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#e5e7eb',
    },
    energySummaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    energySummaryLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textLight,
        marginTop: 4,
    },
    chartLegendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        gap: 24,
    },
    chartLegendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    chartLegendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    chartLegendText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textLight,
    },
    streakCard: {
        flex: 3,
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
        justifyContent: 'center',
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
    weightCard: {
        flex: 2,
        justifyContent: 'space-between',
    },
    weightCardTop: {
        alignItems: 'center',
        gap: 8,
    },
    weightHeaderSmall: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    weightCardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 16,
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
