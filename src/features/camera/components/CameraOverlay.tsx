import { IconSymbol } from '@/components/ui/icon-symbol';
import { FlashMode } from 'expo-camera';
import { TouchableOpacity, View } from 'react-native';

interface CameraOverlayProps {
    flash: FlashMode;
    toggleFlash: () => void;
    toggleFacing: () => void;
    onCapture: () => void;
}

export const CameraOverlay = ({ flash, toggleFlash, toggleFacing, onCapture }: CameraOverlayProps) => {
    return (
        <View style={{ flex: 1, justifyContent: 'space-between', padding: 24 }}>
            {/* Top Bar */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 48 }}>
                <TouchableOpacity
                    onPress={toggleFlash}
                    style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}
                >
                    <IconSymbol
                        size={24}
                        name={flash === 'on' ? 'bolt.fill' : 'bolt.slash.fill'}
                        color="white"
                    />
                </TouchableOpacity>
            </View>

            {/* Bottom Bar */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 32 }}>
                <TouchableOpacity
                    onPress={toggleFacing}
                    style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}
                >
                    <IconSymbol size={24} name="arrow.triangle.2.circlepath" color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onCapture}
                    style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: 'white', alignItems: 'center', justifyContent: 'center' }}
                >
                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'white' }} />
                </TouchableOpacity>

                <View style={{ width: 48 }} />
                {/* Spacer for centering shutter button */}
            </View>
        </View>
    );
};
