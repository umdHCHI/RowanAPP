import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  clothesOptionsF,
  clothesOptionsM,
  eyesOptionsF,
  eyesOptionsM,
  glassesOptionsF,
  glassesOptionsM,
  hairOptionsF,
  hairOptionsM,
  mouthOptionsF,
  mouthOptionsM,
  skinOptionsF,
  skinOptionsM,
} from '../assets/characterOptions';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { getAppearance } from '../services/appearanceService';

const { width, height } = Dimensions.get('window');

const gearSlots = [
  { icon: '🗡️', label: 'Weapon' },
  { icon: '🧥', label: 'Armor' },
  { icon: '🧢', label: 'Helmet' },
  { icon: '🥾', label: 'Boots' },
];

const statIcons = [
  { icon: '⭐', label: 'LV', value: '20' },
  { icon: '❤️', label: '', value: '1994' },
  { icon: '⚔️', label: '', value: '209' },
  { icon: '🛡️', label: '', value: '50' },
];

const resourceIcons = [
  { icon: '🪙', value: '330K/4172' },
  { icon: '💧', value: '38K/888' },
  { icon: '🔮', value: '219/40' },
];

const bottomNav = [
  { icon: '📖', label: 'Story' },
  { icon: '🦸', label: 'Hero' },
  { icon: '🛡️', label: 'Equip Gear' },
  { icon: '🧠', label: 'Skills' },
];

