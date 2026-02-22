import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FoodSearchResult, searchFoods } from "../services/fatsecretService";

export default function SearchFoodScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [results, setResults] = useState<FoodSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Debounce keystrokes
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500); // 500ms delay
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Fetch on debounced query change
    useEffect(() => {
        if (debouncedQuery.trim().length >= 3) {
            handleSearch(debouncedQuery);
        } else if (debouncedQuery.trim().length === 0) {
            setResults([]);
            setError(null);
        }
    }, [debouncedQuery]);

    const handleSearch = async (query: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await searchFoods(query, 10); // Fetch top 10 to give good variety
            setResults(data);
            if (data.length === 0) {
                setError("No foods found matching that description.");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to search foods. Please try again.");
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const renderFoodItem = useCallback(({ item }: { item: FoodSearchResult }) => {
        const { calories, servingSize, original } = item;
        return (
            <View style={styles.foodCard}>
                <View style={styles.foodInfo}>
                    <Text style={styles.foodName} numberOfLines={1}>{original.food_name}</Text>
                    <Text style={styles.servingText} numberOfLines={1}>{servingSize}</Text>
                    <View style={styles.calorieBadge}>
                        <Ionicons name="flame" size={14} color="#f59e0b" style={{ marginRight: 4 }} />
                        <Text style={styles.calorieText}>{calories} kcal</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        router.push({
                            pathname: "/log-food",
                            params: {
                                foodName: original.food_name,
                                servingSize: servingSize,
                                calories: calories.toString(),
                                protein: item.protein.toString(),
                                carbs: item.carbs.toString(),
                                fat: item.fat.toString()
                            }
                        });
                    }}
                >
                    <Ionicons name="add" size={24} color={Colors.white} />
                </TouchableOpacity>
            </View>
        );
    }, []);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Search Food</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.container}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={Colors.textLight} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for food (e.g., Apple, Chicken)"
                        placeholderTextColor={Colors.textLight}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus={true}
                        returnKeyType="search"
                        clearButtonMode="while-editing"
                    />
                </View>

                {loading ? (
                    <View style={styles.centerStage}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.loadingText}>Searching Database...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.centerStage}>
                        <Ionicons name="alert-circle-outline" size={48} color={Colors.textLight} />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : results.length > 0 ? (
                    <FlatList
                        data={results}
                        keyExtractor={(item, index) => item.original.food_id || index.toString()}
                        renderItem={renderFoodItem}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    />
                ) : (
                    <View style={styles.centerStage}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="fast-food-outline" size={48} color={Colors.primary} />
                        </View>
                        <Text style={styles.emptyHeader}>Find Your Food</Text>
                        <Text style={styles.emptySubtext}>
                            Type at least 3 characters to search the FatSecret global database.
                        </Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backButton: {
        padding: 8,
        width: 44,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    container: {
        flex: 1,
        backgroundColor: '#f9fafb', // very light gray background
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        marginHorizontal: 16,
        marginVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 16,
        height: 56,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 40,
        gap: 12,
    },
    foodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    foodInfo: {
        flex: 1,
        marginRight: 12,
    },
    foodName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    servingText: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 8,
    },
    calorieBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffbeb',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    calorieText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#d97706',
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    centerStage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        marginTop: -100, // Visual adjustment to true center
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.textLight,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.textLight,
        textAlign: 'center',
        lineHeight: 22,
    },
    emptyIconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: Colors.primary + '10', // 10% opacity
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 12,
    },
    emptySubtext: {
        fontSize: 15,
        color: Colors.textLight,
        textAlign: 'center',
        lineHeight: 22,
    }
});
