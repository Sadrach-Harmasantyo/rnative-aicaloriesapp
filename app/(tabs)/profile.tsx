import { useAuth } from "@clerk/clerk-expo";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/Colors";

export default function ProfileScreen() {
    const { signOut } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>Manage your settings here.</Text>

            <TouchableOpacity onPress={() => signOut()} style={styles.button}>
                <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.background,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.text,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textLight,
        marginTop: 8,
        marginBottom: 32,
    },
    button: {
        backgroundColor: Colors.danger,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    buttonText: {
        color: Colors.white,
        fontWeight: '600',
        fontSize: 16,
    }
});
