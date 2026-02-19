
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
// import { ArrowLeft01Icon, ArrowRight01Icon, Female02Icon, HeightIcon, Male02Icon, TargetIcon, WeightScaleIcon } from 'hugeicons-react-native';
import { FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [currentStep, setCurrentStep] = useState(0);
    const totalSteps = 5;

    // Form State
    const [gender, setGender] = useState<string | null>(null);
    const [goal, setGoal] = useState<string | null>(null);
    const [workoutFrequency, setWorkoutFrequency] = useState<string | null>(null);
    const [birthDate, setBirthDate] = useState({ day: '', month: '', year: '' });
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');

    const handleNext = async () => {
        if (currentStep < totalSteps - 1) {
            // Validation per step
            if (currentStep === 0 && !gender) return Alert.alert("Required", "Please select your gender");
            if (currentStep === 1 && !goal) return Alert.alert("Required", "Please select your goal");
            if (currentStep === 2 && !workoutFrequency) return Alert.alert("Required", "Please select workout frequency");
            if (currentStep === 3 && (!birthDate.day || !birthDate.month || !birthDate.year)) return Alert.alert("Required", "Please enter birthdate");

            setCurrentStep(currentStep + 1);
        } else {
            // Final Step - Save Data
            if (!height || !weight) return Alert.alert("Required", "Please enter height and weight");

            await saveData();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const saveData = async () => {
        if (!user) return;

        // Navigate to Generating Screen with data
        router.push({
            pathname: "/onboarding/generating",
            params: {
                gender,
                goal,
                workoutFrequency,
                birthDate: JSON.stringify(birthDate),
                height,
                weight,
            }
        });
    };

    const progress = ((currentStep + 1) / totalSteps) * 100;

    const renderStep = () => {
        switch (currentStep) {
            case 0: // Gender
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Tell us about yourself!</Text>
                        <Text style={styles.stepSubtitle}>To give you a better experience we need to know your gender</Text>

                        <View style={styles.selectionContainer}>
                            <TouchableOpacity
                                style={[styles.card, gender === 'Male' && styles.cardSelected]}
                                onPress={() => setGender('Male')}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name="male" size={40} color={gender === 'Male' ? Colors.white : Colors.primary} />
                                </View>
                                <Text style={[styles.cardText, gender === 'Male' && styles.cardTextSelected]}>Male</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.card, gender === 'Female' && styles.cardSelected]}
                                onPress={() => setGender('Female')}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name="female" size={40} color={gender === 'Female' ? Colors.white : Colors.primary} />
                                </View>
                                <Text style={[styles.cardText, gender === 'Female' && styles.cardTextSelected]}>Female</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 1: // Goal
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>What is your main goal?</Text>
                        <Text style={styles.stepSubtitle}>This helps us create a personalized plan for you</Text>

                        <View style={styles.listContainer}>
                            {['Lose Weight', 'Maintain Weight', 'Gain Weight'].map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={[styles.listItem, goal === item && styles.listItemSelected]}
                                    onPress={() => setGoal(item)}>
                                    <MaterialCommunityIcons name="target" size={24} color={goal === item ? Colors.white : Colors.text} />
                                    <Text style={[styles.listItemText, goal === item && styles.listItemTextSelected]}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );
            case 2: // Workout Frequency
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>How often do you workout?</Text>
                        <Text style={styles.stepSubtitle}>This helps us calculate your calorie needs</Text>

                        <View style={styles.listContainer}>
                            {['Little or No Exercise', '2-3 Days/Week', '3-4 Days/Week', '5-6 Days/Week', 'Every Day'].map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={[styles.listItem, workoutFrequency === item && styles.listItemSelected]}
                                    onPress={() => setWorkoutFrequency(item)}>
                                    <Text style={[styles.listItemText, workoutFrequency === item && styles.listItemTextSelected]}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );
            case 3: // Birthdate
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>When were you born?</Text>
                        <Text style={styles.stepSubtitle}>We use this to calculate your age</Text>

                        <View style={styles.dateInputContainer}>
                            <TextInput
                                style={styles.dateInput}
                                placeholder="DD"
                                keyboardType="numeric"
                                maxLength={2}
                                value={birthDate.day}
                                onChangeText={(t) => setBirthDate({ ...birthDate, day: t })}
                            />
                            <TextInput
                                style={styles.dateInput}
                                placeholder="MM"
                                keyboardType="numeric"
                                maxLength={2}
                                value={birthDate.month}
                                onChangeText={(t) => setBirthDate({ ...birthDate, month: t })}
                            />
                            <TextInput
                                style={styles.dateInput}
                                placeholder="YYYY"
                                keyboardType="numeric"
                                maxLength={4}
                                value={birthDate.year}
                                onChangeText={(t) => setBirthDate({ ...birthDate, year: t })}
                            />
                        </View>
                    </View>
                );
            case 4: // Metrics
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Your Body Metrics</Text>
                        <Text style={styles.stepSubtitle}>Enter your height and weight</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Height (cm)</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="human-male-height" size={24} color={Colors.textLight} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter height"
                                    keyboardType="numeric"
                                    value={height}
                                    onChangeText={setHeight}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Weight (kg)</Text>
                            <View style={styles.inputWrapper}>
                                <FontAwesome6 name="weight-scale" size={24} color={Colors.textLight} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter weight"
                                    keyboardType="numeric"
                                    value={weight}
                                    onChangeText={setWeight}
                                />
                            </View>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {renderStep()}
            </ScrollView>

            <View style={styles.footer}>
                {currentStep > 0 && (
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>{currentStep === totalSteps - 1 ? "Finish" : "Next"}</Text>
                    <Ionicons name="arrow-forward" size={24} color={Colors.white} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: '#e5e7eb',
        marginTop: Platform.OS === 'ios' ? 60 : 40,
        marginHorizontal: 24,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 3,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 24,
    },
    stepContainer: {
        flex: 1,
        marginTop: 20,
    },
    stepTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    stepSubtitle: {
        fontSize: 16,
        color: Colors.textLight,
        textAlign: 'center',
        marginBottom: 40,
    },
    selectionContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    card: {
        width: 140,
        height: 140,
        borderRadius: 20,
        backgroundColor: Colors.inputBackground,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    cardSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    iconContainer: {
        marginBottom: 12,
    },
    cardText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    cardTextSelected: {
        color: Colors.white,
    },
    listContainer: {
        gap: 12,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBackground,
        padding: 20,
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
    },
    listItemSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    listItemText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    listItemTextSelected: {
        color: Colors.white,
    },
    dateInputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    dateInput: {
        backgroundColor: Colors.inputBackground,
        width: 80,
        height: 60,
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBackground,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
    },
    input: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        color: Colors.text,
    },
    footer: {
        flexDirection: 'row',
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.inputBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextButton: {
        flex: 1,
        flexDirection: 'row',
        height: 56,
        backgroundColor: Colors.primary,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 16,
        gap: 8,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    nextButtonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
