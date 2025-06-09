import { API_BASE_URL } from '../config';
import { EquipmentItem, EquippedItems } from '../types/equipment';

export const getInventory = async (token: string, characterId: string): Promise<EquipmentItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/${characterId}/inventory`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch inventory');
    return await response.json();
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }
};

export const getEquippedItems = async (token: string, characterId: string): Promise<EquippedItems> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/${characterId}/equipment`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch equipped items');
    return await response.json();
  } catch (error) {
    console.error('Error fetching equipped items:', error);
    return {};
  }
};

export const equipItem = async (token: string, characterId: string, itemId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/${characterId}/equipment/${itemId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to equip item');
  } catch (error) {
    console.error('Error equipping item:', error);
    throw error;
  }
};

export const unequipItem = async (token: string, characterId: string, itemId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/${characterId}/equipment/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to unequip item');
  } catch (error) {
    console.error('Error unequipping item:', error);
    throw error;
  }
}; 