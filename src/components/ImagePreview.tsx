import { IconSymbol } from '@/components/ui/icon-symbol';
import { Image } from 'expo-image';
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native';

interface ImagePreviewProps {
    visible: boolean;
    imageUri: string | null;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
    loadingMessage?: string;
}

export const ImagePreview = ({ visible, imageUri, onClose, onConfirm, loading = false, loadingMessage = 'Processing...' }: ImagePreviewProps) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
                {loading ? (
                    <View style={{ alignItems: 'center', gap: 16 }}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: '500' }}>{loadingMessage}</Text>
                    </View>
                ) : (
                    imageUri && (
                        <View style={{ width: '100%', height: '100%', justifyContent: 'space-between', paddingVertical: 48 }}>
                            {/* Close Button */}
                            <TouchableOpacity
                                onPress={onClose}
                                style={{ position: 'absolute', top: 50, left: 20, zIndex: 10, width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <IconSymbol name="chevron.left" size={24} color="white" />
                            </TouchableOpacity>

                            {/* Image Container with Transparency grid background effect */}
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', margin: 20 }}>
                                <View style={{ width: '100%', aspectRatio: 3 / 4, backgroundColor: '#334155', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#475569' }}>
                                    {/* Checkerboard pattern simulation */}
                                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, flexDirection: 'row', flexWrap: 'wrap' }}>
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <View key={i} style={{ width: '25%', height: '10%', backgroundColor: i % 2 === 0 ? 'white' : 'transparent' }} />
                                        ))}
                                    </View>

                                    <Image
                                        source={{ uri: imageUri }}
                                        style={{ width: '100%', height: '100%' }}
                                        contentFit="contain"
                                    />
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View style={{ paddingHorizontal: 24, gap: 12 }}>
                                <TouchableOpacity
                                    onPress={onConfirm}
                                    style={{ backgroundColor: '#2563eb', paddingVertical: 18, borderRadius: 16, alignItems: 'center' }}
                                >
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Use This Photo</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={onClose}
                                    style={{ paddingVertical: 12, alignItems: 'center' }}
                                >
                                    <Text style={{ color: '#94a3b8', fontWeight: '500' }}>Retake</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                )}
            </View>
        </Modal>
    );
};
