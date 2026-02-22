import { Colors } from "@/constants/Colors";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { DailyLog, getDailyLog } from "../services/logService";

export function RecentActivity({ selectedDate, loadMoreTrigger }: { selectedDate: Date, loadMoreTrigger?: number }) {
    const { userId } = useAuth();
    const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
    const [loading, setLoading] = useState(true);
    const [displayedCount, setDisplayedCount] = useState(5);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchData = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const dateStr = format(selectedDate, "yyyy-MM-dd");
            const fetchedLog = await getDailyLog(userId, dateStr);
            setDailyLog(fetchedLog);
            setDisplayedCount(5); // Reset exactly on date change/fetch
        } catch (error) {
            console.error("Error fetching recent activities:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (loadMoreTrigger && loadMoreTrigger > 0 && !loadingMore && displayedCount < (dailyLog?.activities?.length || 0)) {
            handleLoadMore();
        }
    }, [loadMoreTrigger]);

    useEffect(() => {
        fetchData();
    }, [selectedDate, userId]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [selectedDate, userId])
    );

    if (loading) {
        return (
            <View style={[styles.cardContainer, { minHeight: 150, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const activities = dailyLog?.activities || [];
    const sortedActivities = activities.slice().sort((a, b) => b.timestamp - a.timestamp);
    const displayedActivities = sortedActivities.slice(0, displayedCount);

    const handleLoadMore = () => {
        setLoadingMore(true);

        // Simulate a tiny network delay for UX
        setTimeout(() => {
            setDisplayedCount(prev => prev + 5);
            setLoadingMore(false);
        }, 500);
    };

    return (
        <View style={styles.cardContainer}>
            <View style={styles.headerRow}>
                <Text style={styles.headerText}>Recent Activity</Text>
            </View>

            {activities.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                    <View style={styles.emptyStateIconCircle}>
                        <Ionicons name="list-outline" size={32} color={Colors.primary} />
                    </View>
                    <Text style={styles.emptyStateTextHeader}>
                        No activity found.
                    </Text>
                    <Text style={styles.emptyStateText}>
                        Tap add button to log your activity!
                    </Text>
                </View>
            ) : (
                <View style={styles.listContainer}>
                    {displayedActivities.map((activity, index) => {
                        // Format timestamp nicely for both block types
                        const timeString = format(new Date(activity.timestamp), "h:mm a");

                        // We render a standard Full-Width Card for ALL records
                        let iconName: keyof typeof Ionicons.glyphMap = "checkmark-circle-outline";
                        let iconColor = Colors.primary;
                        let cardBg = '#f0fdf4'; // Light green default for food
                        let cardBorder = '#bbf7d0';
                        let iconBg = '#dcfce7';

                        let mainMetricText = '';
                        let mainMetricIcon: keyof typeof Ionicons.glyphMap = "nutrition";
                        let mainMetricColor = Colors.primary;

                        let excName = activity.title;

                        // Default meta
                        let hasMeta = false;
                        let meta1 = '';
                        let meta1Icon: keyof typeof Ionicons.glyphMap = "time-outline";
                        let meta2 = '';
                        let meta2Icon: keyof typeof Ionicons.glyphMap = "time-outline";

                        if (activity.type === 'exercise') {
                            excName = activity.title.split(' Session')[0] || 'Workout';
                            const isRun = excName.toLowerCase().includes('run');
                            iconName = isRun ? 'walk' : 'barbell';
                            iconColor = '#f59e0b';
                            cardBg = '#fffbeb';
                            cardBorder = '#fde68a';
                            iconBg = '#fef3c7';

                            mainMetricText = `${activity.calories} kcal burned`;
                            mainMetricIcon = 'flame';
                            mainMetricColor = '#f59e0b';

                            hasMeta = true;
                            meta1 = `${activity.intensity || 'Medium'} Intensity`;
                            meta1Icon = 'pulse';
                            meta2 = `${activity.duration || 30}m`;
                            meta2Icon = 'time-outline';
                        } else if (activity.water && activity.water > 0 && (!activity.calories || activity.calories === 0)) {
                            iconName = "water-outline";
                            iconColor = "#3b82f6";
                            cardBg = '#eff6ff';
                            cardBorder = '#bfdbfe';
                            iconBg = '#dbeafe';

                            mainMetricText = `+${activity.water * 250} ml`;
                            mainMetricIcon = 'water';
                            mainMetricColor = '#3b82f6';

                            hasMeta = true;
                            meta1 = `+${activity.water} glass${activity.water > 1 ? 'es' : ''}`;
                            meta1Icon = 'water-outline';
                        } else if (activity.calories && activity.calories > 0) {
                            iconName = "fast-food-outline";
                            iconColor = "#10b981"; // Emerald
                            cardBg = '#ecfdf5';
                            cardBorder = '#a7f3d0';
                            iconBg = '#d1fae5';

                            mainMetricText = `+${activity.calories} kcal`;
                            mainMetricIcon = 'restaurant';
                            mainMetricColor = '#10b981';

                            hasMeta = true;

                            // Handle backwards compatibility for older titles like "Potato (100g)"
                            let extractedServing = '';
                            if (excName.includes('(') && excName.endsWith(')')) {
                                const lastParen = excName.lastIndexOf(' (');
                                if (lastParen !== -1) {
                                    extractedServing = excName.substring(lastParen + 2, excName.length - 1);
                                    excName = excName.substring(0, lastParen);
                                }
                            }

                            meta1 = activity.servingInfo || extractedServing || '1 Serving';
                            meta1Icon = 'pie-chart-outline';
                        }

                        return (
                            <View key={activity.id || index.toString()} style={[styles.exerciseCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                                {/* Oversized Icon Column */}
                                <View style={[styles.exerciseIconWrapper, { backgroundColor: iconBg }]}>
                                    <Ionicons name={iconName} size={36} color={iconColor} />
                                </View>

                                {/* Content Column */}
                                <View style={styles.exerciseContent}>
                                    <View style={styles.exerciseHeader}>
                                        <Text style={[styles.exerciseName, { flexShrink: 1, marginRight: 8 }]} numberOfLines={1}>{excName}</Text>
                                        <Text style={styles.activityTime}>{timeString}</Text>
                                    </View>

                                    <View style={styles.exerciseBurnRow}>
                                        <Ionicons name={mainMetricIcon} size={16} color={mainMetricColor} style={{ marginRight: 4 }} />
                                        <Text style={[styles.exerciseCaloriesText, { color: mainMetricColor }]}>{mainMetricText}</Text>
                                    </View>

                                    {hasMeta && (
                                        <View style={styles.exerciseMetaRow}>
                                            <Ionicons name={meta1Icon} size={14} color={Colors.textLight} style={{ marginRight: 4 }} />
                                            <Text style={styles.exerciseMetaText}>
                                                {meta1}
                                            </Text>
                                            {meta2 ? (
                                                <>
                                                    <Ionicons name={meta2Icon} size={14} color={Colors.textLight} style={{ marginLeft: 12, marginRight: 4 }} />
                                                    <Text style={styles.exerciseMetaText}>
                                                        {meta2}
                                                    </Text>
                                                </>
                                            ) : null}
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })}

                    {displayedCount < sortedActivities.length && loadingMore && (
                        <View style={styles.loadMoreContainer}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        marginHorizontal: 16,
        marginTop: 16,
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        // Elevation for Android
        elevation: 3,
    },
    headerRow: {
        marginBottom: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: "bold",
        color: Colors.text,
    },
    emptyStateContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    emptyStateIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyStateTextHeader: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.text,
        textAlign: 'center',
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 15,
        color: Colors.textLight,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 22,
    },
    listContainer: {
        gap: 16,
    },
    activityItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        paddingBottom: 16,
    },
    activityItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 2,
    },
    activityTime: {
        fontSize: 13,
        color: Colors.textLight,
    },
    activityItemRight: {
        alignItems: 'flex-end',
        gap: 4,
    },
    activityAmount: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    exerciseCard: {
        flexDirection: 'row',
        backgroundColor: '#fffbeb', // Super light amber background
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#fde68a', // Mild amber border
    },
    exerciseIconWrapper: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: '#fef3c7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    exerciseContent: {
        flex: 1,
        justifyContent: 'center',
    },
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    exerciseName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: Colors.text,
    },
    exerciseBurnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    exerciseCaloriesText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#d97706', // Bold amber
    },
    exerciseMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    exerciseMetaText: {
        fontSize: 13,
        color: Colors.textLight,
        fontWeight: '500',
    },
    loadMoreContainer: {
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    }
});
