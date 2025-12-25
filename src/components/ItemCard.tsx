import { ClothingAnalysis } from '@/services/ai/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ItemCardProps {
    item: {
        id: number;
        image_uri: string;
        metadata: ClothingAnalysis;
        is_clean?: boolean;
    };
    onPress?: () => void;
}

export const ItemCard = ({ item, onPress }: ItemCardProps) => {
    const isDirty = item.is_clean === false;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.image_uri }}
                    style={styles.image}
                    contentFit="cover"
                    transition={200}
                />
                {isDirty && (
                    <View style={styles.badge}>
                        <Ionicons name="shirt" size={12} color="#fff" />
                        <View style={styles.badgeDot} />
                    </View>
                )}
            </View>
            <View style={styles.info}>
                <Text style={styles.subCategory} numberOfLines={1}>{item.metadata.subCategory}</Text>
                <Text style={styles.category}>{item.metadata.category}</Text>

                {/* Optional: Show primary color dot */}
                <View style={styles.tagsRow}>
                    <Text style={styles.tagCount}>{item.metadata.tags.length} tags</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        margin: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    imageContainer: {
        aspectRatio: 3 / 4,
        backgroundColor: '#f5f5f5',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#ef4444', // Red
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    badgeDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#fff',
        opacity: 0, // Hidden for now, just experimenting
    },
    info: {
        padding: 12,
    },
    subCategory: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    category: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 8,
    },
    tagsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    tagCount: {
        fontSize: 12,
        color: '#94a3b8',
    }
});
