import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Colors } from "../constants/Colors";

interface AddActionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectAction: (action: 'exercise' | 'water' | 'database' | 'scan') => void;
}

export function AddActionModal({ visible, onClose, onSelectAction }: AddActionModalProps) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>

                            <View style={styles.gridContainer}>
                                {/* Row 1 */}
                                <View style={styles.row}>
                                    <TouchableOpacity
                                        style={styles.actionCard}
                                        onPress={() => onSelectAction('exercise')}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: '#fef3c7' }]}>
                                            <Ionicons name="barbell-outline" size={28} color="#f59e0b" />
                                        </View>
                                        <Text style={styles.actionText}>Log Exercise</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.actionCard}
                                        onPress={() => onSelectAction('water')}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: '#dbeafe' }]}>
                                            <Ionicons name="water-outline" size={28} color="#3b82f6" />
                                        </View>
                                        <Text style={styles.actionText}>Drink Water</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Row 2 */}
                                <View style={styles.row}>
                                    <TouchableOpacity
                                        style={styles.actionCard}
                                        onPress={() => onSelectAction('database')}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: '#fce7f3' }]}>
                                            <Ionicons name="search-outline" size={28} color="#ec4899" />
                                        </View>
                                        <Text style={styles.actionText}>Food Database</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.actionCard}
                                        onPress={() => onSelectAction('scan')}
                                    >
                                        {/* Premium Badge */}
                                        <View style={styles.premiumBadge}>
                                            <Ionicons name="star" size={10} color={Colors.white} />
                                            <Text style={styles.premiumText}>PRO</Text>
                                        </View>

                                        <View style={[styles.iconBox, { backgroundColor: Colors.primary + '20' }]}>
                                            <Ionicons name="scan-outline" size={28} color={Colors.primary} />
                                        </View>
                                        <Text style={styles.actionText}>Scan Food</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

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
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modalContainer: {
        width: '100%',
        backgroundColor: 'transparent',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 32,
        paddingBottom: 110, // Extra padding to accommodate the bottom tab bar/floating button
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    gridContainer: {
        width: '100%',
        gap: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 16,
    },
    actionCard: {
        flex: 1,
        backgroundColor: '#f9fafb',
        borderRadius: 20,
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        position: 'relative', // for absolute premium badge
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text,
        textAlign: 'center',
    },
    premiumBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#f59e0b', // Gold color
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 12,
        gap: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    premiumText: {
        color: Colors.white,
        fontSize: 9,
        fontWeight: 'bold',
    }
});
