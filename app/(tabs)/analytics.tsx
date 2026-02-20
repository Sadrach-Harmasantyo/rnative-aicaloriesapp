import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";

export default function AnalyticsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Analytics</Text>
            <Text style={styles.subtitle}>Your progress will appear here.</Text>
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
    }
});
