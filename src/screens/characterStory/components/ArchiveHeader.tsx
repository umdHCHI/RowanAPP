import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  LinearGradient,
  BlurView,
} from "../../../imports";
import { archiveHeaderIcon } from "../../../assets/equipment";
import { sectionIcons } from "../../../assets/ui";
import { getUserTitle } from "../utils/userTitle";
import { selectProfileAndCharacter } from "../utils/profileHelpers";
import { CharacterDisplay } from "./CharacterDisplay";
import { CuratorSprite } from "./CuratorSprite";

interface ArchiveHeaderProps {
  homeStyles: any;
  wellness: any;
  auth: any;
  character: any;
  startTutorial: () => void;
  isLoadingCharacterData?: boolean;
  params?: any;
}

export const ArchiveHeader: React.FC<ArchiveHeaderProps> = ({
  homeStyles,
  wellness,
  auth,
  character,
  startTutorial,
  isLoadingCharacterData = false,
  params,
}) => {
  const { profile: userProfile, backendCharacter } = selectProfileAndCharacter(
    wellness.homeData
  );
  const userId =
    (auth.user as any)?.id ||
    (userProfile as any)?.id ||
    (backendCharacter as any)?.id ||
    auth.characterId ||
    (auth.user as any)?.username?.length ||
    1;

  const title = getUserTitle(userId);
  const name =
    backendCharacter?.name ||
    userProfile?.username ||
    userProfile?.email ||
    character.getCharacterName() ||
    "Unnamed Character";

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
          <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
            {/* Left Side - Character and Info */}
            <View style={homeStyles.archiveHeaderLeft}>
              <View
                style={[
                  homeStyles.archiveHeaderIcon,
                  {
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    overflow: "hidden",
                    backgroundColor: "transparent",
                    borderWidth: 2,
                    borderColor: "#d4af37",
                    shadowColor: "#d4af37",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <CharacterDisplay
                  wellness={wellness}
                  character={character}
                  homeStyles={{
                    ...homeStyles,
                    centralCharacterDisplay: { flex: 1 },
                    characterFrame: {
                      height: 80,
                      width: 80,
                      borderRadius: 40,
                      overflow: "hidden",
                    },
                    characterFrameInner: { flex: 1 },
                    characterLevelBadge: { display: "none" },
                    characterMoodBubble: { display: "none" },
                  }}
                  isLoadingCharacterData={isLoadingCharacterData}
                  params={params}
                />
              </View>

              <View style={homeStyles.archiveHeaderTextContainer}>
                <Text
                  style={{
                    ...homeStyles.archiveHeaderTitle,
                    color: "#4ee6e6",
                    fontSize: 24,
                    fontWeight: "bold",
                    letterSpacing: 3,
                    textShadowColor: "rgba(78, 230, 230, 0.5)",
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 8,
                    textAlign: "center",
                  }}
                >
                  The Archive
                </Text>
                <Text
                  style={{
                    ...homeStyles.archiveHeaderSubtitle,
                    color: "#d4af37",
                    fontSize: 16,
                    fontStyle: "italic",
                    marginBottom: 4,
                  }}
                >
                  {`${title || "NO TITLE RETURNED"} ${name}`}
                </Text>
              </View>
            </View>

            {/* Right Side - Curator */}
            <View
              style={{
                flex: 1,
                alignItems: "flex-end",
                justifyContent: "center",
                paddingRight: 20,
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  overflow: "hidden",
                  backgroundColor: "transparent",
                  borderWidth: 2,
                  borderColor: "#d4af37",
                  shadowColor: "#d4af37",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CuratorSprite scale={1.25} />
              </View>
              <Text
                style={{
                  color: "#d4af37",
                  fontSize: 12,
                  fontStyle: "italic",
                  marginTop: 4,
                  textAlign: "center",
                  opacity: 0.9,
                }}
              >
                The Curator
              </Text>
            </View>
          </View>

          {/* Tutorial Button - Bottom Right */}
          <TouchableOpacity
            onPress={startTutorial}
            style={{
              position: "absolute",
              bottom: 15,
              right: 15,
              backgroundColor: "rgba(78, 230, 230, 0.8)",
              borderRadius: 12,
              width: 26,
              height: 26,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#4ee6e6",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text
              style={{
                color: "#0a0b0f",
                fontSize: 14,
                fontWeight: "bold",
              }}
            >
              ?
            </Text>
          </TouchableOpacity>
        </BlurView>
      </LinearGradient>
    </View>
  );
};
