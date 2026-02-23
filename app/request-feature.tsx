import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { FeatureRequest, getFeatureRequests, submitFeatureRequest, toggleUpvote } from "../services/supportService";

export default function RequestFeatureScreen() {
    const { userId } = useAuth();
    const { user } = useUser();

    const [features, setFeatures] = useState<FeatureRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Inputs
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const fetchFeatures = async () => {
        setLoading(true);
        const data = await getFeatureRequests();
        setFeatures(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchFeatures();
    }, []);

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            Alert.alert("Missing Input", "Please provide a title and description for your idea.");
            return;
        }

        if (!userId) return;

        setIsSubmitting(true);

        const newReq: Omit<FeatureRequest, 'id'> = {
            title: title.trim(),
            description: description.trim(),
            userId: userId,
            userFullName: user?.fullName || "Anonymous Explorer",
            upvotes: 1, // Start with 1 upvote from the creator
            upvotedBy: [userId],
            createdAt: Date.now()
        };

        const result = await submitFeatureRequest(newReq);

        if (result) {
            setTitle("");
            setDescription("");
            setShowSuccessModal(true);
            await fetchFeatures(); // refresh the list
        } else {
            Alert.alert("Error", "Could not submit your idea. Please try again later.");
        }

        setIsSubmitting(false);
    };

    const handleToggleVote = async (request: FeatureRequest) => {
        if (!userId || !request.id) return;

        const isUpvoted = request.upvotedBy.includes(userId);

        // Optimistic UI update
        setFeatures(currentFeatures =>
            currentFeatures.map(f => {
                if (f.id === request.id) {
                    return {
                        ...f,
                        upvotes: isUpvoted ? f.upvotes - 1 : f.upvotes + 1,
                        upvotedBy: isUpvoted
                            ? f.upvotedBy.filter(id => id !== userId) // remove
                            : [...f.upvotedBy, userId] // add
                    };
                }
                return f;
            })
        );

        // Firestore update
        const success = await toggleUpvote(request.id, userId, isUpvoted);
        if (!success) {
            // Revert optimism if it failed
            await fetchFeatures();
        }
    };

    const renderItem = ({ item }: { item: FeatureRequest }) => {
        const isMyVote = userId ? item.upvotedBy.includes(userId) : false;

        return (
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDescription}>{item.description}</Text>
                    <Text style={styles.cardAuthor}>Requested by {item.userFullName}</Text>
                </View>

                <TouchableOpacity
                    style={[styles.upvoteContainer, isMyVote && styles.upvoteContainerActive]}
                    onPress={() => handleToggleVote(item)}
                >
                    <Ionicons
                        name={isMyVote ? "caret-up" : "caret-up-outline"}
                        size={24}
                        color={isMyVote ? Colors.primary : Colors.textLight}
                    />
                    <Text style={[styles.upvoteCount, isMyVote && styles.upvoteCountActive]}>
                        {item.upvotes}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Feature Requests</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Form Area */}
                <View style={styles.formContainer}>
                    <Text style={styles.formLabel}>Got an idea? Let us know!</Text>
                    <TextInput
                        style={styles.inputTitle}
                        placeholder="Feature Title"
                        placeholderTextColor={Colors.textLight}
                        value={title}
                        onChangeText={setTitle}
                        maxLength={50}
                    />
                    <TextInput
                        style={styles.inputDescription}
                        placeholder="Describe how it would work..."
                        placeholderTextColor={Colors.textLight}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                        maxLength={300}
                    />
                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Idea</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Community Feed */}
                <View style={styles.feedHeaderRow}>
                    <Text style={styles.feedTitle}>Community Ideas</Text>
                    <TouchableOpacity onPress={fetchFeatures}>
                        <Ionicons name="refresh" size={20} color={Colors.textLight} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.centerLoading}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={features}
                        keyExtractor={item => item.id || Math.random().toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="chatbubbles-outline" size={48} color={Colors.border} />
                                <Text style={styles.emptyStateText}>No features requested yet.{'\n'}Be the first!</Text>
                            </View>
                        }
                    />
                )}
            </KeyboardAvoidingView>

            {/* Success Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showSuccessModal}
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconContainer}>
                            <Ionicons name="checkmark-circle" size={80} color={Colors.primary} />
                        </View>
                        <Text style={styles.modalTitle}>Awesome!</Text>
                        <Text style={styles.modalText}>
                            Your feature request has been submitted to the community.
                        </Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowSuccessModal(false)}
                        >
                            <Text style={styles.modalButtonText}>Got it</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.text,
    },
    formContainer: {
        padding: 20,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 12,
    },
    inputTitle: {
        backgroundColor: Colors.inputBackground,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 12,
    },
    inputDescription: {
        backgroundColor: Colors.inputBackground,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        minHeight: 100,
        fontSize: 15,
        color: Colors.text,
        marginBottom: 16,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    feedHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 12,
    },
    feedTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    centerLoading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    cardContent: {
        flex: 1,
        paddingRight: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 14,
        color: Colors.textLight,
        lineHeight: 20,
        marginBottom: 8,
    },
    cardAuthor: {
        fontSize: 12,
        fontWeight: '500',
        color: Colors.primary,
    },
    upvoteContainer: {
        width: 50,
        height: 60,
        borderRadius: 12,
        backgroundColor: Colors.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    upvoteContainerActive: {
        backgroundColor: '#ebf5ed',
        borderColor: Colors.primary,
    },
    upvoteCount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textLight,
        marginTop: 2,
    },
    upvoteCountActive: {
        color: Colors.primary,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
    },
    emptyStateText: {
        textAlign: 'center',
        color: Colors.textLight,
        marginTop: 12,
        lineHeight: 22,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalIconContainer: {
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 16,
        color: Colors.textLight,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    modalButton: {
        backgroundColor: Colors.primary,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 32,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    }
});
