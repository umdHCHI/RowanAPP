import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, LinearGradient, Icon, Alert } from '../../../imports';
import { useThoughtDefenderProgression } from '../../../hooks/useThoughtDefenderProgression';
import { GameData } from '../../../types';
import { apiService } from '../../../services/apiService';

interface DefenderTabProps {
  homeStyles: any;
  storyStyles: any;
  theme: any;
  ui: any;
}

export const DefenderTab: React.FC<DefenderTabProps> = ({
  homeStyles,
  storyStyles,
  theme,
  ui
}) => {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch game data on mount and when the tab becomes visible
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.fetchUserGameData();
        setGameData(data);
      } catch (error) {
        console.error('[DefenderTab] Failed to fetch game data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameData();

    // Optional: Refresh data periodically if user stays on this tab
    const interval = setInterval(fetchGameData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate progression using the hook
  const progression = useThoughtDefenderProgression(gameData);

  // Show loading state if data is still being fetched
  if (isLoading) {
    return (
      <View style={homeStyles.tabpassagesArea}>
        <View style={[
          storyStyles.centeredMessageContainer,
          {
            padding: 20,
            alignItems: 'center',
            justifyContent: 'center'
          }
        ]}>
          <Text style={{ color: '#4ee6e6', fontSize: 16 }}>Loading your progression data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={homeStyles.tabpassagesArea}>
      {/* Mind Defender Game Section */}
      <View style={[
        storyStyles.centeredMessageContainer,
        {
          paddingHorizontal: 16,
          paddingVertical: 16,
          marginBottom: 16,
          borderRadius: 12,
          backgroundColor: 'rgba(10, 11, 15, 0.95)',
          borderWidth: 2,
          borderColor: '#d4af37',
          shadowColor: '#d4af37',
          shadowOffset: { width: 2, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 12,
          alignSelf: 'center',
          maxWidth: '100%'
        }
      ]}>
        <Text style={[storyStyles.centeredMessageTitle, {
          color: '#4ee6e6',
          fontSize: 24,
          fontWeight: 'bold',
          letterSpacing: 2,
          textShadowColor: 'rgba(78, 230, 230, 0.5)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4,
        }]}>
          ⚡ Mind Defender
        </Text>
        <Text style={[storyStyles.centeredMessageText, {
          color: '#d4af37',
          textShadowColor: 'rgba(212, 175, 55, 0.3)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        }]}>
          A mini-game to train your focus and resilience against intrusive thoughts.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#2a8a8a',
            borderRadius: 20,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderWidth: 2,
            borderColor: '#2a8a8a',
            shadowColor: '#2a8a8a',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 8,
            marginTop: 16,
          }}
          onPress={() => ui.setIsThoughtDefenderVisible(true)}
        >
          <Text style={{
            color: '#ffffff',
            fontSize: 16,
            fontWeight: 'bold',
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}>
            Play Now
          </Text>
        </TouchableOpacity>
      </View>

      {/* Skill Progression Levels Section */}
      <View style={[homeStyles.foundationsSection, {
        backgroundColor: 'rgba(10, 11, 15, 0.95)',
        borderColor: '#d4af37',
        borderWidth: 2,
        shadowColor: '#d4af37',
        shadowOffset: { width: 2, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
      }]}>
        <View style={[homeStyles.foundationsHeader, {
          borderBottomColor: '#d4af37',
          borderBottomWidth: 1,
        }]}>
          <Icon name="target" size={20} color="#4ee6e6" />
          <Text style={[homeStyles.foundationsTitle, {
            color: '#4ee6e6',
            fontWeight: 'bold',
            letterSpacing: 2,
            textShadowColor: 'rgba(78, 230, 230, 0.5)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }]}>
            Skill Progression Levels
          </Text>
          <Icon name="target" size={20} color="#4ee6e6" />
        </View>
        <Text style={[homeStyles.foundationsSubtitle, {
          color: '#d4af37',
          textShadowColor: 'rgba(212, 175, 55, 0.3)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        }]}>
          Your performance contributes to overall foundation growth
        </Text>

        <View style={homeStyles.foundationsGrid}>
          {/* Master Level Performance */}
          <TouchableOpacity
            style={homeStyles.foundationCard}
            onPress={() => Alert.alert(
              "🏆 Master Level Performance",
              `Current Progress: ${progression.masterLevel.current}/${progression.masterLevel.max}\n\nHigh score + Win + Long survival\n\n✨ Lumens: +400+\n🧠 Awareness: +3\n💪 Resilience: +3\n🤝 Connection: +2\n⚖️ Balance: +2\n\n🎯 Strategy: Focus on accuracy, survive long, clear positive thoughts!\n\n📊 Your Stats:\nTotal Games: ${progression.totalGames}\nWin Rate: ${progression.winRate.toFixed(1)}%\nHighest Score: ${progression.highestScore}\n\n📈 ${progression.masterLevel.requirements}`
            )}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[
                "rgba(10, 11, 15, 0.9)",
                "rgba(30, 41, 59, 0.7)",
                "rgba(10, 11, 15, 0.9)",
              ]}
              style={[homeStyles.foundationCardGradient, {
                borderColor: '#d4af37',
                borderWidth: 1,
                shadowColor: '#d4af37',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
              }]}
            >
              <View style={homeStyles.foundationIconContainer}>
                <Text style={homeStyles.foundationIcon}>
                  {progression.masterLevel.icon}
                </Text>
              </View>
              <View style={homeStyles.foundationValueContainer}>
                <Text style={homeStyles.foundationValue}>
                  {progression.masterLevel.current}
                  <Text style={homeStyles.foundationMaxValue}>
                    /{progression.masterLevel.max}
                  </Text>
                </Text>
                <Text style={homeStyles.foundationLevel}>
                  {progression.masterLevel.name}
                </Text>
              </View>
              <View style={homeStyles.foundationProgressContainer}>
                <View style={homeStyles.foundationProgressBar}>
                  <LinearGradient
                    colors={progression.masterLevel.color as any}
                    style={[homeStyles.foundationProgressFill, { width: `${progression.masterLevel.progress}%` }]}
                  />
                </View>
                <Text style={homeStyles.xpToNext}>
                  {progression.masterLevel.description}
                </Text>
              </View>
              <Text style={homeStyles.foundationLabel}>
                Master
              </Text>
              <Text style={homeStyles.foundationDescription}>
                Contributes to foundation growth
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Adept Level Performance */}
          <TouchableOpacity
            style={homeStyles.foundationCard}
            onPress={() => Alert.alert(
              "🔄 Adept Level Performance",
              `Current Progress: ${progression.adeptLevel.current}/${progression.adeptLevel.max}\n\nDecent score + Loss + Moderate effort\n\n✨ Lumens: +200\n🧠 Awareness: +1\n💪 Resilience: +1\n🤝 Connection: +2\n⚖️ Balance: 0\n\n🎯 Strategy: Focus on positive thoughts, improve accuracy!\n\n📊 Your Stats:\nTotal Games: ${progression.totalGames}\nAverage Accuracy: ${progression.averageAccuracy.toFixed(1)}%\nSurvival Time: ${Math.floor(progression.totalSurvivalTimeSeconds / 60)}m ${progression.totalSurvivalTimeSeconds % 60}s\n\n📈 ${progression.adeptLevel.requirements}`
            )}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[
                "rgba(10, 11, 15, 0.9)",
                "rgba(30, 41, 59, 0.7)",
                "rgba(10, 11, 15, 0.9)",
              ]}
              style={[homeStyles.foundationCardGradient, {
                borderColor: '#d4af37',
                borderWidth: 1,
                shadowColor: '#d4af37',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
              }]}
            >
              <View style={homeStyles.foundationIconContainer}>
                <Text style={homeStyles.foundationIcon}>
                  {progression.adeptLevel.icon}
                </Text>
              </View>
              <View style={homeStyles.foundationValueContainer}>
                <Text style={homeStyles.foundationValue}>
                  {progression.adeptLevel.current}
                  <Text style={homeStyles.foundationMaxValue}>
                    /{progression.adeptLevel.max}
                  </Text>
                </Text>
                <Text style={homeStyles.foundationLevel}>
                  {progression.adeptLevel.name}
                </Text>
              </View>
              <View style={homeStyles.foundationProgressContainer}>
                <View style={homeStyles.foundationProgressBar}>
                  <LinearGradient
                    colors={progression.adeptLevel.color as any}
                    style={[homeStyles.foundationProgressFill, { width: `${progression.adeptLevel.progress}%` }]}
                  />
                </View>
                <Text style={homeStyles.xpToNext}>
                  {progression.adeptLevel.description}
                </Text>
              </View>
              <Text style={homeStyles.foundationLabel}>
                Adept
              </Text>
              <Text style={homeStyles.foundationDescription}>
                Steady foundation building
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Novice Level Performance */}
          <TouchableOpacity
            style={homeStyles.foundationCard}
            onPress={() => Alert.alert(
              "⚠️ Novice Level Performance",
              "Low score + Quick loss + Low accuracy\n\n✨ Lumens: +50\n🧠 Awareness: -1\n💪 Resilience: -1\n�� Connection: +1\n⚖️ Balance: -1\n\n🎯 Strategy: Practice accuracy, focus on survival time!\n\n📈 Learning phase - every attempt builds understanding"
            )}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[
                "rgba(10, 11, 15, 0.9)",
                "rgba(30, 41, 59, 0.7)",
                "rgba(10, 11, 15, 0.9)",
              ]}
              style={[homeStyles.foundationCardGradient, {
                borderColor: '#d4af37',
                borderWidth: 1,
                shadowColor: '#d4af37',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
              }]}
            >
              <View style={homeStyles.foundationIconContainer}>
                <Text style={homeStyles.foundationIcon}>
                  {progression.noviceLevel.icon}
                </Text>
              </View>
              <View style={homeStyles.foundationValueContainer}>
                <Text style={homeStyles.foundationValue}>
                  {progression.noviceLevel.current}
                  <Text style={homeStyles.foundationMaxValue}>
                    /{progression.noviceLevel.max}
                  </Text>
                </Text>
                <Text style={homeStyles.foundationLevel}>
                  {progression.noviceLevel.name}
                </Text>
              </View>
              <View style={homeStyles.foundationProgressContainer}>
                <View style={homeStyles.foundationProgressBar}>
                  <LinearGradient
                    colors={progression.noviceLevel.color as any}
                    style={[homeStyles.foundationProgressFill, { width: `${progression.noviceLevel.progress}%` }]}
                  />
                </View>
                <Text style={homeStyles.xpToNext}>
                  {progression.noviceLevel.description}
                </Text>
              </View>
              <Text style={homeStyles.foundationLabel}>
                Novice
              </Text>
              <Text style={homeStyles.foundationDescription}>
                Learning and growing
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progression Tips Section */}
      <View style={[homeStyles.foundationsSection, {
        backgroundColor: 'rgba(10, 11, 15, 0.95)',
        borderColor: '#d4af37',
        borderWidth: 2,
        shadowColor: '#d4af37',
        shadowOffset: { width: 2, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
      }]}>
        <View style={[homeStyles.foundationsHeader, {
          borderBottomColor: '#d4af37',
          borderBottomWidth: 1,
        }]}>
          <Icon name="lightbulb" size={20} color="#4ee6e6" />
          <Text style={[homeStyles.foundationsTitle, {
            color: '#4ee6e6',
            fontWeight: 'bold',
            letterSpacing: 2,
            textShadowColor: 'rgba(78, 230, 230, 0.5)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }]}>
            Progression Tips
          </Text>
          <Icon name="lightbulb" size={20} color="#4ee6e6" />
        </View>
        <Text style={[homeStyles.foundationsSubtitle, {
          color: '#d4af37',
          textShadowColor: 'rgba(212, 175, 55, 0.3)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        }]}>
          Maximize your mental wellness gains
        </Text>

        <View style={{
          paddingHorizontal: 16,
          paddingVertical: 12
        }}>
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: 12,
            marginBottom: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)'
          }}>
            <Text style={{
              color: '#FCD34D',
              fontSize: 14,
              fontWeight: 'bold',
              marginBottom: 4
            }}>
              🎯 Accuracy First
            </Text>
            <Text style={{
              color: theme.theme.archiveText || '#ffffff',
              fontSize: 12,
              lineHeight: 16
            }}>
              Focus on hitting negative thoughts accurately. High accuracy boosts Awareness and Balance.
            </Text>
          </View>

          <View style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: 12,
            marginBottom: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)'
          }}>
            <Text style={{
              color: '#10B981',
              fontSize: 14,
              fontWeight: 'bold',
              marginBottom: 4
            }}>
              💚 Prioritize Positive Thoughts
            </Text>
            <Text style={{
              color: theme.theme.archiveText || '#ffffff',
              fontSize: 12,
              lineHeight: 16
            }}>
              Tap green thoughts for power-ups and Connection gains. They're always beneficial!
            </Text>
          </View>

          <View style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: 12,
            marginBottom: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)'
          }}>
            <Text style={{
              color: '#06B6D4',
              fontSize: 14,
              fontWeight: 'bold',
              marginBottom: 4
            }}>
              ⏱️ Survive Longer
            </Text>
            <Text style={{
              color: theme.theme.archiveText || '#ffffff',
              fontSize: 12,
              lineHeight: 16
            }}>
              Focus on survival time to boost Resilience. Even losses can be valuable with good effort.
            </Text>
          </View>

          <View style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: 12,
            marginBottom: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)'
          }}>
            <Text style={{
              color: '#A855F7',
              fontSize: 14,
              fontWeight: 'bold',
              marginBottom: 4
            }}>
              🎮 Practice Makes Progress
            </Text>
            <Text style={{
              color: theme.theme.archiveText || '#ffffff',
              fontSize: 12,
              lineHeight: 16
            }}>
              Don't worry about losses - they're part of learning. Focus on gradual improvement over time.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};