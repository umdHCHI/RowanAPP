import { EquipmentItem } from '../../../imports';

interface UseEquipmentHandlersProps {
  equipment: any; // MasterStateContext equipment object
  wellness: any;  // MasterStateContext wellness object
}

/**
 * Equipment management hook for The Archive
 * Handles equipping/unequipping gear for Character research path
 * (Personality path would use similar pattern for coping tools)
 */
export const useEquipmentHandlers = ({
  equipment,
  wellness
}: UseEquipmentHandlersProps) => {

  /**
   * Equip a gear item - handles both backend and local inventory items
   * @param item - The equipment item to equip
   */
  const handleEquip = async (item: EquipmentItem) => {
    // Find corresponding backend gear item
    const backendGearItem = equipment.backendGear.find((gear: any) => 
      gear.id.toString() === item.id
    );
    
    if (backendGearItem) {
      // Backend gear - use API endpoint
      await equipment.equipBackendGear(backendGearItem.id);
      await wellness.loadHomeData(); // Refresh character display
    } else {
      // Local inventory item - use context method
      equipment.equipItem(item.type, item);
      await wellness.loadHomeData();
    }
  };
  
  /**
   * Unequip a gear item - handles both backend and local inventory items
   * @param item - The equipment item to unequip
   */
  const handleUnequip = async (item: EquipmentItem) => {
    // Find corresponding backend gear item
    const backendGearItem = equipment.backendGear.find((gear: any) => 
      gear.id.toString() === item.id
    );
    
    if (backendGearItem) {
      // Backend gear - use API endpoint
      await equipment.unequipBackendGear(backendGearItem.id);
      await wellness.loadHomeData(); // Refresh character display
    } else {
      // Local inventory item - use context method
      equipment.unequipItem(item.type);
      await wellness.loadHomeData();
    }
  };

  return {
    handleEquip,
    handleUnequip
  };
};