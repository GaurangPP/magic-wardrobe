import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import { ImagePreview } from '@/components/ImagePreview';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CameraView } from '@/features/camera/components/CameraView';
import { AIService } from '@/services/ai';
import { ImageService } from '@/services/image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Button } from 'react-native';

export default function HomeScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [loadingMessage, setLoadingMessage] = useState('Removing background...');

  if (showCamera) {
    return (
      <CameraView
        onCapture={async (uri) => {
          console.log('Capturing temp URI:', uri);
          setShowCamera(false);
          setPreviewUri(uri);
          setLoadingMessage('Removing background...');
          setIsProcessing(true);

          let savedUri = uri;

          try {
            // 1. Save original
            savedUri = await ImageService.saveImage(uri);
            console.log('Saved to:', savedUri);

            // 2. Remove background
            const processedUri = await ImageService.removeBackground(savedUri);
            setPreviewUri(processedUri);
          } catch (e) {
            console.error('Failed to process image:', e);
            alert('Background removal failed (requires Native Build). Using original image.');
            setPreviewUri(savedUri);
          } finally {
            setIsProcessing(false);
          }
        }}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  if (previewUri || isProcessing) {
    return (
      <ImagePreview
        visible={true}
        imageUri={previewUri}
        loading={isProcessing}
        loadingMessage={loadingMessage}
        onClose={() => {
          setPreviewUri(null);
          setIsProcessing(false);
        }}
        onConfirm={async () => {
          try {
            console.log('Confirmed image:', previewUri);
            if (!previewUri) return;

            setLoadingMessage('Analyzing Outfit... 🧠');
            setIsProcessing(true);

            const analysis = await AIService.analyzeImage(previewUri);
            console.log('AI Analysis Result:', JSON.stringify(analysis, null, 2));

            // Temporary: Show result in alert
            alert(`Analysis:\n\nCategory: ${analysis.category}\nItem: ${analysis.subCategory}\nColor: ${analysis.primaryColor}`);

            setPreviewUri(null);
          } catch (error) {
            console.error('AI Analysis Failed:', error);
            alert('AI Analysis Failed. Check logs.');
          } finally {
            setIsProcessing(false);
          }
        }}
      />
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" className="text-red-500 font-bold">Magic Wardrobe</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Setup Complete!</ThemedText>
        <ThemedText>
          Database initialized and Tailwind configured.
        </ThemedText>
        <Button title="Open Camera" onPress={() => setShowCamera(true)} />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
