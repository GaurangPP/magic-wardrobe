import { EditItemModal } from '@/components/EditItemModal';
import { ItemCard } from '@/components/ItemCard';
import { ThemedText } from '@/components/themed-text';
import { CLOTHING_CATEGORIES } from '@/services/ai/prompts';
import { ClothingAnalysis } from '@/services/ai/types';
import { InventoryService } from '@/services/inventory';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClosetScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Organization State
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Edit/Detail State
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadItems = async () => {
    try {
      if (!refreshing) setLoading(true);
      const inventory = await InventoryService.getAllItems();
      setItems(inventory);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  // Filter Items based on Active Category
  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return items;
    if (activeCategory === 'Laundry') return items.filter(item => !item.is_clean);
    return items.filter(item => item.metadata.category === activeCategory);
  }, [items, activeCategory]);

  /* Update Item Handler with "No Change" Check */
  const handleUpdateItem = async (updatedData: ClothingAnalysis) => {
    if (!selectedItem) return;

    try {
      // Deep comparison to check if anything actually changed
      const hasChanged = JSON.stringify(selectedItem.metadata) !== JSON.stringify(updatedData);

      if (!hasChanged) {
        setModalVisible(false);
        return; // Exit early, no DB update needed
      }

      setLoading(true);
      await InventoryService.updateItem(selectedItem.id, updatedData);
      setModalVisible(false);
      await loadItems(); // Reload to reflect changes
      Alert.alert('Success', 'Item updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = () => {
    if (!selectedItem) return;

    Alert.alert(
      "Delete Item",
      "Are you sure you want to remove this item from your closet? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              setModalVisible(false); // Close modal first
              await InventoryService.deleteItem(selectedItem.id, selectedItem.image_uri);
              await loadItems();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  /* Laundry Handlers */
  const handleWearItem = async () => {
    if (!selectedItem) return;
    try {
      await InventoryService.markAsWorn(selectedItem.id);
      // Reload and update selected item state to reflect changes
      const updatedInventory = await InventoryService.getAllItems();
      setItems(updatedInventory);
      const updatedItem = updatedInventory.find(i => i.id === selectedItem.id);
      if (updatedItem) setSelectedItem(updatedItem);
    } catch (e) {
      console.error('Failed to mark as worn:', e);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleWashItem = async () => {
    if (!selectedItem) return;
    try {
      await InventoryService.markAsClean(selectedItem.id);
      // Reload and update selected item state
      const updatedInventory = await InventoryService.getAllItems();
      setItems(updatedInventory);
      const updatedItem = updatedInventory.find(i => i.id === selectedItem.id);
      if (updatedItem) setSelectedItem(updatedItem);
    } catch (e) {
      console.error('Failed to wash item:', e);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleDecrementWear = async () => {
    if (!selectedItem) return;
    try {
      await InventoryService.decrementWear(selectedItem.id);

      const updatedInventory = await InventoryService.getAllItems();
      setItems(updatedInventory);
      const updatedItem = updatedInventory.find(i => i.id === selectedItem.id);
      if (updatedItem) setSelectedItem(updatedItem);
    } catch (e) {
      console.error('Failed to decrement wear:', e);
    }
  };

  const handleMarkDirty = async () => {
    if (!selectedItem) return;
    try {
      await InventoryService.markAsDirty(selectedItem.id);

      const updatedInventory = await InventoryService.getAllItems();
      setItems(updatedInventory);
      const updatedItem = updatedInventory.find(i => i.id === selectedItem.id);
      if (updatedItem) setSelectedItem(updatedItem);
    } catch (e) {
      console.error('Failed to mark as dirty:', e);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const openItemDetails = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  // Category Filter Component
  const renderFilterBar = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        <TouchableOpacity
          style={[styles.filterChip, activeCategory === 'All' && styles.filterChipActive]}
          onPress={() => setActiveCategory('All')}
        >
          <Text style={[styles.filterText, activeCategory === 'All' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeCategory === 'Laundry' && styles.filterChipActive]}
          onPress={() => setActiveCategory('Laundry')}
        >
          <Text style={[styles.filterText, activeCategory === 'Laundry' && styles.filterTextActive]}>Laundry</Text>
        </TouchableOpacity>

        {CLOTHING_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.filterText, activeCategory === cat && styles.filterTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View >
  );

  if (loading && !refreshing && items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <ThemedText type="title">My Closet</ThemedText>
        <Text style={styles.count}>{filteredItems.length} items</Text>
      </View>

      {renderFilterBar()}

      <FlatList
        data={filteredItems}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() => openItemDetails(item)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {activeCategory === 'All' ? 'Your wardrobe is empty.' : `No items found in ${activeCategory}.`}
            </Text>
            {activeCategory === 'All' && <Text style={styles.emptySubText}>Scan an item to get started!</Text>}
          </View>
        }
      />

      {/* Edit/Detail Modal */}
      {selectedItem && (
        <EditItemModal
          visible={modalVisible}
          initialData={selectedItem.metadata}
          imageUri={selectedItem.image_uri}
          isReadOnly={true}

          itemData={selectedItem}
          onWear={handleWearItem}
          onDecrementWear={handleDecrementWear}
          onWash={handleWashItem}
          onMarkDirty={handleMarkDirty}

          onSave={handleUpdateItem}
          onDelete={handleDeleteItem}
          onCancel={() => setModalVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  filterContainer: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#000',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 10,
    paddingBottom: 100, // Space for tab bar
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
  }
});