const GameHomeScreen = () => {
  const { onboardingState } = useOnboarding();
  const [appearance, setAppearance] = useState(onboardingState.characterAppearance);
  const { authToken, characterId } = useAuth();

  // Choose correct options based on gender
  let skinOptions = skinOptionsF;
  let hairOptions = hairOptionsF;
  let clothesOptions = clothesOptionsF;
  let glassesOptions = glassesOptionsF;
  let eyesOptions = eyesOptionsF;
  let mouthOptions = mouthOptionsF;
  if (appearance?.gender === 'masculine') {
    skinOptions = skinOptionsM;
    hairOptions = hairOptionsM;
    clothesOptions = clothesOptionsM;
    glassesOptions = glassesOptionsM;
    eyesOptions = eyesOptionsM;
    mouthOptions = mouthOptionsM;
  }
  // For 'nonbinary', use feminine assets for now (or add custom logic/assets later)

  const characterStats = [
    { label: 'Level', value: '12', color: '#FFD700' },
    { label: 'Health', value: '285/320', color: '#FF4444' },
    { label: 'Mana', value: '180/200', color: '#4488FF' },
    { label: 'Experience', value: '2,847/3,200', color: '#00FF88' },
  ];

  useEffect(() => {
    const loadAppearance = async () => {
      try {
        if (authToken && characterId) {
          console.log('Loading appearance for character:', characterId);
          const data = await getAppearance(authToken, characterId);
          console.log('Loaded appearance data:', data);
          setAppearance(data);
        } else {
          console.log('No auth token or character ID available');
          // If we have appearance data in onboarding state, use that
          if (onboardingState.characterAppearance) {
            console.log('Using appearance from onboarding state');
            setAppearance(onboardingState.characterAppearance);
          }
        }
      } catch (error) {
        console.error('Failed to load appearance:', error);
        // If loading fails, try to use onboarding state
        if (onboardingState.characterAppearance) {
          console.log('Using appearance from onboarding state after error');
          setAppearance(onboardingState.characterAppearance);
        }
      }
    };

    loadAppearance();
  }, [authToken, characterId, onboardingState.characterAppearance]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView style={styles.content} contentContainerStyle={{ alignItems: 'center', paddingTop: 20 }}>
        {/* Top: Rarity, Class, Name */}
        <View style={styles.topInfo}>
          <Text style={styles.rarity}>Rare</Text>
          <Text style={styles.class}>Rogue of the Forest</Text>
          <Text style={styles.heroName}>Ira</Text>
        </View>
        {/* Character and Gear */}
        <View style={styles.gearRow}>
          <View style={styles.gearCol}>
            {gearSlots.slice(0, 2).map((slot, i) => (
              <View key={i} style={styles.gearSlot}><Text style={styles.gearIcon}>{slot.icon}</Text></View>
            ))}
          </View>
          <View style={styles.characterCard}>
            {appearance && (
              <View style={styles.characterPreview}>
                <Image source={skinOptions[appearance.skin]} style={styles.layer} />
                <Image source={hairOptions[appearance.hair]} style={styles.layer} />
                <Image source={clothesOptions[appearance.clothes]} style={styles.layer} />
                <Image source={glassesOptions[appearance.glasses]} style={styles.layer} />
                <Image source={eyesOptions[appearance.eyes]} style={styles.layer} />
                <Image source={mouthOptions[appearance.mouth]} style={styles.layer} />
              </View>
            )}
          </View>
          <View style={styles.gearCol}>
            {gearSlots.slice(2).map((slot, i) => (
              <View key={i} style={styles.gearSlot}><Text style={styles.gearIcon}>{slot.icon}</Text></View>
            ))}
          </View>
        </View>
        {/* Speech Bubble */}
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>Time to unleash hell.</Text>
        </View>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          {statIcons.map((stat, i) => (
            <View key={i} style={styles.statBox}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue2}>{stat.value}</Text>
              {stat.label ? <Text style={styles.statLabel2}>{stat.label}</Text> : null}
            </View>
          ))}
        </View>
        {/* Resource Row */}
        <View style={styles.resourceRow}>
          {resourceIcons.map((res, i) => (
            <View key={i} style={styles.resourceBox}>
              <Text style={styles.resourceIcon}>{res.icon}</Text>
              <Text style={styles.resourceValue}>{res.value}</Text>
            </View>
          ))}
        </View>
        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionBtnText}>Remove Gear</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.levelUpBtn]}><Text style={styles.actionBtnText}>Level Up</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionBtnText}>Equip Gear</Text></TouchableOpacity>
        </View>
        {/* Spacer for bottom nav */}
        <View style={{ height: 80 }} />
      </ScrollView>
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {bottomNav.map((item, i) => (
          <TouchableOpacity key={i} style={styles.bottomNavItem}>
            <Text style={styles.bottomNavIcon}>{item.icon}</Text>
            <Text style={styles.bottomNavLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A20',
  },
  content: {
    flex: 1,
  },
  topInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  rarity: {
    color: '#4ee6e6',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  class: {
    color: '#ffe066',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  heroName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 6,
  },
  gearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gearCol: {
    justifyContent: 'space-between',
    height: 180,
  },
  gearSlot: {
    width: 48,
    height: 48,
    backgroundColor: '#23242b',
    borderRadius: 10,
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  gearIcon: {
    fontSize: 28,
  },
  speechBubble: {
    backgroundColor: '#f5e6c4',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    alignSelf: 'center',
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#e2c48d',
    maxWidth: 320,
  },
  speechText: {
    color: '#5a4a2c',
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  statBox: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  statValue2: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  statLabel2: {
    color: '#ffe066',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resourceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 6,
  },
  resourceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  resourceIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  resourceValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
  },
  actionBtn: {
    backgroundColor: '#23242b',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  levelUpBtn: {
    backgroundColor: '#4ee6e6',
    borderColor: '#2bc4c4',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    backgroundColor: '#181A20',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#23242b',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 10,
  },
  bottomNavItem: {
    alignItems: 'center',
    flex: 1,
  },
  bottomNavIcon: {
    fontSize: 24,
    color: '#ffe066',
  },
  bottomNavLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
    fontWeight: 'bold',
  },
  characterCard: {
    width: 140,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181A20',
    borderRadius: 12,
    marginRight: 28,
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden',
  },
  characterPreview: {
    width: 120,
    height: 220,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  layer: {
    position: 'absolute',
    width: 120,
    height: 220,
    resizeMode: 'contain',
  },
  abilitiesSection: {
    marginVertical: 20,
  },
  abilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  abilityIcon: {
    width: (width - 60) / 3,
    marginBottom: 15,
  },
  abilityIconGradient: {
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  abilityEmoji: {
    fontSize: 24,
  },
  abilityLevel: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FFD700',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  abilityLevelText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickActionsSection: {
    marginVertical: 20,
  },
  quickActionButton: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 20,
  },
  quickActionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  quickActionDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  avatarPlaceholder: {
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
  },
  avatarSubtext: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.3)',
    paddingBottom: 5,
  },
});

export default GameHomeScreen;