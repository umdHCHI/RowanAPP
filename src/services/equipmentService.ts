import { apiService } from './apiService';
import { EquipmentItem, EquippedItems } from '../types/equipment';

export const getInventory = async (characterId: string): Promise<EquipmentItem[]> => {
    return apiService.getInventory(characterId);
};

export const getEquippedItems = async (characterId: string): Promise<EquippedItems> => {
    return apiService.getEquippedItems(characterId);
};

export const equipItem = async (characterId: string, itemId: string): Promise<void> => {
    return apiService.equipItem(characterId, itemId);
};

export const unequipItem = async (characterId: string, itemId: string): Promise<void> => {
    return apiService.unequipItem(characterId, itemId);
};