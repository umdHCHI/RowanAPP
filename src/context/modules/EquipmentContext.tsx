// Manages equipment, inventory, and gear system

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { apiService } from '../../services/apiService';
import {
  CharacterGear,
  EquipmentItem,
  EquipmentSubtype,
  EquipmentType,
  EquippedItems,
} from '../../types';
import {
  getRarityColors,
  mapBackendGearToSubtype,
  mapBackendSlotToFrontendType,
  mapBackendStatsToWellnessStats,
} from '../../types/equipment';

export interface EquipmentContextType {
  inventory: EquipmentItem[];
  equippedItems: EquippedItems;
  backendGear: CharacterGear[];
  equippedGear: CharacterGear[];

  setInventory: (items: EquipmentItem[]) => void;
  equipItem: (type: keyof EquippedItems, item: EquipmentItem) => void;
  unequipItem: (type: keyof EquippedItems) => void;
  getItemIcon: (item: EquipmentItem) => any;
  getRarityColors: (rarity: string) => string[];
  loadBackendGear: () => Promise<void>;
  equipBackendGear: (gearId: number) => Promise<void>;
  unequipBackendGear: (gearId: number) => Promise<void>;
  acquireEquipmentWithUpgrade: (itemName: string, storyId?: string) => Promise<any>;
  getPlayerInventory: () => string[];
  getStoryReplayCount: (storyId: string) => number;
  handleEquipmentUpgrade: (upgradeResult: any) => void;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export const useEquipment = () => {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error('useEquipment must be used within EquipmentProvider');
  }
  return context;
};

interface EquipmentProviderProps {
  children: ReactNode;
  authToken?: string | null;
  onWellnessGain?: (gains: Record<string, number>) => Promise<void>;
}

