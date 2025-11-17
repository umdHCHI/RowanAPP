import React from 'react';
import { View, Text, Image, TouchableOpacity, LinearGradient, BlurView } from '../../../imports';
import { archiveHeaderIcon } from '../../../assets/equipment';
import { getUserTitle } from '../utils/userTitle';
import { selectProfileAndCharacter } from '../utils/profileHelpers';

interface ArchiveHeaderProps {
  homeStyles: any;
  wellness: any;
  auth: any;
  character: any;
  startTutorial: () => void;
}

export const ArchiveHeader: React.FC<ArchiveHeaderProps> = ({
  homeStyles,
  wellness,
  auth,
  character,
  startTutorial
}) => {
  const { profile: userProfile, backendCharacter } = selectProfileAndCharacter(wellness.homeData);
  const userId = (auth.user as any)?.id ||
               (userProfile as any)?.id ||
               (backendCharacter as any)?.id ||
               auth.characterId ||
               (auth.user as any)?.username?.length || 1;

  const title = getUserTitle(userId);
  const name = backendCharacter?.name || userProfile?.username || userProfile?.email || character.getCharacterName() || "Unnamed Character";

  return (
    <View style={homeStyles.archiveHeader}>
      <LinearGradient
        colors={[
          "rgba(10, 11, 15, 0.9)",
          "rgba(30, 41, 59, 0.8)",
          "rgba(10, 11, 15, 0.9)",
        ]}
        style={homeStyles.archiveHeaderGradient}
      >
        <BlurView intensity={15} style={homeStyles.archiveHeaderpassages}>
          <View style={homeStyles.archiveHeaderLeft}>
            <LinearGradient
              colors={["#4ee6e6", "#06b6d4", "#0891b2"]}
              style={homeStyles.archiveHeaderIcon}
            >
              <Image
                source={archiveHeaderIcon}
                style={{
                  width: 24,
                  height: 24,
                }}
                resizeMode="contain"
              />
            </LinearGradient>

            <View style={homeStyles.archiveHeaderTextContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{
                  ...homeStyles.archiveHeaderTitle,
                  color: '#4ee6e6',
                  fontSize: 24,
                  fontWeight: 'bold',
                  letterSpacing: 3,
                  textShadowColor: 'rgba(78, 230, 230, 0.5)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 8,
                }}>
                  The Archive
                </Text>

                {/* Tutorial Button */}
                <TouchableOpacity
                  onPress={startTutorial}
                  style={{
                    backgroundColor: 'rgba(78, 230, 230, 0.8)',
                    borderRadius: 12,
                    width: 26,
                    height: 26,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 10,
                    shadowColor: '#4ee6e6',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.5,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  <Text style={{ color: '#0a0b0f', fontSize: 14, fontWeight: 'bold' }}>?</Text>
                </TouchableOpacity>
              </View>
              <Text style={{
                ...homeStyles.archiveHeaderSubtitle,
                color: '#d4af37',
                fontSize: 16,
                fontStyle: 'italic',
                marginBottom: 4,
              }}>
                {`${title || 'NO TITLE RETURNED'} ${name}`}
              </Text>
              <View style={homeStyles.archiveStatusIndicator}>
                <View style={[homeStyles.archiveStatusDot, { backgroundColor: '#4ee6e6' }]} />
                <Text style={{
                  ...homeStyles.archiveStatusText,
                  color: '#4ee6e6',
                  fontSize: 12,
                  fontStyle: 'italic',
                  opacity: 0.8,
                }}>
                  Archive systems active
                </Text>
              </View>
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    </View>
  );
};
