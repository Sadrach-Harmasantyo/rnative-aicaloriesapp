import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { Tabs, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { AddActionModal } from "../../components/AddActionModal";
import { ImagePickerModal } from "../../components/ImagePickerModal";
import { Colors } from "../../constants/Colors";

// Custom Floating Action Button
const CustomTabBarButton = ({ children, onPress }: any) => {
    return (
        <View>
            <TouchableOpacity
                style={styles.floatingButton}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={32} color={Colors.white} />
            </TouchableOpacity>
        </View>
    );
};

export default function TabLayout() {
    const [isAddModalVisible, setAddModalVisible] = useState(false);
    const [isPickerModalVisible, setPickerModalVisible] = useState(false);
    const router = useRouter();

    const handleActionSelect = (action: 'exercise' | 'water' | 'database' | 'scan') => {
        setAddModalVisible(false);
        // Navigate or handle based on action
        if (action === 'water') {
            router.push('/add-water');
        } else if (action === 'database') {
            router.push('/search-food');
        } else if (action === 'exercise') {
            router.push('/log-exercise');
        } else if (action === 'scan') {
            setPickerModalVisible(true);
        } else {
            console.log(`Action ${action} selected - functionality to be built`);
        }
    };

    const handleCamera = async () => {
        setPickerModalVisible(false);
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission Required", "Camera access is needed to take pictures.");
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            router.push({ pathname: '/analyze-food', params: { imageUri: result.assets[0].uri } });
        }
    };

    const handleGallery = async () => {
        setPickerModalVisible(false);
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission Required", "Gallery access is needed to select pictures.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            router.push({ pathname: '/analyze-food', params: { imageUri: result.assets[0].uri } });
        }
    };

    return (
        <>
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
                        tabBarButton: (props) => <CustomTabBarButton {...props} onPress={() => setAddModalVisible(true)} />,
                    }}
                />
            </Tabs>

            <AddActionModal
                visible={isAddModalVisible}
                onClose={() => setAddModalVisible(false)}
                onSelectAction={handleActionSelect}
            />

            <ImagePickerModal
                visible={isPickerModalVisible}
                onClose={() => setPickerModalVisible(false)}
                onSelectCamera={handleCamera}
                onSelectGallery={handleGallery}
            />
        </>
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
