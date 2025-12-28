import { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  Animated,
  ImageBackground,
  Dimensions,
  Image,
  StyleSheet,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGameStore } from '@/stores/game-store'
import { TheCurator } from '@/components/the-curator'
import { CharacterAvatar } from '@/components/CharacterAvatar'
import type { StoryChoice } from '@/types/story'
import { Card, Text, Button, useTheme, IconButton } from 'react-native-paper'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useStoryEngine } from '@/hooks/use-story-engine'

const { width, height } = Dimensions.get('window')

export default function Story() {
  const router = useRouter()
  const theme = useTheme()
  const { character, story, attributes, makeChoice, addEquipment, progressStory } = useGameStore()
  const playPageFlipSound = usePageFlipSound()
  const [voidOpacity] = useState(new Animated.Value(1))

  // Introduction story id from backend catalog
  const INTRODUCTION_STORY_ID = 12

  const {
    isLoading,
    error,
    currentPassage,
    choices,
    isDecision,
    isEnding,
    hasChoices,
    makeChoice: makeEngineChoice,
  } = useStoryEngine({ storyId: INTRODUCTION_STORY_ID })

  // Debug logging
  useEffect(() => {
    if (currentPassage) {
      console.log('📖 Current passage:', {
        passage_id: currentPassage.passage_id,
        passage_type: currentPassage.passage_type,
        content_preview: currentPassage.content?.substring(0, 50),
        choices_count: choices?.length || 0,
        choices: choices,
        hasChoices,
        isDecision,
        isEnding,
      })
    }
  }, [currentPassage, choices, hasChoices, isDecision, isEnding])

  // Attribute images mapping
  const attributeImages = {
    connection: {
      1: require('../attributes/connection/connectionLv1.png'),
      2: require('../attributes/connection/connectionLv2.png'),
      3: require('../attributes/connection/connectionLv3.png'),
      4: require('../attributes/connection/connectionLv4.png'),
      5: require('../attributes/connection/connectionLv5.png'),
    },
    courage: {
      1: require('../attributes/courage/courageLv1.png'),
      2: require('../attributes/courage/courageLv2.png'),
      3: require('../attributes/courage/courageLv3.png'),
      4: require('../attributes/courage/courageLv4.png'),
      5: require('../attributes/courage/courageLv5.png'),
    },
    exploration: {
      1: require('../attributes/exploration/explorationLv1.png'),
      2: require('../attributes/exploration/explorationLv2.png'),
      3: require('../attributes/exploration/explorationLv3.png'),
      4: require('../attributes/exploration/explorationLv4.png'),
      5: require('../attributes/exploration/explorationLv5.png'),
    },
    fear: {
      1: require('../attributes/fear/fear1.png'),
      2: require('../attributes/fear/fearLv2.png'),
      3: require('../attributes/fear/fearLv3.png'),
      4: require('../attributes/fear/fearLv4.png'),
      5: require('../attributes/fear/fearLv5.png'),
    },
  }

  function renderAttributeBar() {
    const attributeConfig = [
      { key: 'connection' as const, label: 'Connection' },
      { key: 'courage' as const, label: 'Courage' },
      { key: 'exploration' as const, label: 'Exploration' },
      { key: 'fear' as const, label: 'Fear' },
    ]

    return (
      <View style={styles.attributeBar}>
        {attributeConfig.map((attr) => {
          const level = attributes[attr.key]
          const imageSource = attributeImages[attr.key][level as keyof typeof attributeImages.connection]
          return (
            <View key={attr.key} style={styles.attributeItem}>
              <Image
                source={imageSource}
                style={styles.attributeIcon}
                resizeMode="contain"
              />
              <Text style={styles.attributeValue}>{level}</Text>
            </View>
          )
        })}
      </View>
    )
  }

  function renderAttributeChanges(changes?: StoryChoice['attributeChanges']) {
    if (!changes) return null

    const attributeConfig = [
      { key: 'connection' as const, images: attributeImages.connection },
      { key: 'courage' as const, images: attributeImages.courage },
      { key: 'exploration' as const, images: attributeImages.exploration },
      { key: 'fear' as const, images: attributeImages.fear },
    ]

    return (
      <View style={styles.attributeChangesContainer}>
        {attributeConfig.map((attr) => {
          const change = changes[attr.key]
          if (change === undefined || change === 0) return null
          
          const currentLevel = attributes[attr.key]
          const displayLevel = Math.max(1, Math.min(5, currentLevel))
          const imageSource = attr.images[displayLevel as keyof typeof attributeImages.connection]
          const sign = change > 0 ? '+' : ''
          
          return (
            <View key={attr.key} style={styles.attributeChangeItem}>
              <Image
                source={imageSource}
                style={styles.attributeChangeIcon}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.attributeChangeText,
                  { color: change > 0 ? '#4CAF50' : '#F44336' },
                ]}
              >
                {sign}{change}
              </Text>
            </View>
          )
        })}
      </View>
    )
  }

  useEffect(() => {
    // For now, fade the void out once the story has loaded at a fixed clarity
    const baseClarity = isLoading ? 0 : 75
    const targetOpacity = 1 - baseClarity / 100
    Animated.timing(voidOpacity, {
      toValue: targetOpacity,
      duration: 1000,
      useNativeDriver: true,
    }).start()
  }, [isLoading, voidOpacity])

  async function handleChoiceEngine(choice: { id: number | string; text: string; target_id: string }) {
    playPageFlipSound()
    await makeEngineChoice({ id: choice.id, text: choice.text, target_id: choice.target_id })
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={['top']}>
      <ImageBackground
        source={require('../hauntedlibrary.png')}
        style={{ flex: 1, width, height }}
        resizeMode="cover"
      >
        {/* Void overlay */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#000000',
            opacity: voidOpacity,
          }}
        />

        {/* Attributes Bar at Top */}
        <View
          style={{
            position: 'absolute',
            top: 50,
            left: 16,
            right: 80,
            zIndex: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: 12,
            paddingVertical: 8,
            paddingHorizontal: 12,
          }}
        >
          {renderAttributeBar()}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 24,
            paddingTop: 120,
            alignItems: 'center',
          }}
        >
          <View style={{ width: '100%' }}>
            {error && (
              <Card
                style={{
                  backgroundColor: theme.colors.errorContainer,
                  marginBottom: 16,
                  width: '100%',
                }}
              >
                <Card.Content>
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onErrorContainer, textAlign: 'center' }}
                  >
                    {error}
                  </Text>
                </Card.Content>
              </Card>
            )}

            {currentPassage && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24, marginBottom: 20 }}>
                  <TheCurator size="large" />
                  {character?.avatar && (
                    <CharacterAvatar avatarConfig={character.avatar} size={150} />
                  )}
                </View>

                <Card
                  style={{
                    backgroundColor: theme.colors.surface,
                    width: '100%',
                    marginVertical: 20,
                  }}
                >
                  <Card.Content style={{ padding: 24 }}>
                    <Text
                      variant="bodyLarge"
                      style={{
                        textAlign: 'center',
                        color: theme.colors.onSurface,
                        lineHeight: 30,
                        letterSpacing: 0.3,
                      }}
                    >
                      {currentPassage.content}
                    </Text>
                  </Card.Content>
                </Card>
              </>
            )}

            {hasChoices && !isEnding && (
              <View style={{ width: '100%', marginTop: 20 }}>
                {isDecision && (
                  <Text
                    variant="titleMedium"
                    style={{
                      textAlign: 'center',
                      marginBottom: 20,
                      color: theme.colors.onSurfaceVariant,
                      fontStyle: 'italic',
                      letterSpacing: 0.5,
                    }}
                  >
                    What do you do?
                  </Text>
                )}
                {choices.map((choice) => (
                  <Card
                    key={String(choice.id)}
                    style={{
                      backgroundColor: theme.colors.surfaceVariant,
                      marginBottom: 12,
                    }}
                    onPress={() => handleChoiceEngine(choice)}
                  >
                    <Card.Content style={{ padding: 18 }}>
                      <Text
                        variant="bodyLarge"
                        style={{
                          textAlign: 'center',
                          color: theme.colors.onSurface,
                          letterSpacing: 0.3,
                        }}
                      >
                        {choice.text}
                      </Text>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}

            {isLoading && (
              <Text
                variant="bodyMedium"
                style={{
                  marginTop: 24,
                  color: theme.colors.onSurfaceVariant,
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}
              >
                Loading story...
              </Text>
            )}

            {isEnding && !hasChoices && !isLoading && (
              <Button
                mode="contained"
                style={{ marginTop: 24 }}
                onPress={() => {
                  playPageFlipSound()
                  router.replace('/hub')
                }}
              >
                Return to the Archive
              </Button>
            )}
          </View>
        </ScrollView>
        
        <IconButton
          icon="home"
          size={24}
          iconColor={theme.colors.onSurface}
          style={{
            position: 'absolute',
            top: 50,
            right: 20,
            backgroundColor: theme.colors.surface,
          }}
          onPress={() => {
            playPageFlipSound()
            router.push('/hub')
          }}
        />
      </ImageBackground>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  attributeBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  attributeItem: {
    alignItems: 'center',
    gap: 4,
  },
  attributeIcon: {
    width: 32,
    height: 32,
  },
  attributeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F5E6D3',
  },
  attributeChangesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  attributeChangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  attributeChangeIcon: {
    width: 20,
    height: 20,
  },
  attributeChangeText: {
    fontSize: 14,
    fontWeight: '700',
  },
})
