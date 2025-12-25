import { CLOTHING_CATEGORIES, CLOTHING_TAGS, STANDARD_SUBCATEGORIES } from '@/services/ai/prompts';
import { ClothingAnalysis } from '@/services/ai/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, LayoutAnimation, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, UIManager, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ------------------------------------------------------------------
// Helper: Animated Chip Component for Smooth Transitions
// ------------------------------------------------------------------
interface ChipProps {
    label: string;
    isSelected: boolean;
    onPress: () => void;
    activeColor?: string;
    inactiveColor?: string;
    isSmall?: boolean;
}

const AnimatedChip = ({ label, isSelected, onPress, isSmall = false }: ChipProps) => {
    // Derived value for animation state (0 = inactive, 1 = active)
    const progress = useDerivedValue(() => {
        return withTiming(isSelected ? 1 : 0, { duration: 200 }); // Fast but smooth
    });

    const pressed = useSharedValue(0); // 0 = released, 1 = pressed

    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            [isSmall ? '#f5f5f5' : '#f0f0f0', '#000000']
        );

        return {
            backgroundColor,
            transform: [{ scale: withTiming(pressed.value ? 0.96 : 1, { duration: 100 }) }],
            opacity: withTiming(pressed.value ? 0.8 : 1, { duration: 100 })
        };
    });

    const textStyle = useAnimatedStyle(() => {
        const color = interpolateColor(
            progress.value,
            [0, 1],
            ['#333333', '#ffffff']
        );
        return { color };
    });

    return (
        <Pressable
            onPress={onPress}
            onPressIn={() => { pressed.value = 1; }}
            onPressOut={() => { pressed.value = 0; }}
        >
            <Animated.View style={[isSmall ? styles.chipSmall : styles.chip, animatedStyle]}>
                <Animated.Text style={[isSmall ? styles.chipTextSmall : styles.chipText, textStyle]}>
                    {label}
                </Animated.Text>
            </Animated.View>
        </Pressable>
    );
}

// ------------------------------------------------------------------
// Helper: Animated Button for scale press effect
// ------------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const AnimatedButton = ({ onPress, style, children, disabled }: { onPress?: () => void, style?: any, children: React.ReactNode, disabled?: boolean }) => {
    const pressed = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: withTiming(pressed.value ? 0.95 : 1, { duration: 100 }) }],
            opacity: withTiming(pressed.value || disabled ? 0.7 : 1, { duration: 100 })
        };
    });

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={() => { if (!disabled) pressed.value = 1; }}
            onPressOut={() => { if (!disabled) pressed.value = 0; }}
            disabled={disabled}
            style={[style, animatedStyle]}
        >
            {children}
        </AnimatedPressable>
    );
};

// ------------------------------------------------------------------

interface EditItemModalProps {
    visible: boolean;
    initialData: ClothingAnalysis | null;
    onSave: (data: ClothingAnalysis) => void;
    onDelete?: () => void;
    onCancel: () => void;
    // Laundry Props
    itemData?: {
        wear_count: number;
        max_wears: number | null;
        is_clean: boolean;
    } | null;
    onWear?: () => void;
    onDecrementWear?: () => void;
    onWash?: () => void;
    onMarkDirty?: () => void;

    isReadOnly?: boolean;
    imageUri?: string | null;
}

