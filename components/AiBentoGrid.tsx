import { Colors } from "@/constants/Colors";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { addDays, format, startOfWeek } from "date-fns";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { generateWeeklyBentoInsights } from "../services/aiService";
import { getDailyLog } from "../services/logService";
import { getUserData, updateAiInsights } from "../services/userService";

export function AiBentoGrid({ selectedDate }: { selectedDate: Date }) {
    const { userId } = useAuth();
    const [insights, setInsights] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const fetchAndGenerate = async () => {
            if (!userId) return;

            const user = await getUserData(userId);
            if (!user) return;

            const now = Date.now();
            const sixHoursMs = 6 * 60 * 60 * 1000;
            const lastGeneratedAt = user.aiInsights?.generatedAt || 0;

            // Immediately render cached insights if available so users don't wait
            if (user.aiInsights) {
                setInsights(user.aiInsights);
            }

            // Fire off background AI generation if cache is old (> 6 hours)
            if (now - lastGeneratedAt > sixHoursMs) {
                setIsGenerating(true);
                try {
                    // Fetch logs for the current week based on selectedDate
                    const start = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Sunday start
                    const logPromises = [];
                    for (let i = 0; i < 7; i++) {
                        const dayDate = addDays(start, i);
                        const dateStr = format(dayDate, "yyyy-MM-dd");
                        logPromises.push(getDailyLog(userId, dateStr));
                    }

                    const weeklyLogs = await Promise.all(logPromises);

                    const generated = await generateWeeklyBentoInsights(user, weeklyLogs);

                    const newBlock = {
                        ...generated,
                        generatedAt: now
                    };

                    // Push to Firebase for caching
                    await updateAiInsights(userId, newBlock);

                    // Soft-update UI
                    setInsights(newBlock);
                } catch (error) {
                    console.error("AI Generation failed:", error);
                } finally {
                    setIsGenerating(false);
                }
            }
        };

        fetchAndGenerate();
    }, [selectedDate, userId]);

    // If there's no cache and we are currently loading the very first generation:
    if (!insights && isGenerating) {
        return (
            <View style={[styles.loadingWrapper]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Gemini is analyzing your week...</Text>
            </View>
        );
    }

    // If for some reason both trigger fails and cache is empty
    if (!insights) return null;

    return (
        <View>
            <View style={styles.headerRow}>
                <View style={styles.titleRow}>
                    <Ionicons name="sparkles" size={20} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>AI Weekly Insights</Text>
                </View>
                {isGenerating && (
                    <ActivityIndicator size="small" color={Colors.primary} style={styles.spinner} />
                )}
            </View>

            <View style={styles.bentoGrid}>
                {/* Top Full-Width Card: Motivation */}
                <View style={[styles.bentoCard, styles.cardFull]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="flame" size={16} color="#f59e0b" />
                        <Text style={styles.cardTitle}>Motivation</Text>
                    </View>
                    <Text style={styles.cardContent}>{insights.motivation}</Text>
                </View>

                {/* Middle Row: Two Half-Width Cards */}
                <View style={styles.bentoRow}>
                    <View style={[styles.bentoCard, styles.cardHalf]}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="restaurant" size={16} color={Colors.primary} />
                            <Text style={styles.cardTitle}>Nutrition</Text>
                        </View>
                        <Text style={styles.cardContentSmall}>{insights.nutritionTip}</Text>
                    </View>

                    <View style={[styles.bentoCard, styles.cardHalf]}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="bicycle" size={16} color="#3b82f6" />
                            <Text style={styles.cardTitle}>Activity</Text>
                        </View>
                        <Text style={styles.cardContentSmall}>{insights.activityRecommendation}</Text>
                    </View>
                </View>

                {/* Bottom Full-Width Card: Overall Score */}
                <View style={[styles.bentoCard, styles.cardScore]}>
                    <Text style={styles.scoreNumber}>{insights.overallScore}</Text>
                    <Text style={styles.scoreText}>Weekly Performance Score</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingWrapper: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        minHeight: 150,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: Colors.textLight,
        fontWeight: '600',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    spinner: {
        marginLeft: 8,
    },
    bentoGrid: {
        gap: 12,
    },
    bentoRow: {
        flexDirection: 'row',
        gap: 12,
    },
    bentoCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardFull: {
        width: '100%',
    },
    cardHalf: {
        flex: 1,
    },
    cardScore: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: Colors.primary,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textLight,
    },
    cardContent: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text,
        lineHeight: 22,
    },
    cardContentSmall: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.text,
        lineHeight: 18,
    },
    scoreNumber: {
        fontSize: 36,
        fontWeight: '900',
        color: Colors.white,
    },
    scoreText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.white,
        opacity: 0.9,
    },
});
