import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View } from 'react-native';
import CharacterFrame from '../../../components/CharacterCreator/CharacterFrame';
import CharacterPreview from '../../../components/CharacterCreator/CharacterPreview';
import { selectProfileAndCharacter } from '../../../screens/characterStory/utils/profileHelpers';

interface CharacterDisplayProps {
  wellness: any;
  character: any;
  homeStyles: any;
  isLoadingCharacterData: boolean;
  params?: any;
}

export const CharacterDisplay: React.FC<CharacterDisplayProps> = ({
  wellness,
  character,
  homeStyles,
  isLoadingCharacterData,
  params
}) => {
  const homeData = wellness.homeData;
  const backendCharacter = character.backendCharacter;

  const isPersonalityHomeData = homeData && 'userProfile' in homeData;
  const hasHomeData = homeData;
  const hasBackendCharacter = backendCharacter;

  // Show loading state while character data is being fetched
  if (isLoadingCharacterData) {
    return (
      <View style={homeStyles.centralCharacterDisplay}>
        <LinearGradient
          colors={[
            "rgba(78, 230, 230, 0.3)",
            "rgba(6, 182, 212, 0.2)",
            "rgba(78, 230, 230, 0.3)",
          ]}
          style={homeStyles.characterFrame}
        >
          <View style={homeStyles.characterFrameInner}>
            <Text style={[homeStyles.archiveText, { textAlign: "center", marginBottom: 8 }]}>
              Loading character data...
            </Text>
            <Text style={[homeStyles.archiveText, { textAlign: "center", fontSize: 12, opacity: 0.7 }]}>
              Please wait while we retrieve your Archive profile
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!hasHomeData && !hasBackendCharacter) {
    return (
      <View style={homeStyles.centralCharacterDisplay}>
        <LinearGradient
          colors={[
            "rgba(139, 92, 246, 0.3)",
            "rgba(79, 70, 229, 0.2)",
            "rgba(6, 182, 212, 0.3)",
          ]}
          style={homeStyles.characterFrame}
        >
          <View style={homeStyles.characterFrameInner}>
            <Text style={[homeStyles.archiveText, { textAlign: "center" }]}>
              No character created yet
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  let characterData, characterName;
  const { profile: userProfile, backendCharacter: backendCharacterData } = selectProfileAndCharacter(homeData);

  if (isPersonalityHomeData) {
    characterName = userProfile?.username || userProfile?.email || "Admin User";
    characterData = {
      name: characterName,
      level: 1,
      selected_hair_style: 0,
      selected_shirt_type: 0,
      selected_eye_type: 0,
      selected_eyebrow_style: 0,
      selected_mouth_type: 0
    };
  } else {
    if (backendCharacterData) {
      characterData = {
        name: backendCharacterData.name || userProfile?.username || character.getCharacterName(),
        level: backendCharacterData.level || 1,
        experience: backendCharacterData.experience || 0,
        experience_progress_percentage: backendCharacterData.experience_needed || 0,
        wellness_average: backendCharacterData.wellness_average || 0,
        character_config: backendCharacterData.character_config || null,
        equipped_gear: backendCharacterData.equipped_gear || []
      };
      characterName = backendCharacterData?.name || userProfile?.username || userProfile?.email || character.getCharacterName();
    } else {
      characterData = {
        name: userProfile?.username || character.getCharacterName(),
        level: 1,
        experience: 100,
        experience_progress_percentage: userProfile?.experience_needed || 1000,
        wellness_average: userProfile?.wellness_average || 0.25,
        character_config: userProfile?.character_config || null,
        equipped_gear: userProfile?.equipped_gear || []
      };
      characterName = characterData.name;
    }
  }

  if (!characterData) {
    return (
      <View style={homeStyles.centralCharacterDisplay}>
        <LinearGradient
          colors={[
            "rgba(139, 92, 246, 0.3)",
            "rgba(79, 70, 229, 0.2)",
            "rgba(6, 182, 212, 0.3)",
          ]}
          style={homeStyles.characterFrame}
        >
          <View style={homeStyles.characterFrameInner}>
            <Text style={[homeStyles.archiveText, { textAlign: "center" }]}>
              Character data unavailable
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Get character data from wellness.homeData which has the most up-to-date backend character data
  const characterDataFromHomeData = (wellness.homeData as any)?.character || backendCharacter;

  console.log('🎨 [CharacterDisplay] Character customization data:', {
    hasHomeDataCharacter: !!(wellness.homeData as any)?.character,
    hasBackendCharacter: !!backendCharacter,
    characterFields: characterDataFromHomeData ? Object.keys(characterDataFromHomeData).filter(k => k.includes('hair') || k.includes('eye') || k.includes('shirt') || k.includes('mouth') || k.includes('skin') || k.includes('background')) : [],
    characterData: characterDataFromHomeData
  });

  // Extract customization indices with proper fallbacks to 0
  const hairStyleForPreview =
    characterDataFromHomeData?.selected_hair_style ??
    characterDataFromHomeData?.hair_style ??
    character.selectedHairStyle ?? 0;

  const hairColorForPreview =
    characterDataFromHomeData?.selected_hair_color ??
    characterDataFromHomeData?.hair_color ??
    character.selectedHairColor ?? 0;

  const shirtTypeForPreview =
    characterDataFromHomeData?.selected_shirt_type ??
    characterDataFromHomeData?.shirt_type ??
    character.selectedShirtType ?? 0;

  const shirtColorForPreview =
    characterDataFromHomeData?.selected_shirt_color ??
    characterDataFromHomeData?.shirt_color ??
    character.selectedClothesColor ?? 0;

  const eyeTypeForPreview =
    characterDataFromHomeData?.selected_eye_type ??
    characterDataFromHomeData?.eye_type ??
    character.selectedEyeType ?? 0;

  const eyeColorForPreview =
    characterDataFromHomeData?.selected_eye_color ??
    characterDataFromHomeData?.eye_color ??
    character.selectedEyeColor ?? 0;

  const eyebrowStyleForPreview =
    characterDataFromHomeData?.selected_eyebrow_style ??
    characterDataFromHomeData?.eyebrow_style ??
    character.selectedEyebrowStyle ?? 0;

  const eyebrowColorForPreview =
    characterDataFromHomeData?.selected_eyebrow_color ??
    characterDataFromHomeData?.eyebrow_color ??
    character.selectedEyebrowColor ?? 0;

  const mouthTypeForPreview =
    characterDataFromHomeData?.selected_mouth_type ??
    characterDataFromHomeData?.mouth_type ??
    character.selectedMouthType ?? 0;

  const skinColorForPreview =
    characterDataFromHomeData?.selected_skin_color ??
    characterDataFromHomeData?.skin_color ??
    character.selectedBaseColor ?? 0;

  const backgroundTypeForPreview =
    characterDataFromHomeData?.selected_background_type ??
    characterDataFromHomeData?.background_type ??
    character.selectedBackgroundType ?? 0;

  const backgroundColorForPreview =
    characterDataFromHomeData?.selected_background_color ??
    characterDataFromHomeData?.background_color ??
    character.selectedBackgroundColor ?? 0;

  const frameSize = typeof homeStyles.characterFrame?.height === 'number' ? homeStyles.characterFrame.height : 300;

  return (
    <View style={homeStyles.centralCharacterDisplay}>
      <LinearGradient
        colors={[
          "rgba(78, 230, 230, 0.3)",
          "rgba(6, 182, 212, 0.2)",
          "rgba(78, 230, 230, 0.3)",
        ]}
        style={homeStyles.characterFrame}
      >
        <View style={homeStyles.characterFrameInner}>
          <CharacterFrame
            frame={character.getCurrentBackgroundAsset(false, backgroundTypeForPreview, backgroundColorForPreview)}
            size={frameSize}
          >
            <CharacterPreview
              key={`character-preview-${backendCharacter?.id || 'default'}-${hairStyleForPreview}-${hairColorForPreview}-${shirtTypeForPreview}-${eyeTypeForPreview}-${eyebrowStyleForPreview}-${mouthTypeForPreview}-${params?.refreshCharacter || 'initial'}`}
              selectedName={characterName}
              baseAsset={character.getBaseAsset(false, skinColorForPreview)}
              background={character.getCurrentBackgroundAsset(false, backgroundTypeForPreview, backgroundColorForPreview)}
              hairSheet={character.getHairAsset(false, hairStyleForPreview, hairColorForPreview)}
              clothesSheet={character.getClothesAsset(false, shirtTypeForPreview, shirtColorForPreview)}
              eyesSheet={character.getEyesAsset(false, eyeTypeForPreview, eyeColorForPreview)}
              eyebrowsSheet={character.getEyebrowsAsset(false, eyebrowStyleForPreview, eyebrowColorForPreview)}
              mouthSheet={character.getMouthAsset(false, mouthTypeForPreview)}
              hairIndex={hairStyleForPreview}
              clothesIndex={shirtTypeForPreview}
              eyesIndex={eyeTypeForPreview}
              eyebrowsIndex={eyebrowStyleForPreview}
              mouthIndex={mouthTypeForPreview}
              size={frameSize}
              fitToFrame
            />
          </CharacterFrame>

          <View style={homeStyles.characterLevelBadge}>
            <LinearGradient
              colors={["#4ee6e6", "#06b6d4"]}
              style={homeStyles.levelBadgeGradient}
            >
              <Text style={homeStyles.levelBadgeText}>
                Lv.{characterData?.level || 1}
              </Text>
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>

      <View style={homeStyles.characterMoodBubble}>
        <LinearGradient
          colors={["rgba(244, 241, 232, 0.95)", "rgba(212, 175, 55, 0.8)"]}
          style={homeStyles.moodBubbleGradient}
        >
          <Text style={homeStyles.moodBubbleText}>
            "Ready to explore the depths of memory..."
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
};