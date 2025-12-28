import { View, ScrollView, ImageBackground, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, Text, Card } from 'react-native-paper'
import { Header } from '@/components/header'
import { AttributesDisplay } from '@/components/attributes-display'
import { EquipmentDisplay } from '@/components/equipment-display'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { GameButton } from '@/components/GameButton'
import { useUserFullProfile } from '@/api'

export default function Resources() {
  const router = useRouter()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const playPageFlipSound = usePageFlipSound()
  
  // Fetch full profile for user ID 3 (hardcoded for now)
  const { data: profileData, isLoading, error } = useUserFullProfile(3)

  return (
    <ImageBackground
      source={require('../hauntedlibrary.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { backgroundColor: theme.colors.surface }]} />

      <Header />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top + 100, 120) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurface, marginTop: 16 }}
            >
              Loading profile...
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Card style={{ backgroundColor: theme.colors.errorContainer }}>
              <Card.Content style={{ padding: 16 }}>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onErrorContainer }}
                >
                  Error loading profile: {error instanceof Error ? error.message : 'Unknown error'}
                </Text>
              </Card.Content>
            </Card>
          </View>
        )}

        {profileData && (
          <>
            {/* Profile Summary Section */}
            <View style={styles.section}>
              <View style={{ paddingHorizontal: 24 }}>
                <Text
                  variant="titleLarge"
                  style={{
                    color: theme.colors.onSurface,
                    marginBottom: 20,
                    letterSpacing: 0.5,
                    paddingHorizontal: 8,
                  }}
                >
                  Profile
                </Text>
                <Card style={{ backgroundColor: theme.colors.surface }}>
                  <Card.Content style={{ padding: 16 }}>
                    <Text
                      variant="titleMedium"
                      style={{
                        color: theme.colors.onSurface,
                        marginBottom: 12,
                      }}
                    >
                      {profileData.user.username}
                    </Text>
                    {profileData.character && (
                      <View style={{ gap: 8 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            Character:
                          </Text>
                          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                            {profileData.character.name}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            Level:
                          </Text>
                          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                            {profileData.character.level}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            Experience:
                          </Text>
                          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                            {profileData.character.experience} / {profileData.character.experience_needed}
                          </Text>
                        </View>
                        {profileData.character.wellness_stats && profileData.character.wellness_stats.length > 0 && (
                          <View style={{ marginTop: 12 }}>
                            <Text
                              variant="bodySmall"
                              style={{
                                color: theme.colors.onSurfaceVariant,
                                marginBottom: 8,
                              }}
                            >
                              Wellness Stats:
                            </Text>
                            {profileData.character.wellness_stats.map((stat, index) => (
                              <View
                                key={index}
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  marginBottom: 4,
                                }}
                              >
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                                  {stat.icon} {stat.label}:
                                </Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                                  {stat.value}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </Card.Content>
                </Card>
              </View>
            </View>

            {/* Archive Metrics Section */}
            {profileData.archive_metrics && profileData.archive_metrics.length > 0 && (
              <View style={styles.section}>
                <View style={{ paddingHorizontal: 24 }}>
                  <Text
                    variant="titleLarge"
                    style={{
                      color: theme.colors.onSurface,
                      marginBottom: 20,
                      letterSpacing: 0.5,
                      paddingHorizontal: 8,
                    }}
                  >
                    Archive Metrics
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                    {profileData.archive_metrics.map((metric, index) => (
                      <Card
                        key={index}
                        style={{
                          backgroundColor: theme.colors.surface,
                          width: '47%',
                        }}
                      >
                        <Card.Content style={{ padding: 12, alignItems: 'center' }}>
                          <Text style={{ fontSize: 32, marginBottom: 8 }}>
                            {metric.icon}
                          </Text>
                          <Text
                            variant="bodySmall"
                            style={{
                              color: theme.colors.onSurfaceVariant,
                              marginBottom: 4,
                              textAlign: 'center',
                            }}
                          >
                            {metric.label}
                          </Text>
                          <Text
                            variant="titleMedium"
                            style={{
                              color: theme.colors.onSurface,
                              fontWeight: '600',
                            }}
                          >
                            {metric.value}
                          </Text>
                          {metric.progress !== undefined && (
                            <View
                              style={{
                                width: '100%',
                                height: 4,
                                backgroundColor: theme.colors.surfaceVariant,
                                borderRadius: 2,
                                marginTop: 8,
                                overflow: 'hidden',
                              }}
                            >
                              <View
                                style={{
                                  width: `${metric.progress}%`,
                                  height: '100%',
                                  backgroundColor: theme.colors.primary,
                                }}
                              />
                            </View>
                          )}
                        </Card.Content>
                      </Card>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        <View style={styles.section}>
          {profileData?.character ? (() => {
            // Helper function to convert raw values to levels (1-5)
            // The backend returns values like 20, which should map to level 4 (20/5 = 4)
            // If max value is 25, then: 25/5=5, 20/5=4, 15/5=3, 10/5=2, 5/5=1
            function mapValueToLevel(value: number | undefined | null): number {
              // Ensure value is a number
              const numValue = typeof value === 'number' ? value : Number(value) || 0
              if (numValue <= 0) return 1
              // Divide by 5 and round to get level
              // If value is 20, result is 4; if value is 10, result is 2
              const level = Math.round(numValue / 5)
              if (level < 1) return 1
              if (level > 5) return 5
              return level
            }

            // Debug: Log the raw values to see what we're getting
            const rawValues = {
              awareness: profileData.character.awareness,
              resilience: profileData.character.resilience,
              connection: profileData.character.connection,
              balance: profileData.character.balance,
            }
            console.log('Character attributes from API (raw):', rawValues)
            console.log('Type check:', {
              awareness: typeof rawValues.awareness,
              resilience: typeof rawValues.resilience,
              connection: typeof rawValues.connection,
              balance: typeof rawValues.balance,
            })

            // Map character attributes to display attributes:
            // awareness → exploration
            // resilience → courage
            // connection → connection
            // balance → fear
            const mappedAttributes = {
              exploration: mapValueToLevel(profileData.character.awareness),
              courage: mapValueToLevel(profileData.character.resilience),
              connection: mapValueToLevel(profileData.character.connection),
              fear: mapValueToLevel(profileData.character.balance),
            }

            console.log('Mapped attributes (levels 1-5):', mappedAttributes)
            console.log('Conversion check:', {
              'awareness (raw)': rawValues.awareness,
              'exploration (level)': mappedAttributes.exploration,
              'calculation': `${rawValues.awareness} / 5 = ${rawValues.awareness / 5}, rounded = ${mappedAttributes.exploration}`,
            })

            return (
              <AttributesDisplay
                showImages={true}
                attributes={mappedAttributes}
              />
            )
          })() : (
            <AttributesDisplay showImages={true} />
          )}
        </View>

        <View style={styles.section}>
          <EquipmentDisplay />
        </View>

        <View style={styles.buttonContainer}>
          <GameButton
            normalImage={require('../assets/UI/buttons/blue/Button_05A_Normal.png')}
            selectedImage={require('../assets/UI/buttons/blue/Button_05A_Pressed.png')}
            pressedImage={require('../assets/UI/buttons/blue/Button_05A_Pressed.png')}
            label="Return to Archive"
            onPress={() => {
              playPageFlipSound()
              router.push('/hub')
            }}
            width={200}
            height={50}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
})

