
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';


interface OutfitSlotProps {
    slotName: string;
    item: any | null;
    isLocked: boolean;
    onPrev?: () => void;
    onNext?: () => void;
    onLock: () => void;
    onSelect?: () => void;
    showControls?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const OutfitSlot = ({ slotName, item, isLocked, onPrev, onNext, onLock, onSelect, showControls = true }: OutfitSlotProps) => {
    return (
        <Animated.View
            entering={FadeInDown}
            layout={LinearTransition.springify()}
            style={styles.container}
        >
            <View style={styles.leftCol}>
                <Text style={styles.slotLabel}>{slotName}</Text>
                {item ? (
                    <TouchableOpacity onPress={onSelect} activeOpacity={0.8}>
                        <Image
                            source={{ uri: item.image_uri }}
                            style={styles.image}
                            contentFit="cover"
                            transition={200}
                        />
                    </TouchableOpacity>
                ) : (
                    <View style={[styles.image, styles.emptyPlaceholder]}>
                        <Ionicons name="shirt-outline" size={32} color="#ccc" />
                    </View>
                )}
            </View>

            <View style={styles.rightCol}>
                <View style={styles.info}>
                    <Text style={styles.itemName} numberOfLines={2}>
                        {item ? `${item.metadata.primaryColor} ${item.metadata.subCategory} ` : 'Empty'}
                    </Text>
                    {item && (
                        <Text style={styles.itemCategory}>{item.metadata.category}</Text>
                    )}
                </View>

                <View style={styles.actions}>
                    {/* Lock Button */}
                    <TouchableOpacity
                        style={[styles.actionBtn, isLocked && styles.lockedBtn]}
                        onPress={onLock}
                        disabled={!item}
                    >
                        <Ionicons
                            name={isLocked ? "lock-closed" : "lock-open-outline"}
                            size={20}
                            color={isLocked ? "#fff" : "#000"}
                        />
                    </TouchableOpacity>

                    {/* Navigation Controls */}
                    {showControls && (
                        <View style={styles.navControls}>
                            <TouchableOpacity
                                style={[styles.navBtn, isLocked && styles.disabledBtn]}
                                onPress={onPrev}
                                disabled={isLocked || !item}
                            >
                                <Ionicons name="chevron-back" size={20} color={isLocked ? "#ccc" : "#000"} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.navBtn, isLocked && styles.disabledBtn]}
                                onPress={onNext}
                                disabled={isLocked || !item}
                            >
                                <Ionicons name="chevron-forward" size={20} color={isLocked ? "#ccc" : "#000"} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    leftCol: {
        marginRight: 16,
        alignItems: 'center',
    },
    slotLabel: {
        fontSize: 10,
        textTransform: 'uppercase',
        color: '#999',
        fontWeight: '600',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
    },
    emptyPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
        borderStyle: 'dashed',
    },
    rightCol: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    info: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    itemCategory: {
        fontSize: 12,
        color: '#666',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Spread lock and nav
        alignItems: 'center',
        marginTop: 8,
    },
    actionBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockedBtn: {
        backgroundColor: '#000',
    },
    navControls: {
        flexDirection: 'row',
        gap: 8,
    },
    navBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledBtn: {
        opacity: 0.5,
        backgroundColor: '#f9fafb',
    }
});
