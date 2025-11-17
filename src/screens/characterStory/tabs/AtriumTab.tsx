import React from 'react';
import { View, Text, Alert, TouchableOpacity, LinearGradient, Icon, Image } from '../../../imports';
import { uiIcons } from '../../../assets/ui';
import { CharacterDisplay } from '../components/CharacterDisplay';
import { GearSlot } from '../components/GearSlot';
import { FoundationCard } from '../components/FoundationCard';
import { getExperienceDisplay } from '../utils/experienceHelpers';
import { EquippedItems } from '../../../imports';

interface AtriumTabProps {
  homeStyles: any;
  homeTheme: any;
  wellness: any;
  equipment: any;
  character: any;
  setShowEquipmentModal: (show: boolean) => void;
  openAttributeModal: (attr: any) => void;
  wellnessStatsForDisplay: any[];
  auth: any;
  params: any;
  isLoadingCharacterData: boolean;
}

export const AtriumTab: React.FC<AtriumTabProps> = ({
  homeStyles,
  homeTheme,
  wellness,
  equipment,
  character,
  setShowEquipmentModal,
  openAttributeModal,
  wellnessStatsForDisplay,
  auth,
  params,
  isLoadingCharacterData
}) => {
  const getEquippedGearForSlot = (slot: 'weapon' | 'armor' | 'helmet' | 'boots') => {
    return equipment.equippedGear.find((gear: any) => gear.gear_type.slot === slot);
  };

  const handleEquipmentPress = async () => {
    try {
      await equipment.loadBackendGear();
      setShowEquipmentModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load equipment data. Please try again.');
    }
  };

  const handleFoundationPress = (foundation: any) => {
    openAttributeModal(foundation);
  };

  const leftGearSlots = [
    {
      type: "focus" as keyof EquippedItems,
      label: "Focus Item",
      icon: uiIcons.sectionIcons.staffwithgreengem,
      slot: "weapon" as const,
    },
    {
      type: "shield" as keyof EquippedItems,
      label: "Mind Shield",
      icon: uiIcons.sectionIcons.bluejewel,
      slot: "helmet" as const,
    },
  ];

  const rightGearSlots = [
    {
      type: "comfort" as keyof EquippedItems,
      label: "Comfort Layer",
      icon: uiIcons.sectionIcons.purplebottle,
      slot: "armor" as const,
    },
    {
      type: "ground" as keyof EquippedItems,
      label: "Ground Stone",
      icon: uiIcons.sectionIcons.bluegloveofthanos,
      slot: "boots" as const,
    },
  ];

  return (
    <View style={homeStyles.tabpassagesArea}>
      {/* Experience Bar and Character Display */}
      <View style={homeStyles.avatarShowcaseHeader}>
        <LinearGradient
          colors={[
            "rgba(10, 11, 15, 0.95)",
            "rgba(30, 41, 59, 0.8)",
            "rgba(10, 11, 15, 0.95)",
          ]}
          style={[homeStyles.archiveHeaderGradient, {
            borderColor: '#9e8532ff',
            borderWidth: 2,
            shadowColor: '#d4af37',
            shadowOffset: { width: 2, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 12,
          }]}
        >
          <View style={{ alignItems: 'center' }}>
            {/* Experience Bar */}
            <View style={homeStyles.experienceProgressContainer}>
              <LinearGradient
                colors={["rgba(78, 230, 230, 0.8)", "rgba(6, 182, 212, 0.8)"]}
                style={homeStyles.experienceProgressGradient}
              >
                <Icon name="zap" size={14} color="#0a0b0f" />
                <Text style={homeStyles.experienceProgressText}>
                  {getExperienceDisplay(wellness)}
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* Character and Equipment Display */}
          <View style={homeStyles.characterDisplaySection}>
            {/* Left Gear Column */}
            <View style={homeStyles.gearColumnLeft}>
              {leftGearSlots.map((slot, i) => (
                <GearSlot
                  key={i}
                  slot={slot}
                  equippedGear={getEquippedGearForSlot(slot.slot)}
                  onPress={handleEquipmentPress}
                  homeStyles={homeStyles}
                  homeTheme={homeTheme}
                />
              ))}
            </View>

            {/* Character Display */}
            <CharacterDisplay
              wellness={wellness}
              character={character}
              homeStyles={homeStyles}
              isLoadingCharacterData={isLoadingCharacterData}
              params={params}
            />

            {/* Right Gear Column */}
            <View style={homeStyles.gearColumnRight}>
              {rightGearSlots.map((slot, i) => (
                <GearSlot
                  key={i}
                  slot={slot}
                  equippedGear={getEquippedGearForSlot(slot.slot)}
                  onPress={handleEquipmentPress}
                  homeStyles={homeStyles}
                  homeTheme={homeTheme}
                />
              ))}
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Wellness Foundations Section */}
      <View style={homeStyles.foundationsSection}>
        <LinearGradient
          colors={[
            homeTheme.foundationCardGradientStart || 'rgba(10, 11, 15, 0.95)',
            homeTheme.foundationCardGradientMiddle || 'rgba(30, 41, 59, 0.8)',
            homeTheme.foundationCardGradientEnd || 'rgba(10, 11, 15, 0.95)',
          ]}
          style={homeStyles.foundationsSectionGradient}
        >
          <View style={homeStyles.foundationsHeader}>
            <Icon name="anchor" size={20} color="#4ee6e6" />
            <Text style={homeStyles.foundationsTitle}>
              Moments of Reflection
            </Text>
            <Icon name="anchor" size={20} color="#4ee6e6" />
          </View>
          <Text style={homeStyles.foundationsSubtitle}>
            The ethereal pillars that support your mental architecture
          </Text>

          <View style={homeStyles.foundationsGrid}>
            {wellnessStatsForDisplay.map((foundation: any, index: number) => (
              <FoundationCard
                key={index}
                foundation={foundation}
                index={index}
                homeStyles={homeStyles}
                homeTheme={homeTheme}
                onPress={handleFoundationPress}
              />
            ))}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};