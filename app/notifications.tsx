import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { AppNotification, getUserNotificationHistory, markNotificationAsRead } from "../services/notificationStorage";

export default function NotificationsScreen() {
    const { userId } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        if (!userId) return;
        setLoading(true);
        const history = await getUserNotificationHistory(userId);
        setNotifications(history);
        setLoading(false);
    };

    // Re-fetch every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadNotifications();
        }, [userId])
    );

    const handleRead = async (notif: AppNotification) => {
        if (notif.isRead || !userId || !notif.id) return;

        // Optimistic UI
        setNotifications(current =>
            current.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
        );

        // Background update
        await markNotificationAsRead(userId, notif.id);
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const renderItem = ({ item }: { item: AppNotification }) => {
        const isAdmin = item.type === 'admin';

        return (
            <TouchableOpacity
                style={[styles.card, !item.isRead && styles.cardUnread]}
                onPress={() => handleRead(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, isAdmin ? styles.iconAdmin : styles.iconSystem]}>
                    <Ionicons
                        name={isAdmin ? "megaphone" : "notifications"}
                        size={24}
                        color={isAdmin ? Colors.secondary : Colors.primary}
                    />
                </View>
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.title, !item.isRead && styles.titleUnread]}>{item.title}</Text>
                        <Text style={styles.time}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <Text style={styles.body}>{item.body}</Text>
                </View>
                {!item.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.centerLoad}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id || Math.random().toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="notifications-off-outline" size={64} color={Colors.border} />
                            <Text style={styles.emptyStateText}>You have no notifications yet.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: Colors.white,
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
    centerLoad: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    cardUnread: {
        backgroundColor: '#f8faf9', // Very light tint of primarily primary color
        borderWidth: 1,
        borderColor: '#e2ece4',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    iconSystem: {
        backgroundColor: '#ebf5ed',
    },
    iconAdmin: {
        backgroundColor: '#fff4eb', // Light orange tint based on secondary
    },
    cardContent: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    title: {
        fontSize: 16,
        color: Colors.text,
        fontWeight: '600',
        flex: 1,
    },
    titleUnread: {
        fontWeight: 'bold',
        color: Colors.text, // Could make this darker
    },
    time: {
        fontSize: 12,
        color: Colors.textLight,
        marginLeft: 8,
    },
    body: {
        fontSize: 14,
        color: Colors.textLight,
        lineHeight: 20,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
        marginLeft: 12,
        marginTop: 6,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyStateText: {
        color: Colors.textLight,
        marginTop: 16,
        fontSize: 16,
    }
});
