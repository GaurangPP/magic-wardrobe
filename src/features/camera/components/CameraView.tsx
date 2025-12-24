import { CameraView as ExpoCameraView } from 'expo-camera';
import { Text, TouchableOpacity, View } from 'react-native';
import { useCamera } from '../hooks/useCamera';
import { CameraProps } from '../types';
import { CameraOverlay } from './CameraOverlay';

export const CameraView = ({ onCapture, onClose }: CameraProps) => {
    const {
        permission,
        requestPermission,
        facing,
        toggleFacing,
        flash,
        toggleFlash,
        cameraRef,
        takePicture
    } = useCamera();

    if (!permission) {
        // Permission state is loading
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <View style={{ backgroundColor: '#1e293b', padding: 32, borderRadius: 24, alignItems: 'center', width: '100%', maxWidth: 400 }}>
                    <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
                        Camera Access
                    </Text>

                    <Text style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
                        Magic Wardrobe needs your permission to scan and analyze your clothing items.
                    </Text>

                    <TouchableOpacity
                        onPress={requestPermission}
                        style={{ backgroundColor: '#2563eb', width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12 }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Grant Permission</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onClose}
                        style={{ width: '100%', paddingVertical: 8, alignItems: 'center' }}
                    >
                        <Text style={{ color: '#64748b', fontWeight: '500' }}>Not now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const handleCapture = async () => {
        const uri = await takePicture();
        if (uri) {
            onCapture(uri);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <ExpoCameraView
                ref={cameraRef}
                style={{ flex: 1 }}
                facing={facing}
                flash={flash}
                mode="picture"
            />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                <CameraOverlay
                    flash={flash}
                    toggleFlash={toggleFlash}
                    toggleFacing={toggleFacing}
                    onCapture={handleCapture}
                />
            </View>
        </View>
    );
};
