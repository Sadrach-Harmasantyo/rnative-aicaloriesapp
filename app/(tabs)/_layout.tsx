import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/Colors";

// Custom Floating Action Button
const CustomTabBarButton = ({ children, onPress }: any) => {
    const router = useRouter();
    return (
        <View>
            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => router.push('/add-log')}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={32} color={Colors.white} />
            </TouchableOpacity>
        </View>
    );
};

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: Colors.white,
                tabBarInactiveTintColor: '#A0A0A0', // Gray for inactive
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <Ionicons name={focused ? "home" : "home-outline"} size={28} color={Colors.primary} />
                    ),
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={28} color={Colors.primary} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={28} color={Colors.primary} />
                    ),
                }}
            />

            {/* Floating Plus Button (Placed after the 3 tabs) */}
            <Tabs.Screen
                name="add"
                options={{
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
        backgroundColor: Colors.background,
        borderRadius: 35, // Pill shape
        height: 68,
        marginHorizontal: 16,
        borderTopWidth: 0, // Remove default top border
        paddingBottom: 0, // Remove default inset padding
        paddingTop: 13,    // Center properly

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
    floatingButton: {
        marginTop: -6,
        marginLeft: 8,
        width: 56,
        height: 56,
        borderRadius: 30,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    }
});
