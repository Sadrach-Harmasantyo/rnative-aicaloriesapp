import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Colors } from "../constants/Colors";

interface ImagePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectCamera: () => void;
    onSelectGallery: () => void;
}

export function ImagePickerModal({ visible, onClose, onSelectCamera, onSelectGallery }: ImagePickerModalProps) {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>

                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>Scan Food</Text>
                                <Text style={styles.subtitle}>Select a photo of your meal to analyze.</Text>
                            </View>

                            {/* Options */}
                            <View style={styles.optionsContainer}>
                                <TouchableOpacity style={styles.optionBtn} onPress={onSelectCamera}>
                                    <View style={[styles.iconBox, { backgroundColor: '#e0e7ff' }]}>
                                        <Ionicons name="camera" size={24} color="#4f46e5" />
                                    </View>
                                    <View style={styles.optionTextContainer}>
                                        <Text style={styles.optionTitle}>Take a Photo</Text>
                                        <Text style={styles.optionSubtitle}>Use your camera to scan a meal</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={Colors.border} />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.optionBtn} onPress={onSelectGallery}>
                                    <View style={[styles.iconBox, { backgroundColor: '#fce7f3' }]}>
                                        <Ionicons name="images" size={24} color="#db2777" />
                                    </View>
                                    <View style={styles.optionTextContainer}>
                                        <Text style={styles.optionTitle}>Upload from Gallery</Text>
                                        <Text style={styles.optionSubtitle}>Choose an existing photo</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={Colors.border} />
                                </TouchableOpacity>
                            </View>

                            {/* Cancel */}
                            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>

                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        width: '100%',
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
    },
    optionsContainer: {
        gap: 16,
        marginBottom: 24,
    },
    optionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    optionSubtitle: {
        fontSize: 13,
        color: Colors.textLight,
    },
    cancelBtn: {
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textLight,
    }
});
