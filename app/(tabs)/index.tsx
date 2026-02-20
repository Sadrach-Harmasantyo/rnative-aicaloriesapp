import { Colors } from "@/constants/Colors";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function Index() {
  const { signOut, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome {user?.firstName}!</Text>
      <Text style={styles.subtitle}>You are signed in to AI Calories Tracker.</Text>

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
    padding: 24,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 32,
    textAlign: 'center',
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
