import { ThemedText } from '@/components/themed-text';
import { OutfitSlot } from '@/features/outfits/components/OutfitSlot';
import { useOutfitGenerator } from '@/features/outfits/hooks/useOutfitGenerator';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OutfitScreen() {
    const {
        slots,
        locked,
        loading,
        weather,
        generateOutfit,
        toggleLock,
        cycleSlot,
        slotOptions,
        confirmOutfit
    } = useOutfitGenerator();

    const handleConfirm = async () => {
        const success = await confirmOutfit();
        if (success) {
            alert('Outfit recorded! Laundry counts updated.');
        }
    };

    // Auto-generate on first load if empty
    useEffect(() => {
    }, []);

    const hasOutfit = slots.Bottoms || slots.Tops;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <ThemedText type="title">Stylist</ThemedText>
                <View style={styles.weatherBadge}>
                    {weather ? (
                        <>
                            <Ionicons name="partly-sunny" size={16} color="#4f46e5" />
                            <Text style={styles.weatherText}>{weather}</Text>
                        </>
                    ) : (
                        <>
                            <ActivityIndicator size="small" color="#4f46e5" />
                            <Text style={[styles.weatherText, { marginLeft: 6 }]}>Loading weather...</Text>
                        </>
                    )}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Intro / Empty State */}
                {/* Clean Start - AI will generate on button press */}

                {/* Slots Stack */}
                {/* Headwear */}
                <OutfitSlot
                    slotName="Headwear"
                    item={slots.Headwear}
                    isLocked={locked.Headwear}
                    onLock={() => toggleLock('Headwear')}
                    onPrev={() => cycleSlot('Headwear', 'prev')}
                    onNext={() => cycleSlot('Headwear', 'next')}
                    showControls={(slotOptions.Headwear?.length || 0) > 1}
                />

                {/* Outerwear */}
                <OutfitSlot
                    slotName="Outerwear"
                    item={slots.Outerwear}
                    isLocked={locked.Outerwear}
                    onLock={() => toggleLock('Outerwear')}
                    onPrev={() => cycleSlot('Outerwear', 'prev')}
                    onNext={() => cycleSlot('Outerwear', 'next')}
                    showControls={(slotOptions.Outerwear?.length || 0) > 1}
                />

                {/* Tops */}
                <OutfitSlot
                    slotName="Tops"
                    item={slots.Tops}
                    isLocked={locked.Tops}
                    onLock={() => toggleLock('Tops')}
                    onPrev={() => cycleSlot('Tops', 'prev')}
                    onNext={() => cycleSlot('Tops', 'next')}
                    showControls={(slotOptions.Tops?.length || 0) > 1}
                />

                {/* Bottoms (Anchor usually) */}
                <OutfitSlot
                    slotName="Bottoms"
                    item={slots.Bottoms}
                    isLocked={locked.Bottoms}
                    onLock={() => toggleLock('Bottoms')}
                    onPrev={() => cycleSlot('Bottoms', 'prev')}
                    onNext={() => cycleSlot('Bottoms', 'next')}
                    showControls={(slotOptions.Bottoms?.length || 0) > 1}
                />

                {/* Footwear */}
                <OutfitSlot
                    slotName="Footwear"
                    item={slots.Footwear}
                    isLocked={locked.Footwear}
                    onLock={() => toggleLock('Footwear')}
                    onPrev={() => cycleSlot('Footwear', 'prev')}
                    onNext={() => cycleSlot('Footwear', 'next')}
                    showControls={(slotOptions.Footwear?.length || 0) > 1}
                />

            </ScrollView>

            <View style={styles.footer}>
                {!hasOutfit ? (
                    <TouchableOpacity
                        style={styles.remixBtn}
                        onPress={generateOutfit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="sparkles" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.remixBtnText}>Create New Outfit</Text>
                            </>
                        )}
                    </TouchableOpacity>
                ) : (
                    <View style={styles.actionRow}>
                        {/* Wear It (Small, Check Only) */}
                        <TouchableOpacity
                            style={[styles.remixBtn, styles.wearBtn]}
                            onPress={handleConfirm}
                            disabled={loading}
                        >
                            <Ionicons name="checkmark-sharp" size={28} color="#fff" />
                        </TouchableOpacity>

                        {/* Generate (Primary, Large) */}
                        <TouchableOpacity
                            style={[styles.remixBtn, styles.primaryBtn]}
                            onPress={generateOutfit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="sparkles" size={20} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.remixBtnText}>Generate</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    weatherBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0e7ff',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    weatherText: {
        fontSize: 12,
        color: '#4f46e5',
        fontWeight: '600',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    emptyState: {
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1e293b',
    },
    emptyDesc: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        paddingHorizontal: 30,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    remixBtn: {
        backgroundColor: '#000',
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    wearBtn: {
        width: 56,
        backgroundColor: '#10b981', // Emerald Green
    },
    primaryBtn: {
        flex: 1,
        // Inherits Black from remixBtn
    },
    remixBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
