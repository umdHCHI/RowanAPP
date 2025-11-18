import { equipmentIcons } from "../../../assets/equipment";

export const getEquippedGearForSlot = (equipmentContext: any, slot: 'weapon' | 'armor' | 'helmet' | 'boots') => {
  const foundGear = equipmentContext.equippedGear.find((gear: any) => gear.gear_type.slot === slot);
  return foundGear;
};

export const getGearSlotImage = (gear: any) => {
  const slot = gear.gear_type.slot;
  const name = gear.gear_type.name.toLowerCase();
  let equipmentType: string;
  let subtype: string;

  switch (slot) {
    case 'weapon':
      if (name.includes('scroll') || name.includes('stillness')) {
        equipmentType = 'focus';
        subtype = 'scroll';
      } else if (name.includes('wand') || name.includes('magic')) {
        equipmentType = 'focus';
        subtype = 'magicWand';
      } else if (name.includes('staff') || name.includes('topaz')) {
        equipmentType = 'focus';
        subtype = 'topazStaff';
      } else if (name.includes('sapphire')) {
        equipmentType = 'focus';
        subtype = 'sapphireStaff';
      } else if (name.includes('torch')) {
        equipmentType = 'focus';
        subtype = 'torch';
      } else if (name.includes('sword') || name.includes('iron')) {
        equipmentType = 'combat';
        subtype = 'ironSword';
      } else if (name.includes('golden') || name.includes('gold')) {
        equipmentType = 'combat';
        subtype = 'goldenSword';
      } else if (name.includes('shield')) {
        if (name.includes('iron')) {
          equipmentType = 'combat';
          subtype = 'ironShield';
        } else {
          equipmentType = 'combat';
          subtype = 'woodenShield';
        }
      } else {
        equipmentType = 'focus';
        if (name.includes('breathing') || name.includes('breath')) {
          subtype = 'breathing';
        } else if (name.includes('journal') || name.includes('notebook')) {
          subtype = 'journaling';
        } else {
          subtype = 'meditation';
        }
      }
      break;

    case 'armor':
      if (name.includes('item_27') || name.includes('item27')) {
        equipmentType = 'comfort';
        subtype = 'item27';
      } else if (name.includes('item_29') || name.includes('item29')) {
        equipmentType = 'comfort';
        subtype = 'item29';
      } else if (name.includes('item_31') || name.includes('item31')) {
        equipmentType = 'comfort';
        subtype = 'item31';
      } else {
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
      }
      break;

    case 'helmet':
      if (name.includes('wizard') || name.includes('hat')) {
        equipmentType = 'shield';
        subtype = 'wizardHat';
      } else if (name.includes('helm') && !name.includes('iron') && !name.includes('leather')) {
        equipmentType = 'shield';
        subtype = 'helm';
      } else if (name.includes('iron')) {
        equipmentType = 'shield';
        subtype = 'ironHelmet';
      } else if (name.includes('leather')) {
        equipmentType = 'shield';
        subtype = 'leatherHelmet';
      } else {
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
      }
      break;

    case 'boots':
      if (name.includes('iron')) {
        equipmentType = 'ground';
        subtype = 'ironBoot';
      } else if (name.includes('leather')) {
        equipmentType = 'ground';
        subtype = 'leatherBoot';
      } else {
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
      }
      break;

    default:
      equipmentType = 'focus';
      subtype = 'meditation';
  }

  try {
    const asset = (equipmentIcons as any)[equipmentType][subtype];
    if (asset) {
      return asset;
    }
  } catch (error) {
    // Silent error handling
  }

  switch (slot) {
    case 'weapon':
      return equipmentIcons.focus.meditation;
    case 'armor':
      return equipmentIcons.comfort.social;
    case 'helmet':
      return equipmentIcons.shield.boundary;
    case 'boots':
      return equipmentIcons.ground.exercise;
    default:
      return equipmentIcons.focus.meditation;
  }
};