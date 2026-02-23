import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";
import { getUserNotificationHistory } from "../services/notificationStorage";

export function HomeHeader() {
    const { user } = useUser();
    const [hasUnread, setHasUnread] = useState(false);

    // Efficiently check for unread admin/system messages
    useFocusEffect(
        useCallback(() => {
            const checkUnread = async () => {
                if (user?.id) {
                    const history = await getUserNotificationHistory(user.id);
                    setHasUnread(history.some(n => !n.isRead));
                }
            };
            checkUnread();
        }, [user?.id])
    );

    return (
        <View style={styles.container}>
            {/* Left Area: Profile Image and Text */}
            <View style={styles.leftContainer}>
                {user?.imageUrl ? (
                    <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Ionicons name="person-outline" size={20} color={Colors.textLight} />
                    </View>
                )}

                <View style={styles.textContainer}>
                    <Text style={styles.welcomeText}>Welcome,</Text>
                    <Text style={styles.nameText}>
                        {user?.firstName || "Guest"}
                    </Text>
                </View>
            </View>

            {/* Right Area: Notification Bell */}
            <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => router.push('/notifications')}
            >
                <Ionicons name="notifications-outline" size={24} color={Colors.text} />
                {hasUnread && <View style={styles.badgeLine} />}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingTop: 16, // Add some top padding or rely on SafeAreaView from parent
        paddingBottom: 16,
        width: '100%',
    },
    leftContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    placeholderImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.inputBackground,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    textContainer: {
        marginLeft: 12,
    },
    welcomeText: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 2,
    },
    nameText: {
        fontSize: 20,
        fontWeight: "bold",
        color: Colors.text,
    },
    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.inputBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeLine: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.danger || '#ef4444',
        borderWidth: 2,
        borderColor: Colors.inputBackground,
    }
});
