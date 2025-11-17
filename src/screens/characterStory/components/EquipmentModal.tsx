import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { equipmentIcons } from "../../../assets/equipment";
import { CharacterGear, EquipmentItem, EquipmentType, EquippedItems } from '../../../types/index';





// Helper functions (if they don't exist in the types file)
export const mapBackendSlotToFrontendType = (slot: string): EquipmentType => {
  const mapping: Record<string, EquipmentType> = {
    weapon: 'focus',
    armor: 'comfort',
    helmet: 'shield',
    boots: 'ground',
  };
  return mapping[slot] || 'focus';
};

export const mapBackendStatsToWellnessStats = (statBonuses: Record<string, number>): { awareness?: number; resilience?: number; connection?: number; balance?: number; } => {
  return Object.entries(statBonuses).reduce((acc, [key, value]) => {
    if (['awareness', 'resilience', 'connection', 'balance'].includes(key)) {
      (acc as any)[key] = value;
    }
    return acc;
  }, {} as { awareness?: number; resilience?: number; connection?: number; balance?: number; });
};

export const mapBackendGearToSubtype = (name: string, slot: string): string => {
  const nameLower = name.toLowerCase();
  
  switch (slot) {
    case 'weapon':
      if (nameLower.includes('scroll') || nameLower.includes('stillness')) return 'scroll';
      if (nameLower.includes('breathing') || nameLower.includes('breath')) return 'breathing';
      if (nameLower.includes('journal') || nameLower.includes('notebook')) return 'journaling';
      return 'meditation';
      
    case 'armor':
      if (nameLower.includes('social') || nameLower.includes('friend') || nameLower.includes('style')) return 'social';
      if (nameLower.includes('hobby') || nameLower.includes('activity')) return 'hobby';
      if (nameLower.includes('nature') || nameLower.includes('outdoor')) return 'nature';
      return 'social';
      
    case 'helmet':
      if (nameLower.includes('boundary') || nameLower.includes('limit')) return 'boundary';
      if (nameLower.includes('affirmation') || nameLower.includes('positive')) return 'affirmation';
      if (nameLower.includes('routine') || nameLower.includes('habit')) return 'routine';
      return 'boundary';
      
    case 'boots':
      if (nameLower.includes('exercise') || nameLower.includes('movement')) return 'exercise';
      if (nameLower.includes('sleep') || nameLower.includes('rest')) return 'sleep';
      if (nameLower.includes('nutrition') || nameLower.includes('food')) return 'nutrition';
      return 'exercise';
      
    default:
      return 'meditation';
  }
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isMobile = screenWidth < 768;

interface EquipmentModalProps {
  visible: boolean;
  onClose: () => void;
  onEquip: (item: EquipmentItem) => void;
  onUnequip: (item: EquipmentItem) => void;
  inventory: EquipmentItem[];
  equippedItems: EquippedItems;
  backendGear?: CharacterGear[];
  equippedGear?: CharacterGear[];
}

const EquipmentModal: React.FC<EquipmentModalProps> = ({
  visible,
  onClose,
  onEquip,
  onUnequip,
  inventory,
  equippedItems,
  backendGear = [],
  equippedGear = [],
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const getSlotLabel = (type: string) => {
    switch (type) {
      case "focus":
        return "Focus Item";
      case "comfort":
        return "Comfort Layer";
      case "shield":
        return "Mind Shield";
      case "ground":
        return "Ground Stone";
      default:
        return type;
    }
  };

  const getStatColor = (stat: string) => {
    const colors: Record<string, string> = {
      awareness: '#4ee6e6',
      resilience: '#2a9d8f',
      connection: '#f72585',
      balance: '#ffd60a',
      mindfulness: '#4ee6e6',
      focus: '#4ee6e6',
      confidence: '#2a9d8f',
      empathy: '#f72585',
      organization: '#ffd60a'
    };
    return colors[stat] || '#ffffff';
  };

  const getItemImage = (gear: CharacterGear) => {
    const slot = gear.gear_type.slot;
    const name = gear.gear_type.name.toLowerCase();
    
    let equipmentType: string;
    let subtype: string;
    
    switch (slot) {
      case 'weapon':
        equipmentType = 'focus';
        if (name.includes('scroll') || name.includes('stillness')) {
          subtype = 'scroll';
        } else if (name.includes('breathing') || name.includes('breath')) {
          subtype = 'breathing';
        } else if (name.includes('journal') || name.includes('notebook')) {
          subtype = 'journaling';
        } else {
          subtype = 'meditation';
        }
        break;
        
      case 'armor':
        equipmentType = 'comfort';
        if (name.includes('social') || name.includes('friend') || name.includes('style')) {
          subtype = 'social';
        } else if (name.includes('hobby') || name.includes('activity')) {
          subtype = 'hobby';
        } else if (name.includes('nature') || name.includes('outdoor')) {
          subtype = 'nature';
        } else {
          subtype = 'social';
        }
        break;
        
      case 'helmet':
        equipmentType = 'shield';
        if (name.includes('boundary') || name.includes('limit')) {
          subtype = 'boundary';
        } else if (name.includes('affirmation') || name.includes('positive')) {
          subtype = 'affirmation';
        } else if (name.includes('routine') || name.includes('habit')) {
          subtype = 'routine';
        } else {
          subtype = 'boundary';
        }
        break;
        
      case 'boots':
        equipmentType = 'ground';
        if (name.includes('exercise') || name.includes('movement')) {
          subtype = 'exercise';
        } else if (name.includes('sleep') || name.includes('rest')) {
          subtype = 'sleep';
        } else if (name.includes('nutrition') || name.includes('food')) {
          subtype = 'nutrition';
        } else {
          subtype = 'exercise';
        }
        break;
        
      default:
        equipmentType = 'focus';
        subtype = 'meditation';
    }
    
    return (equipmentIcons as any)[equipmentType][subtype];
  };

  const renderStat = (stat: string, value: number) => (
    <View style={styles.statRow}>
      <Text style={[styles.statLabel, { color: getStatColor(stat) }]}>
        {stat.charAt(0).toUpperCase() + stat.slice(1)}
      </Text>
      <Text style={[styles.statValue, { color: getStatColor(stat) }]}>
        {value > 0 ? `+${value}` : value}
      </Text>
    </View>
  );

  const renderBackendGearItem = (gear: CharacterGear, isEquipped: boolean) => {
    const wellnessStats = mapBackendStatsToWellnessStats(gear.gear_type.stat_bonuses);
    const item: EquipmentItem = {
      id: gear.id.toString(),
      name: gear.gear_type.name,
      type: mapBackendSlotToFrontendType(gear.gear_type.slot),
      subtype: mapBackendGearToSubtype(gear.gear_type.name, gear.gear_type.slot) as any,
      description: gear.gear_type.description,
      unlockCondition: 'Unlocked through story completion',
      wellnessStats: wellnessStats,
      effect: `Provides ${Object.entries(wellnessStats).map(([stat, value]) => (value as number) > 0 ? `${stat} +${value}` : '').filter(Boolean).join(', ')}`,
      rarity: 'common',
      level: 1
    };

    return renderItem(item, isEquipped, gear.id, gear);
  };

  const renderItem = (item: EquipmentItem, isEquipped: boolean, gearId?: number, gear?: CharacterGear) => (
    <View key={`${item.id}-${gearId || 'item'}`} style={styles.itemCard}>
      <LinearGradient
        colors={isEquipped 
          ? ["rgba(6, 182, 212, 0.3)", "rgba(8, 145, 178, 0.2)", "rgba(6, 182, 212, 0.3)"]
          : ["rgba(30, 41, 59, 0.8)", "rgba(51, 65, 85, 0.6)", "rgba(30, 41, 59, 0.8)"]
        }
        style={styles.itemCardGradient}
      >
        <View style={styles.itemImageContainer}>
          <View style={[
            styles.itemImageFrame,
            isEquipped && styles.itemImageFrameEquipped
          ]}>
            {gear ? (
              <Image 
                source={getItemImage(gear)} 
                style={styles.itemImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.itemImageText}>🔮</Text>
            )}
          </View>
          {isEquipped && (
            <View style={styles.equippedBadge}>
              <LinearGradient
                colors={["#06B6D4", "#0891B2"]}
                style={styles.equippedBadgeGradient}
              >
                <Text style={styles.equippedBadgeText}>EQUIPPED</Text>
              </LinearGradient>
            </View>
          )}
        </View>

        <View style={styles.itemInfo}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemType}>{getSlotLabel(item.type)}</Text>
          </View>

          <Text style={styles.itemDescription}>{item.description}</Text>

          {Object.keys(item.wellnessStats).length > 0 && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>Bonuses:</Text>
              {Object.entries(item.wellnessStats).map(([stat, value]) =>
                value ? <View key={stat}>{renderStat(stat, value as number)}</View> : null
              )}
            </View>
          )}

          <Text style={styles.effectText}>Effect: {item.effect}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            isEquipped ? styles.unequipButton : styles.equipButton,
          ]}
          onPress={async () => {
            setIsLoading(true);
            try {
              if (isEquipped) {
                await onUnequip(item);
              } else {
                await onEquip(item);
              }
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
        >
          <LinearGradient
            colors={isEquipped 
              ? ["#EF4444", "#DC2626"] 
              : ["#06B6D4", "#0891B2"]
            }
            style={styles.actionButtonGradient}
          >
            <Ionicons 
              name={isEquipped ? "remove-circle" : "add-circle"} 
              size={16} 
              color="#fff" 
              style={{ marginRight: 6 }}
            />
            <Text style={styles.actionButtonText}>
              {isLoading ? "..." : (isEquipped ? "Remove" : "Equip")}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const gearBySlot = backendGear.reduce<Record<string, CharacterGear[]>>((acc, gear) => {
    const slot = gear.gear_type.slot;
    if (!acc[slot]) {
      acc[slot] = [];
    }
    acc[slot].push(gear);
    return acc;
  }, {});

  const getSlotTitle = (slot: string) => {
    switch (slot) {
      case 'weapon': return 'Focus Items';
      case 'armor': return 'Comfort Layers';
      case 'helmet': return 'Mind Shields';
      case 'boots': return 'Ground Stones';
      default: return slot;
    }
  };

  const getSlotIcon = (slot: string) => {
    switch (slot) {
      case 'weapon': return '🔮';
      case 'armor': return '📜';
      case 'helmet': return '🛡️';
      case 'boots': return '⚓';
      default: return '📦';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={[
            "rgba(139, 69, 19, 0.6)",
            "rgba(160, 82, 45, 0.5)",
            "rgba(139, 69, 19, 0.6)"
          ]}
          style={styles.modalBackground}
        >
          <View style={styles.modalpassages}>
            {/* Header */}
            <View style={styles.header}>
              <LinearGradient
                colors={["rgba(212, 175, 55, 0.3)", "rgba(160, 82, 45, 0.2)", "rgba(212, 175, 55, 0.3)"]}
                style={styles.headerGradient}
              >
                <View style={styles.headerContent}>
                  <View style={styles.headerLeft}>
                    <Text style={styles.title}>Backpack</Text>
                    <Text style={styles.subtitle}>Your Coping Tools & Equipment</Text>
                  </View>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <LinearGradient
                      colors={["rgba(239, 68, 68, 0.8)", "rgba(220, 38, 38, 0.8)"]}
                      style={styles.closeButtonGradient}
                    >
                      <Ionicons name="close" size={20} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>

            <ScrollView style={styles.passages} showsVerticalScrollIndicator={false}>
              {/* Show loading state */}
              {isLoading && (
                <View style={styles.loadingState}>
                  <Ionicons name="refresh" size={24} color="#06B6D4" />
                  <Text style={styles.loadingText}>Loading equipment...</Text>
                </View>
              )}

              {/* Show equipped gear first */}
              {!isLoading && equippedGear.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <LinearGradient
                      colors={["rgba(6, 182, 212, 0.4)", "rgba(8, 145, 178, 0.3)"]}
                      style={styles.sectionHeaderGradient}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#06B6D4" />
                      <Text style={styles.sectionTitle}>Currently Equipped</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.itemsGrid}>
                    {equippedGear.map((gear) => (
                      <View key={gear.id} style={styles.gridItem}>
                        {renderBackendGearItem(gear, true)}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Show gear by slot type */}
              {!isLoading && Object.entries(gearBySlot).map(([slot, gearItems]) => (
                <View key={slot} style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <LinearGradient
                      colors={["rgba(139, 92, 246, 0.4)", "rgba(124, 58, 237, 0.3)"]}
                      style={styles.sectionHeaderGradient}
                    >
                      <Text style={styles.sectionIcon}>{getSlotIcon(slot)}</Text>
                      <Text style={styles.sectionTitle}>{getSlotTitle(slot)}</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.itemsGrid}>
                    {gearItems.map((gear) => (
                      <View key={gear.id} style={styles.gridItem}>
                        {renderBackendGearItem(gear, gear.is_equipped)}
                      </View>
                    ))}
                  </View>
                </View>
              ))}

              {/* Fallback to inventory if no backend gear */}
              {!isLoading && backendGear.length === 0 && inventory.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <LinearGradient
                      colors={["rgba(16, 185, 129, 0.4)", "rgba(5, 150, 105, 0.3)"]}
                      style={styles.sectionHeaderGradient}
                    >
                      <Ionicons name="cube" size={20} color="#10B981" />
                      <Text style={styles.sectionTitle}>Inventory</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.itemsGrid}>
                    {inventory.map((item) => (
                      <View key={item.id} style={styles.gridItem}>
                        {renderItem(item, false)}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Show message if no gear available */}
              {!isLoading && backendGear.length === 0 && inventory.length === 0 && (
                <View style={styles.backpackCard}>
                  {/* Grid Pattern Background */}
                  <View style={styles.backpackGridBackground}>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <View key={index} style={styles.backgroundGridCell} />
                    ))}
                  </View>
                  
                  {/* Empty State Content */}
                  <View style={styles.emptyState}>
                    <Ionicons name="bag-outline" size={48} color="#6B7280" />
                    <Text style={styles.emptyStateText}>
                      Your backpack is empty
                    </Text>
                    <Text style={styles.emptyStateSubtext}>
                      Complete stories to unlock new tools and equipment
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalBackground: {
    width: isMobile ? "95%" : "90%",
    maxHeight: isMobile ? "90%" : "80%",
    minHeight: isMobile ? screenHeight * 0.6 : undefined,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalpassages: {
    flex: 1,
    padding: 0,
  },
  header: {
    padding: isMobile ? 16 : 20,
    paddingBottom: isMobile ? 12 : 15,
  },
  headerGradient: {
    borderRadius: 15,
    padding: 1,
  },
  headerContent: {
    backgroundColor: "rgba(139, 69, 19, 0.8)",
    borderRadius: 14,
    padding: isMobile ? 16 : 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    color: "#d4af37",
    fontSize: isMobile ? 24 : 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: isMobile ? 12 : 14,
    fontStyle: "italic",
  },
  closeButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  closeButtonGradient: {
    padding: isMobile ? 10 : 12,
    borderRadius: 12,
  },
  passages: {
    flex: 1,
    paddingHorizontal: isMobile ? 16 : 20,
  },
  section: {
    marginBottom: isMobile ? 20 : 25,
  },
  sectionHeader: {
    marginBottom: isMobile ? 12 : 15,
  },
  sectionHeaderGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: isMobile ? 12 : 16,
    paddingVertical: isMobile ? 10 : 12,
    borderRadius: 12,
  },
  sectionIcon: {
    fontSize: isMobile ? 18 : 20,
    marginRight: 10,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: isMobile ? 16 : 18,
    fontWeight: "bold",
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: isMobile ? 8 : 12,
  },
  gridItem: {
    width: isMobile ? (screenWidth * 0.95 - 32 - 8) / 2 : (screenWidth * 0.95 - 60) / 2, // 2 columns with padding and gap
    minHeight: isMobile ? 180 : 200,
    marginBottom: isMobile ? 8 : 12,
  },
  itemCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: "rgba(30, 41, 59, 0.9)",
  },
  itemCardGradient: {
    padding: isMobile ? 12 : 16,
    minHeight: isMobile ? 180 : 200,
  },
  itemImageContainer: {
    alignItems: "center",
    marginBottom: isMobile ? 8 : 12,
    position: "relative",
  },
  itemImageFrame: {
    width: isMobile ? 50 : 60,
    height: isMobile ? 50 : 60,
    borderRadius: isMobile ? 25 : 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  itemImageFrameEquipped: {
    borderColor: "#06B6D4",
    borderWidth: 3,
    shadowColor: "#06B6D4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  itemImage: {
    width: isMobile ? 26 : 32,
    height: isMobile ? 26 : 32,
  },
  itemImageText: {
    fontSize: isMobile ? 26 : 32,
  },
  equippedBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    borderRadius: 8,
    overflow: "hidden",
  },
  equippedBadgeGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  equippedBadgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "bold",
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    marginBottom: isMobile ? 6 : 8,
  },
  itemName: {
    color: "#fff",
    fontSize: isMobile ? 14 : 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  itemType: {
    color: "#06B6D4",
    fontSize: isMobile ? 10 : 12,
    fontStyle: "italic",
  },
  itemDescription: {
    color: "#CBD5E1",
    fontSize: isMobile ? 10 : 12,
    marginBottom: isMobile ? 8 : 12,
    lineHeight: isMobile ? 14 : 16,
  },
  statsContainer: {
    marginBottom: isMobile ? 8 : 12,
  },
  statsTitle: {
    color: "#94A3B8",
    fontSize: isMobile ? 10 : 12,
    fontWeight: "bold",
    marginBottom: isMobile ? 6 : 8,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: isMobile ? 10 : 12,
    fontWeight: "500",
  },
  statValue: {
    fontSize: isMobile ? 10 : 12,
    fontWeight: "bold",
  },
  effectText: {
    color: "#FCD34D",
    fontSize: isMobile ? 10 : 12,
    fontStyle: "italic",
    marginBottom: isMobile ? 8 : 12,
  },
  actionButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: isMobile ? 8 : 10,
    paddingHorizontal: isMobile ? 12 : 16,
  },
  equipButton: {
    // Styles handled by gradient
  },
  unequipButton: {
    // Styles handled by gradient
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: isMobile ? 12 : 14,
  },
  loadingState: {
    alignItems: "center",
    padding: isMobile ? 30 : 40,
    flexDirection: "row",
    justifyContent: "center",
  },
  loadingText: {
    color: "#06B6D4",
    fontSize: isMobile ? 14 : 16,
    fontWeight: "bold",
    marginLeft: 12,
  },
  emptyState: {
    alignItems: "center",
    padding: isMobile ? 30 : 40,
    position: "relative",
    zIndex: 1, // Above the grid background
    justifyContent: "center",
    flex: 1,
  },
  emptyStateText: {
    color: "#fff",
    fontSize: isMobile ? 18 : 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: "#94A3B8",
    fontSize: isMobile ? 12 : 14,
    textAlign: "center",
    lineHeight: isMobile ? 18 : 20,
  },
  backpackGridBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    height: "100%",
    padding: 8,
    zIndex: 0, // Behind the content but above the card background
  },
  backgroundGridCell: {
    width: "33.33%", // 3 cells per row
    height: "50%", // 2 cells per column
    backgroundColor: "rgba(212, 175, 55, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.12)",
    borderRadius: 2,
    margin: 2,
  },
  backpackCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: "rgba(139, 69, 19, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
    margin: isMobile ? 16 : 20,
    minHeight: isMobile ? 250 : 300,
    maxHeight: isMobile ? 350 : 400,
  },
});

export default EquipmentModal;
