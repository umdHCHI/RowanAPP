import { EquipmentItem } from '../types/equipment';

export const sampleInventory: EquipmentItem[] = [
  {
    id: 'focus_meditation',
    name: 'Mindful Moment',
    type: 'focus',
    subtype: 'meditation',
    description: 'A simple meditation practice that helps you stay present and aware.',
    unlockCondition: 'Complete your first reflection on mindfulness',
    wellnessStats: {
      awareness: 2,
      balance: 1
    },
    effect: 'Increases awareness of thoughts and feelings'
  },
  {
    id: 'comfort_social',
    name: 'Connection Circle',
    type: 'comfort',
    subtype: 'social',
    description: 'A reminder of your support network and social connections.',
    unlockCondition: 'Reflect on a meaningful social interaction',
    wellnessStats: {
      connection: 2,
      resilience: 1
    },
    effect: 'Strengthens social support awareness'
  },
  {
    id: 'shield_boundary',
    name: 'Personal Space',
    type: 'shield',
    subtype: 'boundary',
    description: 'Tools for setting and maintaining healthy boundaries.',
    unlockCondition: 'Write about a time you successfully set boundaries',
    wellnessStats: {
      resilience: 2,
      balance: 1
    },
    effect: 'Helps maintain emotional boundaries'
  },
  {
    id: 'ground_exercise',
    name: 'Movement Anchor',
    type: 'ground',
    subtype: 'exercise',
    description: 'Physical activity routines to stay grounded and energized.',
    unlockCondition: 'Reflect on how physical activity affects your mood',
    wellnessStats: {
      balance: 2,
      awareness: 1
    },
    effect: 'Improves physical and mental balance'
  }
]; 