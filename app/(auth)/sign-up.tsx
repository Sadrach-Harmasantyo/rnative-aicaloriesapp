
import { useOAuth, useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useWarmUpBrowser } from "../../hooks/useWarmUpBrowser";
import { saveUserToFirestore } from "../../services/userService";

export default function SignUpScreen() {
    useWarmUpBrowser();
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();
    const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

    const [emailAddress, setEmailAddress] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [pendingVerification, setPendingVerification] = React.useState(false);
    const [code, setCode] = React.useState("");

    const onSignUpPress = async () => {
        if (!isLoaded) return;

        try {
            await signUp.create({
                emailAddress,
                password,
            });

            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

            setPendingVerification(true);
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            alert(err.errors ? err.errors[0].message : "Something went wrong");
        }
    };

    const onPressVerify = async () => {
        if (!isLoaded) return;

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (completeSignUp.status === "complete") {
                await setActive({ session: completeSignUp.createdSessionId });

                await saveUserToFirestore({
                    id: completeSignUp.createdUserId!,
                    email: emailAddress,
                });

                router.replace("/");
            } else {
                console.error(JSON.stringify(completeSignUp, null, 2));
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            alert(err.errors ? err.errors[0].message : "Something went wrong");
        }
    };

    const onGoogleSignUpPress = React.useCallback(async () => {
        try {
            const { createdSessionId, signIn, signUp, setActive } =
                await startOAuthFlow();

            if (createdSessionId) {
                await setActive!({ session: createdSessionId });

                // Try to save user. If this is a new signup, signUp object should have info, 
                // but often with OAuth implicit flows we need to check currentUser after auth. 
                // For now, if we can trigger it:
                // Use a lightweight approach or leave to a post-auth check.

                router.replace("/");
            }
        } catch (err) {
            console.error("OAuth error", err);
        }
    }, []);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.headerContainer}>
                    <Image source={require('../../assets/images/react-logo.png')} style={styles.logo} />
                    <Text style={styles.title}>{pendingVerification ? "Verify Email" : "Create Account"}</Text>
                    <Text style={styles.subtitle}>{pendingVerification ? "Check your email for the code" : "Sign up to get started"}</Text>
                </View>

                {!pendingVerification && (
                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                autoCapitalize="none"
                                value={emailAddress}
                                placeholder="Enter your email"
                                placeholderTextColor="#9ca3af"
                                onChangeText={(email) => setEmailAddress(email)}
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                value={password}
                                placeholder="Create a password"
                                placeholderTextColor="#9ca3af"
                                secureTextEntry={true}
                                onChangeText={(password) => setPassword(password)}
                                style={styles.input}
                            />
                        </View>

                        <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
                            <Text style={styles.buttonText}>Sign Up</Text>
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.divider} />
                        </View>

                        <TouchableOpacity style={styles.googleButton} onPress={onGoogleSignUpPress}>
                            <Text style={styles.googleButtonText}>Sign up with Google</Text>
                        </TouchableOpacity>

                        <View style={styles.footerContainer}>
                            <Text style={styles.footerText}>Already have an account?</Text>
                            <Link href="/sign-in" asChild>
                                <TouchableOpacity>
                                    <Text style={styles.linkText}> Sign In</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                )}

                {pendingVerification && (
                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Verification Code</Text>
                            <TextInput
                                value={code}
                                placeholder="Enter 6-digit code"
                                placeholderTextColor="#9ca3af"
                                onChangeText={(code) => setCode(code)}
                                style={styles.input}
                            />
                        </View>

                        <TouchableOpacity style={styles.button} onPress={onPressVerify}>
                            <Text style={styles.buttonText}>Verify Email</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '500',
    },
    formContainer: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: '#1f2937',
    },
    button: {
        backgroundColor: '#4f46e5',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#4f46e5',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 32,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#e5e7eb',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#9ca3af',
        fontWeight: '500',
    },
    googleButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    googleButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        color: '#6b7280',
        fontSize: 14,
    },
    linkText: {
        color: '#4f46e5',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
