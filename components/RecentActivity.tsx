import { Colors } from "@/constants/Colors";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { DailyLog, getDailyLog } from "../services/logService";

export function RecentActivity({ selectedDate }: { selectedDate: Date }) {
    const { userId } = useAuth();
    const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const dateStr = format(selectedDate, "yyyy-MM-dd");
            const fetchedLog = await getDailyLog(userId, dateStr);
            setDailyLog(fetchedLog);
        } catch (error) {
            console.error("Error fetching recent activities:", error);
        } finally {
            setLoading(false);
        }
    };

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
                    {activities.slice().sort((a, b) => b.timestamp - a.timestamp).map((activity, index) => {
                        // Determine icon and color based on content
                        let iconName: keyof typeof Ionicons.glyphMap = "checkmark-circle-outline";
                        let iconColor = Colors.primary;

                        if (activity.water && activity.water > 0 && (!activity.calories || activity.calories === 0)) {
                            iconName = "water-outline";
                            iconColor = "#3b82f6"; // Water blue
                        } else if (activity.calories && activity.calories > 0) {
                            iconName = "fast-food-outline";
                            iconColor = "#f59e0b"; // Food orange
                        }

                        // Format timestamp nicely
                        const timeString = format(new Date(activity.timestamp), "h:mm a");
                        const isLast = index === activities.length - 1;

                        return (
                            <View key={activity.id || index.toString()} style={[styles.activityItem, isLast && { borderBottomWidth: 0, paddingBottom: 0 }]}>
                                <View style={styles.activityItemLeft}>
                                    <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                                        <Ionicons name={iconName} size={20} color={iconColor} />
                                    </View>
                                    <View>
                                        <Text style={styles.activityTitle}>{activity.title}</Text>
                                        <Text style={styles.activityTime}>{timeString}</Text>
                                    </View>
                                </View>

                                <View style={styles.activityItemRight}>
                                    {activity.calories ? (
                                        <Text style={[styles.activityAmount, { color: Colors.text }]}>
                                            +{activity.calories} kcal
                                        </Text>
                                    ) : null}
                                    {activity.water ? (
                                        <Text style={[styles.activityAmount, { color: '#3b82f6' }]}>
                                            +{activity.water} glass{activity.water > 1 ? 'es' : ''}
                                        </Text>
                                    ) : null}
                                </View>
                            </View>
                        );
                    })}
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
    }
});
