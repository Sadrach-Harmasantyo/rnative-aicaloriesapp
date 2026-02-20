import { addDays, format, isSameDay, startOfWeek, subWeeks } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";

interface CalendarStripProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}

const { width } = Dimensions.get('window');
// Calculate exactly 1/7th of screen width for each item
const ITEM_WIDTH = width / 7;
// Set a fixed width/height for the touchable item to create a perfect circle holding both texts
const ITEM_PADDING = 4;
const SHAPE_SIZE = ITEM_WIDTH - (ITEM_PADDING * 2);

export function CalendarStrip({ selectedDate, onSelectDate }: CalendarStripProps) {
    const flatListRef = useRef<FlatList>(null);
    const [dates, setDates] = useState<Date[]>([]);

    const today = new Date();

    // Generate past weeks and current week ONLY
    useEffect(() => {
        const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
        const pastWeeks = 4;
        const totalWeeks = pastWeeks + 1; // 4 past + 1 current

        const startDate = subWeeks(startOfCurrentWeek, pastWeeks);

        const generatedDates = [];
        for (let i = 0; i < totalWeeks * 7; i++) {
            generatedDates.push(addDays(startDate, i));
        }
        setDates(generatedDates);
    }, []);

    // Initial scroll to the start of the week containing today or selected date
    useEffect(() => {
        if (dates.length > 0 && flatListRef.current) {
            // Find index of the Monday of the week containing the selected date
            const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
            const selectedWeekIndex = dates.findIndex(d => isSameDay(d, weekStart));

            if (selectedWeekIndex !== -1) {
                setTimeout(() => {
                    flatListRef.current?.scrollToIndex({
                        index: selectedWeekIndex,
                        animated: true,
                        // viewPosition 0 aligns the start of the week exactly to the left edge
                        viewPosition: 0,
                    });
                }, 100);
            }
        }
    }, [dates, selectedDate]);

    const renderItem = ({ item }: { item: Date }) => {
        const isSelected = isSameDay(item, selectedDate);
        const isToday = isSameDay(item, today);

        return (
            <View style={styles.itemWrapper}>
                <TouchableOpacity
                    style={[
                        styles.dateShapePill,
                        isSelected ? styles.selectedPill : styles.defaultPill
                    ]}
                    onPress={() => onSelectDate(item)}
                >
                    <Text style={[
                        styles.dayText,
                        isSelected ? styles.selectedDayText : styles.defaultDayText
                    ]} allowFontScaling={false}>
                        {format(item, "EEE")}
                    </Text>

                    <View style={styles.dateCircle}>
                        <Text style={[styles.dateText]} allowFontScaling={false}>
                            {format(item, "d")}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={dates}
                keyExtractor={(item) => item.toISOString()}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled // Snaps by width of the screen
                snapToInterval={width - 32} // Card padding compensation
                decelerationRate="fast"
                contentContainerStyle={styles.listContainer}
                getItemLayout={(data, index) => (
                    { length: ITEM_WIDTH, offset: ITEM_WIDTH * index, index }
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // Removed margins/borders because it's now wrapped in a Card in index.tsx
        paddingVertical: 4,
    },
    listContainer: {
        paddingHorizontal: 8,
    },
    itemWrapper: {
        width: (width - 48) / 7, // Adjust item width based on Card width
        alignItems: "center",
        justifyContent: "center",
    },
    dateShapePill: {
        width: 44, // Fixed pill width
        height: 80, // Fixed pill height
        borderRadius: 24, // High radius for pill shape
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 6,
    },
    defaultPill: {
        backgroundColor: '#f3f4f6', // Light gray background for unselected
    },
    selectedPill: {
        backgroundColor: Colors.primary, // Green background for selected
    },
    dayText: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 4,
    },
    defaultDayText: {
        color: Colors.textLight,
    },
    selectedDayText: {
        color: Colors.white,
    },
    dateCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: Colors.white,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    dateText: {
        fontSize: 14,
        fontWeight: "bold",
        color: Colors.text, // Always black/darks inside the white circle
    },
});
