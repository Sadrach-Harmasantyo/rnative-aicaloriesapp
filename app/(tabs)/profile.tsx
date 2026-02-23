import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";

export default function ProfileScreen() {
    const { signOut } = useAuth();
    const { user } = useUser();

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <LinearGradient
                colors={['#86efac', Colors.background]} // Gradient from light green to background
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.3 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.headerTitle}>Profile</Text>

                    {/* User Info Card */}
                    <View style={styles.userInfoCard}>
                        {user?.imageUrl ? (
                            <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Ionicons name="person-outline" size={32} color={Colors.textLight} />
                            </View>
                        )}
                        <View style={styles.userInfoTextContainer}>
                            <Text style={styles.userName}>{user?.fullName || "Guest"}</Text>
                            <Text style={styles.userEmail}>
                                {user?.primaryEmailAddress?.emailAddress || "user@example.com"}
                            </Text>
                        </View>
                    </View>

                    {/* Free Trial Banner */}
                    <TouchableOpacity style={styles.trialBanner}>
                        <View style={styles.trialIconContainer}>
                            <Ionicons name="star" size={24} color="#f59e0b" />
                        </View>
                        <View style={styles.trialTextContainer}>
                            <Text style={styles.trialTitle}>Start free trial</Text>
                            <Text style={styles.trialSubtitle}>Start 7 days Free trial</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
                    </TouchableOpacity>

                    {/* Account Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Account</Text>
                    </View>
                    <View style={styles.sectionCard}>
                        <TouchableOpacity style={styles.optionRow} onPress={() => router.push('/personal-details')}>
                            <View style={styles.optionIconContainer}>
                                <Ionicons name="person-outline" size={20} color={Colors.primary} />
                            </View>
                            <Text style={styles.optionText}>Personal details</Text>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.optionRow} onPress={() => router.push('/preferences')}>
                            <View style={styles.optionIconContainer}>
                                <Ionicons name="options-outline" size={20} color={Colors.primary} />
                            </View>
                            <Text style={styles.optionText}>Preferences</Text>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.optionRow}>
                            <View style={styles.premiumIconContainer}>
                                <Ionicons name="diamond-outline" size={20} color="#f59e0b" />
                            </View>
                            <Text style={styles.optionText}>Upgrade to premium features</Text>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
                        </TouchableOpacity>
                    </View>

                    {/* Support Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Support</Text>
                    </View>
                    <View style={styles.sectionCard}>
                        <TouchableOpacity style={styles.optionRow} onPress={() => router.push('/request-feature')}>
                            <View style={styles.optionIconContainer}>
                                <Ionicons name="bulb-outline" size={20} color={Colors.primary} />
                            </View>
                            <Text style={styles.optionText}>Request new features</Text>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.optionRow} onPress={() => Linking.openURL('mailto:admin@nativecal.com?subject=Support%20Request')}>
                            <View style={styles.optionIconContainer}>
                                <Ionicons name="chatbubbles-outline" size={20} color={Colors.primary} />
                            </View>
                            <Text style={styles.optionText}>Contact us</Text>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.optionRow} onPress={() => router.push('/terms-condition')}>
                            <View style={styles.optionIconContainer}>
                                <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
                            </View>
                            <Text style={styles.optionText}>Terms and condition</Text>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.optionRow} onPress={() => router.push('/privacy-policy')}>
                            <View style={styles.optionIconContainer}>
                                <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
                            </View>
                            <Text style={styles.optionText}>Privacy policy</Text>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
                        </TouchableOpacity>
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity onPress={() => signOut()} style={styles.logoutButton}>
                        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
                        <Text style={styles.logoutButtonText}>Log out</Text>
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>
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
    scrollContent: {
        padding: 24,
        paddingBottom: 100,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "900",
        color: Colors.text,
        marginBottom: 24,
    },
    userInfoCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    profileImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    placeholderImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.inputBackground,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    userInfoTextContainer: {
        marginLeft: 16,
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.text,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: Colors.textLight,
    },
    trialBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 16,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: "#fde68a",
        shadowColor: "#f59e0b",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    trialIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#fef3c7",
        justifyContent: 'center',
        alignItems: 'center',
    },
    trialTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    trialTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.text,
        marginBottom: 2,
    },
    trialSubtitle: {
        fontSize: 13,
        color: Colors.textLight,
        fontWeight: '500',
    },
    premiumIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#fef3c7",
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sectionHeader: {
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.text,
    },
    sectionCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        paddingHorizontal: 16,
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
    },
    optionIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionText: {
        flex: 1,
        fontSize: 15,
        fontWeight: "600",
        color: Colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginLeft: 48,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        borderRadius: 16,
        paddingVertical: 16,
        marginTop: 8,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: Colors.danger,
    },
    logoutButtonText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: Colors.danger,
    }
});