export const EquipmentProvider: React.FC<EquipmentProviderProps> = ({
  children,
  authToken,
  onWellnessGain,
}) => {
  const [inventory, setInventory] = useState<EquipmentItem[]>([]);
  const [backendGear, setBackendGear] = useState<CharacterGear[]>([]);
  const [equippedGear, setEquippedGear] = useState<CharacterGear[]>([]);

  // ===== CRITICAL: Clear equipment state when auth changes =====
  // This prevents data leakage between different user accounts
  useEffect(() => {
    if (!authToken) {
      console.log('🧹 [EquipmentContext] Auth token cleared - resetting all equipment state');
      setInventory([]);
      setBackendGear([]);
      setEquippedGear([]);
    }
  }, [authToken]);

  const equippedItems = useMemo(() => {
    const convertedEquippedItems: EquippedItems = {};
    equippedGear.forEach((gear) => {
      const frontendType = mapBackendSlotToFrontendType(gear.gear_type.slot);
      const wellnessStats = mapBackendStatsToWellnessStats(gear.gear_type.stat_bonuses);
      convertedEquippedItems[frontendType] = {
        id: gear.id.toString(),
        name: gear.gear_type.name,
        type: frontendType,
        subtype: mapBackendGearToSubtype(gear.gear_type.name, gear.gear_type.slot),
        description: gear.gear_type.description,
        unlockCondition: 'Unlocked through story completion',
        wellnessStats: wellnessStats,
        effect: `Provides ${Object.entries(wellnessStats)
          .map(([stat, value]) => (value > 0 ? `${stat} +${value}` : ''))
          .filter(Boolean)
          .join(', ')}`,
        rarity: 'common',
        level: 1,
      };
    });
    return convertedEquippedItems;
  }, [equippedGear]);

  const convertBackendGearToEquipmentItem = useCallback(
    (gear: CharacterGear): EquipmentItem => {
      const wellnessStats = mapBackendStatsToWellnessStats(gear.gear_type.stat_bonuses);
      return {
        id: gear.id.toString(),
        name: gear.gear_type.name,
        type: mapBackendSlotToFrontendType(gear.gear_type.slot),
        subtype: mapBackendGearToSubtype(gear.gear_type.name, gear.gear_type.slot),
        description: gear.gear_type.description,
        unlockCondition: 'Unlocked through story completion',
        wellnessStats: wellnessStats,
        effect: `Provides ${Object.entries(wellnessStats)
          .map(([stat, value]) => (value > 0 ? `${stat} +${value}` : ''))
          .filter(Boolean)
          .join(', ')}`,
        rarity: 'common',
        level: 1,
      };
    },
    []
  );

  const getItemIcon = (item: EquipmentItem) => {
    return require('../../../assets/equipment/armor/fb1857.png');
  };

  const equipItem = (type: keyof EquippedItems, item: EquipmentItem) => {
    // Placeholder - implement if needed
  };

  const unequipItem = (type: keyof EquippedItems) => {
    // Placeholder - implement if needed
  };

  const loadBackendGear = async () => {
    try {
      const [myGear, equippedGearData] = await Promise.all([
        apiService.getMyGear(),
        apiService.getEquippedGear(),
      ]);

      setBackendGear(myGear);
      setEquippedGear(equippedGearData);

      const convertedInventory: EquipmentItem[] = myGear.map((gear) =>
        convertBackendGearToEquipmentItem(gear)
      );
      setInventory(convertedInventory);
    } catch (error) {
      // Handle error silently
    }
  };

  const mapEquipmentNameToTypeAndSubtype = (
    itemName: string
  ): { type: EquipmentType; subtype: EquipmentSubtype } => {
    const name = itemName.toLowerCase();
    let slot: 'weapon' | 'armor' | 'helmet' | 'boots' = 'weapon';

    if (
      name.includes('cloak') ||
      name.includes('wrap') ||
      name.includes('armor') ||
      name.includes('robe') ||
      name.includes('shroud')
    ) {
      slot = 'armor';
    } else if (
      name.includes('helm') ||
      name.includes('crown') ||
      name.includes('hat') ||
      name.includes('filter') ||
      name.includes('guard') ||
      name.includes('ward')
    ) {
      slot = 'helmet';
    } else if (
      name.includes('boot') ||
      name.includes('foundation') ||
      name.includes('roots') ||
      (name.includes('stone') && !name.includes('compass'))
    ) {
      slot = 'boots';
    }

    const type = mapBackendSlotToFrontendType(slot);
    const subtype = mapBackendGearToSubtype(itemName, slot);

    return { type, subtype };
  };

  const equipBackendGear = async (gearId: number) => {
    try {
      await apiService.equipGear(gearId);
      await loadBackendGear();
    } catch {
      Alert.alert('Error', 'Failed to equip gear. Please try again.');
    }
  };

  const unequipBackendGear = async (gearId: number) => {
    try {
      await apiService.unequipGear(gearId);
      await loadBackendGear();
    } catch {
      Alert.alert('Error', 'Failed to unequip gear. Please try again.');
    }
  };

  const handleEquipmentUpgrade = (upgradeResult: any) => {
    if (upgradeResult && upgradeResult.upgrade) {
      const { upgrade } = upgradeResult;

      if (upgradeResult.isUpgrade) {
        setInventory((prev) =>
          prev.filter((item) => item.name !== upgradeResult.originalItem)
        );
        const { type, subtype } = mapEquipmentNameToTypeAndSubtype(
          upgradeResult.upgradedItem
        );
        const upgradedItem: EquipmentItem = {
          id: Date.now().toString(),
          name: upgradeResult.upgradedItem,
          type: type,
          subtype: subtype,
          description: `Upgraded version of ${upgradeResult.originalItem}`,
          unlockCondition: 'Upgraded through story replay',
          wellnessStats: {
            awareness: upgrade.statBonus,
            resilience: upgrade.statBonus,
          },
          effect: `Provides +${upgrade.statBonus} to all stats`,
          rarity: upgrade.rarity,
          level: upgrade.newLevel,
        };

        setInventory((prev) => [...prev, upgradedItem]);
      }

      if (upgrade.statBonus > 0 && onWellnessGain) {
        const statGains = {
          awareness: upgrade.statBonus,
          resilience: upgrade.statBonus,
          connection: upgrade.statBonus,
          balance: upgrade.statBonus,
        };

        onWellnessGain(statGains);
      }
    }
  };

  const getPlayerInventory = (): string[] => {
    return inventory.map((item) => item.name);
  };

  const getStoryReplayCount = (storyId: string): number => {
    return 0; // Placeholder
  };

  const acquireEquipmentWithUpgrade = async (itemName: string, storyId?: string) => {
    try {
      const playerInventory = getPlayerInventory();
      const storyReplayCount = storyId ? getStoryReplayCount(storyId) : 0;

      const { checkItemOwnershipAndUpgrade } = await import(
        '../../utils/storyRewardIntegration'
      );
      const upgradeResult = checkItemOwnershipAndUpgrade(
        itemName,
        playerInventory,
        storyReplayCount
      );

      if (upgradeResult) {
        handleEquipmentUpgrade(upgradeResult);

        if (upgradeResult.isUpgrade || upgradeResult.upgrade.statBonus > 0) {
          const { getBackendGearTypeId } = await import('../../utils/rewardsUtils');
          const gearTypeId = getBackendGearTypeId(upgradeResult.upgradedItem);

          if (gearTypeId) {
            await apiService.acquireGear(gearTypeId);
          }
        }

        return upgradeResult;
      } else {
        const { getBackendGearTypeId } = await import('../../utils/rewardsUtils');
        const gearTypeId = getBackendGearTypeId(itemName);

        if (gearTypeId) {
          await apiService.acquireGear(gearTypeId);
        }
        return { originalItem: itemName, upgradedItem: itemName, isUpgrade: false };
      }
    } catch (error) {
      throw error;
    }
  };

  const value: EquipmentContextType = {
    inventory,
    equippedItems,
    backendGear,
    equippedGear,
    setInventory,
    equipItem,
    unequipItem,
    getItemIcon,
    getRarityColors,
    loadBackendGear,
    equipBackendGear,
    unequipBackendGear,
    acquireEquipmentWithUpgrade,
    getPlayerInventory,
    getStoryReplayCount,
    handleEquipmentUpgrade,
  };

  return <EquipmentContext.Provider value={value}>{children}</EquipmentContext.Provider>;
};
