import { Colors } from "@/constants/Colors";
import { useAuth } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import { useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalendarStrip } from "../../components/CalendarStrip";
import { CaloriesCard } from "../../components/CaloriesCard";
import { HomeHeader } from "../../components/HomeHeader";
import { RecentActivity } from "../../components/RecentActivity";
import { WaterCard } from "../../components/WaterCard";

export default function Index() {
  const { signOut, isSignedIn } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scrollTrigger, setScrollTrigger] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 100; // Trigger when within 100px of bottom
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      setScrollTrigger(prev => prev + 1);
    }
  };

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={['#86efac', Colors.background]} // Gradient from light green to background
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }} // Gradient ends about 30% down the page
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <HomeHeader />

          <View style={styles.calendarCardContainer}>
            <CalendarStrip
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </View>

          <CaloriesCard selectedDate={selectedDate} />
          <WaterCard selectedDate={selectedDate} />
          <RecentActivity selectedDate={selectedDate} loadMoreTrigger={scrollTrigger} />

          <View style={styles.content}>
            <TouchableOpacity onPress={() => signOut()} style={[styles.button, { marginTop: 40, alignSelf: 'center' }]}>
              <Text style={styles.buttonText}>Sign Out (Dev)</Text>
            </TouchableOpacity>
          </View>
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
  calendarCardContainer: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 3,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
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
