import { CameraType, CameraView, FlashMode, useCameraPermissions } from 'expo-camera';
import { useCallback, useRef, useState } from 'react';

export const useCamera = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<CameraType>('back');
    const [flash, setFlash] = useState<FlashMode>('off');
    const cameraRef = useRef<CameraView>(null);

    const toggleFacing = useCallback(() => {
        setFacing((current) => (current === 'back' ? 'front' : 'back'));
    }, []);

    const toggleFlash = useCallback(() => {
        setFlash((current) => (current === 'off' ? 'on' : 'off'));
    }, []);

    const takePicture = useCallback(async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                    skipProcessing: true, // We will process later if needed
                });
                return photo?.uri;
            } catch (error) {
                console.error('Failed to take picture:', error);
                return null;
            }
        }
        return null;
    }, []);

    return {
        permission,
        requestPermission,
        facing,
        toggleFacing,
        flash,
        toggleFlash,
        cameraRef,
        takePicture,
    };
};
