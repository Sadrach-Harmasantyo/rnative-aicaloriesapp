import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/Colors";

// Custom Floating Action Button
const CustomTabBarButton = ({ children, onPress }: any) => (
    <View style={styles.floatingButtonPlaceholder}>
        <TouchableOpacity
            style={styles.floatingButton}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Ionicons name="add" size={32} color={Colors.white} />
        </TouchableOpacity>
    </View>
);

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                // Enable labels (show under icons)
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    marginTop: 4,
                },
                // Enable floating effect
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: Colors.white,
                tabBarInactiveTintColor: '#A0A0A0', // Gray for inactive
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    title: "Analytics",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
                    ),
                }}
            />

            {/* Floating Plus Button (Placed after the 3 tabs) */}
            <Tabs.Screen
                name="add"
                options={{
                    title: "", // No title for the add button
                    tabBarButton: (props) => <CustomTabBarButton {...props} />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 100, // Leave space for the floating button on the right
        elevation: 0,
        backgroundColor: '#1C1C1E', // Dark/Black from image
        borderRadius: 35, // Pill shape
        height: 70,
        borderTopWidth: 0, // Remove default top border
        paddingBottom: Platform.OS === 'ios' ? 20 : 10, // Adjust padding for labels
        paddingTop: 10,
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        ...Platform.select({
            android: {
                elevation: 10,
            }
        })
    },
    floatingButtonPlaceholder: {
        position: 'absolute',
        bottom: 30, // Align vertically with the tab bar
        right: 20,  // Far right of the screen
        zIndex: 10,
    },
    floatingButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        // Shadow for the fab itself
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    }
});
