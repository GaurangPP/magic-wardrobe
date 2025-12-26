import { EditItemModal } from '@/components/EditItemModal';
import { ImagePreview } from '@/components/ImagePreview';
import { CameraView } from '@/features/camera/components/CameraView';
import { AIService } from '@/services/ai';
import { ImageService } from '@/services/image';
import { InventoryService } from '@/services/inventory';
import { OutfitService } from '@/services/outfits';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  // --- State ---
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loadingRecents, setLoadingRecents] = useState(true);

  const [showCamera, setShowCamera] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Removing background...');

  // Edit Flow State
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // --- Effects ---
  // Load recent items whenever screen focuses
  useFocusEffect(
    useCallback(() => {
      loadRecents();
    }, [])
  );

  const loadRecents = async () => {
    try {
      setLoadingRecents(true);
      const allItems = await InventoryService.getAllItems();
      // Get top 5 most recent
      setRecentItems(allItems.slice(0, 5));

      const history = await OutfitService.getHistory();
      setHistoryItems(history);
    } catch (e) {
      console.error('Failed to load recents:', e);
    } finally {
      setLoadingRecents(false);
    }
  };

  // --- Handlers ---

  const handleSaveToCloset = async (finalData: any) => {
    try {
      if (!previewUri) return;

      setShowEditModal(false);
      setLoadingMessage('Saving to Closet... 🧠');
      setIsProcessing(true);

      // Artificial delay to allow UI to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      await InventoryService.addItem(previewUri, finalData);
      console.log('[HomeScreen] Item saved to DB.');

      // Reset state
      setPreviewUri(null);
      setAnalysisResult(null);
      setIsProcessing(false);

      // Refresh recents
      loadRecents();

      // Success feedback
      setTimeout(() => {
        Alert.alert('Success', 'Item saved to your wardrobe.');
      }, 500);

    } catch (e) {
      console.error('[HomeScreen] Save failed:', e);
      setIsProcessing(false);
      Alert.alert('Failed to save item. Please try again.');
    }
  };

  // --- Render Views ---

  if (showCamera) {
    return (
      <CameraView
        onCapture={async (uri) => {
          setShowCamera(false);
          setPreviewUri(uri);
          setLoadingMessage('Removing background...');
          setIsProcessing(true);

          let savedUri = uri;
          try {
            savedUri = await ImageService.saveImage(uri);
            const processedUri = await ImageService.removeBackground(savedUri);
            setPreviewUri(processedUri);
          } catch (e) {
            console.error('Failed to process image:', e);
            Alert.alert('Background removal failed. Using original image.');
            setPreviewUri(savedUri);
          } finally {
            setIsProcessing(false);
          }
        }}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  if (showEditModal && analysisResult) {
    return (
      <EditItemModal
        visible={true}
        initialData={analysisResult}
        imageUri={previewUri}
        onSave={handleSaveToCloset}
        onCancel={() => setShowEditModal(false)}
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
          setAnalysisResult(null);
        }}
        onConfirm={async () => {
          try {
            if (!previewUri) return;
            setLoadingMessage('Analyzing Outfit... 🧠');
            setIsProcessing(true);

            const analysis = await AIService.analyzeImage(previewUri);
            setAnalysisResult(analysis);
            setShowEditModal(true);
          } catch (error) {
            console.error('AI Analysis Failed:', error);
            Alert.alert('AI Analysis Failed. Check logs.');
          } finally {
            setIsProcessing(false);
          }
        }}
      />
    );
  }

  // --- Main Dashboard ---
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Afternoon,</Text>
          <Text style={styles.title}>Magic Wardrobe</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Hero / Action Section */}
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => setShowCamera(true)}
          activeOpacity={0.9}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="camera" size={32} color="#fff" />
            </View>
            <View>
              <Text style={styles.heroTitle}>Scan New Item</Text>
              <Text style={styles.heroSubtitle}>Digitize your closet with AI</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={24} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>

        {/* Secondary Actions Grid */}
        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/explore')}>
            <View style={[styles.iconCircle, { backgroundColor: '#e0f2fe' }]}>
              <Ionicons name="shirt-outline" size={24} color="#0284c7" />
            </View>
            <Text style={styles.actionText}>My Closet</Text>
            <Text style={styles.actionCount}>{recentItems.length > 0 ? 'View All' : 'Empty'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/outfits')}>
            <View style={[styles.iconCircle, { backgroundColor: '#f3e8ff' }]}>
              <Ionicons name="sparkles-outline" size={24} color="#9333ea" />
            </View>
            <Text style={styles.actionText}>Stylist</Text>
            <Text style={styles.actionCount}>Get Ideas</Text>
          </TouchableOpacity>
        </View>

        {/* History Section */}
        {recentItems.length > 0 && ( /* Using recentItems as proxy for "has data", but should verify */
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Wear History</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            >
              {historyItems.map((outfit: any) => (
                <View key={outfit.id} style={styles.historyCard}>
                  <View style={styles.historyDateBadge}>
                    <Text style={styles.historyDateText}>
                      {new Date(outfit.date_worn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <View style={styles.historyImages}>
                    {outfit.items.slice(0, 3).map((item: any, index: number) => (
                      <Image
                        key={item.id}
                        source={{ uri: item.image_uri }}
                        style={[styles.historyThumb, { marginLeft: index > 0 ? -15 : 0, zIndex: 3 - index }]}
                      />
                    ))}
                    {outfit.items.length > 3 && (
                      <View style={[styles.historyThumb, styles.moreBadge, { marginLeft: -15, zIndex: 0 }]}>
                        <Text style={styles.moreText}>+{outfit.items.length - 3}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
              {historyItems.length === 0 && (
                <View style={styles.emptyRecent}>
                  <Text style={styles.emptyText}>No outfits worn yet.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}



      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  settingsButton: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroCard: {
    marginHorizontal: 20,
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.05,
    // shadowRadius: 4,
    // elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  actionCount: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  seeAll: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  recentScroll: {
    paddingLeft: 4, // Compensation for container padding
  },
  recentItem: {
    width: 140,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  recentImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.02)', // Subtle darken
  },
  emptyRecent: {
    marginHorizontal: 20,
    padding: 30,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  emptyText: {
    color: '#999',
    fontSize: 15,
    fontWeight: '500',
  },
  // History Styles
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    minWidth: 140,
  },
  historyDateBadge: {
    backgroundColor: '#f8fafc',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  historyDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  historyImages: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    paddingLeft: 8, // For the first overlap offset
  },
  historyThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#e2e8f0',
  },
  moreBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  moreText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
});