export const EditItemModal = ({
    visible,
    initialData,
    onSave,
    onDelete,
    onCancel,
    itemData,
    onWear,
    onDecrementWear,
    onWash,
    onMarkDirty,
    isReadOnly = false,
    imageUri
}: EditItemModalProps) => {
    if (!initialData) return null;

    const [form, setForm] = useState<ClothingAnalysis>(initialData);
    const [isEditing, setIsEditing] = useState(!isReadOnly);
    const insets = useSafeAreaInsets();

    // Sync form and reset state whenever modal visibility or data changes
    useEffect(() => {
        if (visible) {
            setForm(initialData);
            // Always reset to initial mode when re-opening
            setIsEditing(!isReadOnly);
        }
    }, [initialData, isReadOnly, visible]);

    // Helper to update form fields
    const updateField = (key: keyof ClothingAnalysis, value: any) => {
        if (!isEditing) return;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const toggleTag = (tag: string) => {
        if (!isEditing) return;
        const currentTags = form.tags || [];
        if (currentTags.includes(tag)) {
            updateField('tags', currentTags.filter(t => t !== tag));
        } else {
            updateField('tags', [...currentTags, tag]);
        }
    };

    const handleSave = () => {
        onSave(form);
    };

    const toggleEditMode = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsEditing(!isEditing);
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onCancel}>
            {/* Manually apply safe area insets as padding */}
            <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <View style={styles.header}>
                    {/* Spacer to keep title centered */}
                    <View style={{ width: 40 }} />
                    <Text style={styles.title}>
                        {isReadOnly ? 'Item Details' : (isEditing ? 'Editing Item' : 'Review Item')}
                    </Text>
                    <TouchableOpacity onPress={onCancel}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.form}>

                        {/* 0. Image Preview */}
                        {imageUri && (
                            <View style={styles.imagePreviewContainer}>
                                <Image
                                    source={{ uri: imageUri }}
                                    style={styles.imagePreview}
                                    contentFit="cover"
                                />
                            </View>
                        )}

                        {/* Laundry Status (Read Only Only) */}
                        {isReadOnly && itemData && (
                            <View style={styles.laundryContainer}>
                                <View style={styles.laundryInfo}>
                                    <View style={[styles.statusBadge, { backgroundColor: itemData.is_clean ? '#dcfce7' : '#fee2e2' }]}>
                                        <Text style={[styles.statusText, { color: itemData.is_clean ? '#166534' : '#991b1b' }]}>
                                            {itemData.is_clean ? 'Clean' : 'Needs Wash'}
                                        </Text>
                                    </View>
                                    <Text style={styles.wearCount}>
                                        Worn: {itemData.wear_count} / {itemData.max_wears === null ? '∞' : itemData.max_wears}
                                    </Text>
                                </View>

                                <View style={styles.laundryActions}>
                                    {/* Decrement Button */}
                                    <AnimatedButton
                                        style={[styles.laundryBtn, { backgroundColor: '#f3f4f6', flex: 0.5 }]}
                                        onPress={onDecrementWear}
                                        disabled={itemData.wear_count <= 0}
                                    >
                                        <Ionicons name="remove" size={24} color={itemData.wear_count > 0 ? "#000" : "#ccc"} />
                                    </AnimatedButton>

                                    {/* Increment Button */}
                                    <AnimatedButton
                                        style={[styles.laundryBtn, { backgroundColor: '#f3f4f6', flex: 0.5 }]}
                                        onPress={onWear}
                                    >
                                        <Ionicons name="add" size={24} color="#000" />
                                    </AnimatedButton>

                                    {/* Status Toggle */}
                                    {itemData.is_clean ? (
                                        <AnimatedButton
                                            style={[styles.laundryBtn, { backgroundColor: '#fff7ed' }]}
                                            onPress={onMarkDirty}
                                        >
                                            <Text style={[styles.laundryBtnText, { color: '#c2410c' }]}>Mark Dirty</Text>
                                        </AnimatedButton>
                                    ) : (
                                        <AnimatedButton
                                            style={[styles.laundryBtn, { backgroundColor: '#eff6ff' }]}
                                            onPress={onWash}
                                        >
                                            <Text style={[styles.laundryBtnText, { color: '#1d4ed8' }]}>Wash</Text>
                                        </AnimatedButton>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* 1. Category */}
                        <Text style={styles.sectionTitle}>Category</Text>
                        <View style={styles.chipContainer}>
                            {CLOTHING_CATEGORIES.map(cat => (
                                <AnimatedChip
                                    key={`cat-${cat}`}
                                    label={cat}
                                    isSelected={form.category === cat}
                                    onPress={() => updateField('category', cat)}
                                />
                            ))}
                        </View>

                        {/* 2. SubCategory (Dynamic based on Category) */}
                        <Text style={styles.sectionTitle}>Item Type</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                            <View style={styles.grid2Rows}>
                                {STANDARD_SUBCATEGORIES[form.category as keyof typeof STANDARD_SUBCATEGORIES]?.map(sub => (
                                    <AnimatedChip
                                        key={`subcat-${sub}`}
                                        label={sub}
                                        isSelected={form.subCategory === sub}
                                        onPress={() => updateField('subCategory', sub)}
                                        isSmall
                                    />
                                ))}
                            </View>
                        </ScrollView>

                        {/* 3. Primary Color */}
                        <Text style={styles.sectionTitle}>Primary Color</Text>
                        <TextInput
                            style={[styles.input, !isEditing && styles.inputDisabled]}
                            value={form.primaryColor}
                            onChangeText={(text) => updateField('primaryColor', text)}
                            placeholder="e.g. Navy Blue"
                            editable={isEditing}
                        />

                        {/* 4. Description */}
                        <Text style={styles.sectionTitle}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, !isEditing && styles.inputDisabled]}
                            value={form.description}
                            onChangeText={(text) => updateField('description', text)}
                            placeholder="Detailed visual description..."
                            multiline
                            editable={isEditing}
                        />

                        {/* 5. Tags (Grouped) */}
                        <Text style={styles.sectionTitle}>Tags</Text>

                        {Object.entries(CLOTHING_TAGS).map(([groupName, tags]) => (
                            <View key={groupName} style={styles.tagGroup}>
                                <Text style={styles.subHeader}>{groupName.charAt(0).toUpperCase() + groupName.slice(1)}</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                                    <View style={styles.grid2Rows}>
                                        {tags.map(tag => (
                                            <AnimatedChip
                                                key={`tag-${groupName}-${tag}`}
                                                label={tag}
                                                isSelected={form.tags.includes(tag)}
                                                onPress={() => toggleTag(tag)}
                                                isSmall
                                            />
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        ))}

                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Sticky Footer */}
                <View style={styles.footer}>
                    {(!isEditing) ? (
                        // READ ONLY MODE: Edit (Big) + Delete (Icon)
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={[styles.saveButton, { flex: 1, marginRight: 10 }]} onPress={toggleEditMode}>
                                <Text style={styles.saveButtonText}>Edit Item</Text>
                            </TouchableOpacity>

                            {onDelete && (
                                <TouchableOpacity style={styles.deleteIconSquare} onPress={onDelete}>
                                    <Ionicons name="trash-outline" size={24} color="#ef4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        // EDITING MODE: Save + Cancel
                        <View style={styles.buttonRow}>
                            {isReadOnly && (
                                <TouchableOpacity style={styles.cancelButton} onPress={toggleEditMode}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={[styles.saveButton, { flex: 1, marginLeft: isReadOnly ? 10 : 0 }]} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>
                                    {isReadOnly ? 'Save Changes' : 'Save to Closet'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    form: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
        marginTop: 20,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    subHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
        marginTop: 10,
        marginBottom: 6,
        marginLeft: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    horizontalScroll: {
        marginBottom: 10,
    },
    grid2Rows: {
        flexDirection: 'column',
        flexWrap: 'wrap',
        height: 110,
        rowGap: 15,
        columnGap: 2,
        paddingVertical: 4,
    },
    tagGroup: {
        marginBottom: 10,
    },
    // Unified Chip style for consistent sizing
    chip: {
        minWidth: 100,      // Enforce minimum width
        height: 38,         // Reduced height (was 44)
        paddingHorizontal: 16,
        borderRadius: 19,   // Half of height
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    // Reusing same style for small chips to ensure "buttons be of the same size"
    chipSmall: {
        minWidth: 100,      // Consistent with category chips
        height: 38,         // Reduced height
        paddingHorizontal: 12,
        borderRadius: 19,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    chipText: {
        color: '#333',
        fontSize: 13,       // Slightly smaller text for thinner button
        textAlign: 'center',
        fontWeight: '500',
    },
    chipTextSmall: {
        color: '#333',
        fontSize: 13,       // Slightly smaller text
        textAlign: 'center',
        fontWeight: '500',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
    },
    saveButton: {
        backgroundColor: '#000',
        padding: 16,        // Slightly reduced padding
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    inputDisabled: {
        backgroundColor: '#fff',
        borderColor: 'transparent',
        color: '#333'
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteIconSquare: {
        width: 54, // Match height of save button approx
        height: 54,
        borderRadius: 14,
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        flex: 0.8,
    },
    cancelButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: 'bold',
    },
    imagePreviewContainer: {
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        overflow: 'hidden',
        width: '100%',
        aspectRatio: 3 / 4, // Match camera/card aspect ratio to prevent cropping
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    // Laundry Styles
    laundryContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    laundryInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    wearCount: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    laundryActions: {
        flexDirection: 'row',
        gap: 12,
    },
    laundryBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    laundryBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111',
    },
    wearControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    wearLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111',
    },
    wearButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBtn: {
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    dividerVertical: {
        width: 1,
        height: 16,
        backgroundColor: '#ddd',
        marginHorizontal: 4,
    },
});
