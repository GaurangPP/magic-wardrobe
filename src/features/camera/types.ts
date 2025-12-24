import { CameraType, FlashMode } from 'expo-camera';

export interface CameraProps {
    onCapture: (uri: string) => void;
    onClose: () => void;
}

export interface CameraState {
    type: CameraType;
    flash: FlashMode;
    permission: boolean | null;
}

export type ProcessingPipeline = (uri: string) => Promise<string>;
