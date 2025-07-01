import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { EquipmentItem, EquippedItems } from "../types/equipment";

interface EquipmentModalProps {
  visible: boolean;
  onClose: () => void;
  onEquip: (item: EquipmentItem) => void;
  onUnequip: (item: EquipmentItem) => void;
  inventory: EquipmentItem[];
  equippedItems: EquippedItems;
}

const EquipmentModal: React.FC<EquipmentModalProps> = ({
  visible,
  onClose,
  onEquip,
  onUnequip,
  inventory,
  equippedItems,
}) => {
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
    switch (stat) {
      case "awareness":
        return "#4A90E2";
      case "resilience":
        return "#2ECC71";
      case "connection":
        return "#E74C3C";
      case "balance":
        return "#F39C12";
      default:
        return "#fff";
    }
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

  const renderItem = (item: EquipmentItem, isEquipped: boolean) => (
    <View key={item.id} style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemType}>{getSlotLabel(item.type)}</Text>
      </View>

      <Text style={styles.itemDescription}>{item.description}</Text>

      <View style={styles.statsContainer}>
        {Object.entries(item.wellnessStats).map(([stat, value]) =>
          value ? renderStat(stat, value) : null
        )}
      </View>

      <Text style={styles.effectText}>Effect: {item.effect}</Text>

      <TouchableOpacity
        style={[
          styles.actionButton,
          isEquipped ? styles.unequipButton : styles.equipButton,
        ]}
        onPress={() => (isEquipped ? onUnequip(item) : onEquip(item))}
      >
        <Text style={styles.actionButtonText}>
          {isEquipped ? "Unequip" : "Equip"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalpassages}>
          <View style={styles.header}>
            <Text style={styles.title}>Coping Tools</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.passages}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Equipped</Text>
              {Object.values(equippedItems).map((item) =>
                renderItem(item, true)
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Inventory</Text>
              {inventory.map((item) => renderItem(item, false))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalpassages: {
    width: "90%",
    height: "80%",
    backgroundColor: "#23242b",
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  passages: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#ffe066",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  itemCard: {
    backgroundColor: "#1a1b1f",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  itemType: {
    color: "#4ee6e6",
    fontSize: 12,
    fontStyle: "italic",
  },
  itemDescription: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  statsContainer: {
    marginBottom: 12,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  effectText: {
    color: "#ffe066",
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  equipButton: {
    backgroundColor: "#4ee6e6",
  },
  unequipButton: {
    backgroundColor: "#ff6b6b",
  },
  actionButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default EquipmentModal;
