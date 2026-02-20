import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";

export function HomeHeader() {
    const { user } = useUser();

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
            <TouchableOpacity style={styles.notificationButton}>
                <Ionicons name="notifications-outline" size={24} color={Colors.text} />
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
    }
});
