import React from 'react';
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { equipmentIcons, equipmentTypeLabels, rarityColors } from '../../assets/equipment';
import { useTheme } from '../context/ThemeContext';
import { ArmorType, BootsType, EquipmentItem, EquippedItems, HelmetType, WeaponType } from '../types/equipment';

const { width } = Dimensions.get('window');

interface EquipmentModalProps {
  visible: boolean;
  onClose: () => void;
  onEquip: (item: EquipmentItem) => void;
  onUnequip: (item: EquipmentItem) => void;
  inventory: EquipmentItem[];
  equippedItems: EquippedItems;
}

export default function EquipmentModal({
  visible,
  onClose,
  onEquip,
  onUnequip,
  inventory,
  equippedItems,
}: EquipmentModalProps) {
  const { styles: globalStyles } = useTheme();

  const getItemIcon = (item: EquipmentItem) => {
    switch (item.type) {
      case 'weapons':
        return equipmentIcons.weapons[item.subtype as WeaponType];
      case 'armor':
        return equipmentIcons.armor[item.subtype as ArmorType];
      case 'helmets':
        return equipmentIcons.helmets[item.subtype as HelmetType];
      case 'boots':
        return equipmentIcons.boots[item.subtype as BootsType];
      default:
        return null;
    }
  };

  const renderItem = (item: EquipmentItem, isEquipped: boolean = false) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.itemCard, { borderColor: rarityColors[item.rarity] }]}
      onPress={() => isEquipped ? onUnequip(item) : onEquip(item)}
    >
      <Image source={getItemIcon(item)} style={styles.itemIcon} />
      <Text style={[styles.itemName, { color: rarityColors[item.rarity] }]}>
        {item.name}
      </Text>
      <View style={styles.statsContainer}>
        {item.stats.attack && (
          <Text style={styles.statText}>⚔️ {item.stats.attack}</Text>
        )}
        {item.stats.defense && (
          <Text style={styles.statText}>🛡️ {item.stats.defense}</Text>
        )}
        {item.stats.health && (
          <Text style={styles.statText}>❤️ {item.stats.health}</Text>
        )}
      </View>
      <Text style={styles.equipText}>
        {isEquipped ? 'Unequip' : 'Equip'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: globalStyles.card.backgroundColor }]}>
          <Text style={[styles.title, { color: globalStyles.text.color }]}>
            Equipment
          </Text>
          
          {/* Equipped Items Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: globalStyles.text.color }]}>
              Equipped
            </Text>
            <View style={styles.equippedGrid}>
              {Object.entries(equippedItems).map(([slot, item]) => (
                <View key={slot} style={styles.equippedSlot}>
                  {item ? (
                    renderItem(item, true)
                  ) : (
                    <View style={styles.emptySlot}>
                      <Text style={styles.emptySlotText}>
                        {equipmentTypeLabels[slot as keyof typeof equipmentTypeLabels]}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Inventory Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: globalStyles.text.color }]}>
              Inventory
            </Text>
            <ScrollView style={styles.inventoryScroll}>
              <View style={styles.inventoryGrid}>
                {inventory.map((item) => renderItem(item))}
              </View>
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: globalStyles.button.backgroundColor }]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  equippedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  equippedSlot: {
    width: (width * 0.8) / 2 - 10,
  },
  inventoryScroll: {
    maxHeight: 300,
  },
  inventoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  itemCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  itemIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statText: {
    color: '#fff',
    fontSize: 14,
  },
  equipText: {
    color: '#4ee6e6',
    fontSize: 14,
    fontWeight: '600',
  },
  emptySlot: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  emptySlotText: {
    color: '#666',
    fontSize: 14,
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 