import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, LinearGradient, Icon, StyleSheet } from '../../../imports';

interface InscriptionsTabProps {
  homeStyles: any;
  storyStyles: any;
  homeTheme: any;
  wellness: any;
  ui: any;
  archive: any;
}

export const InscriptionsTab: React.FC<InscriptionsTabProps> = ({
  homeStyles,
  storyStyles,
  homeTheme,
  wellness,
  ui,
  archive
}) => {
  // Auto-load prompts when tab is mounted
  useEffect(() => {
    const unlockedAreas = ["entrance"];
    const completedStories = Array.from(archive.completedStories);
    wellness.loadCategoryPrompts(unlockedAreas, completedStories);
  }, [archive.completedStories, wellness]);

  return (
    <View style={homeStyles.tabpassagesArea}>
      {/* Current Journal Prompts Section */}
      <View style={[storyStyles.centeredMessageContainer, {
        borderColor: '#d4af37',
        borderWidth: 2,
        shadowColor: '#d4af37',
        shadowOffset: { width: 2, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
        overflow: 'hidden',
      }]}>
        <LinearGradient
          colors={[
            homeTheme.foundationCardGradientStart,
            homeTheme.foundationCardGradientMiddle,
            homeTheme.foundationCardGradientEnd,
          ]}
          style={StyleSheet.absoluteFillObject}
        />

        <Text style={[storyStyles.centeredMessageTitle, {
          fontSize: 18,
          marginBottom: 12,
          color: 'rgba(78, 230, 230, 0.8)',
          fontWeight: '600',
          letterSpacing: 2,
          textShadowColor: 'rgba(78, 230, 230, 0.3)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        }]}>
          📝 Current Journal Prompts
        </Text>

        <TouchableOpacity
          style={{
            marginBottom: 16,
            backgroundColor: 'rgba(78, 230, 230, 0.3)',
            borderRadius: 20,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: 'rgba(78, 230, 230, 0.5)',
            shadowColor: 'rgba(78, 230, 230, 0.2)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
            alignSelf: 'flex-start',
          }}
          onPress={() => {
            const unlockedAreas = ["entrance"];
            const completedStories = Array.from(archive.completedStories);
            wellness.loadCategoryPrompts(unlockedAreas, completedStories);
          }}
        >
          <Text style={{
            color: 'rgba(78, 230, 230, 0.9)',
            fontSize: 14,
            fontWeight: '600',
            textShadowColor: 'rgba(78, 230, 230, 0.2)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}>
            Load Prompts
          </Text>
        </TouchableOpacity>

        <View style={{ width: '100%', marginBottom: 20 }}>
          {['journal', 'draw', 'voice'].map((category) => {
            const prompt = wellness.categoryPrompts[category as keyof typeof wellness.categoryPrompts];
            return (
              <View key={category} style={{
                backgroundColor: 'rgba(78, 230, 230, 0.1)',
                padding: 12,
                marginBottom: 8,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#4ee6e6',
                shadowColor: '#4ee6e6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
              }}>
                <Text style={{
                  color: 'rgba(78, 230, 230, 0.7)',
                  fontSize: 14,
                  fontWeight: '600',
                  marginBottom: 4,
                  textTransform: 'capitalize',
                  textShadowColor: 'rgba(78, 230, 230, 0.2)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}>
                  {category} Quest:
                </Text>
                <Text style={{
                  color: '#ffe066',
                  fontSize: 12,
                  lineHeight: 16,
                  textShadowColor: 'rgba(255, 224, 102, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}>
                  {prompt
                    ? `${prompt.text} (${prompt.skill_category} - ${prompt.difficulty})`
                    : "No quest available yet"
                  }
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* The Codex Section */}
      <View style={[storyStyles.centeredMessageContainer, {
        borderColor: '#d4af37',
        borderWidth: 2,
        shadowColor: '#d4af37',
        shadowOffset: { width: 2, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
        overflow: 'hidden',
      }]}>
        <LinearGradient
          colors={[
            homeTheme.foundationCardGradientStart,
            homeTheme.foundationCardGradientMiddle,
            homeTheme.foundationCardGradientEnd,
          ]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Icon
            name="edit-3"
            size={40}
            color="#4ee6e6"
            style={{ marginRight: 12 }}
          />
          <Text style={[storyStyles.centeredMessageTitle, {
            color: 'rgba(78, 230, 230, 0.8)',
            fontSize: 24,
            fontWeight: '600',
            letterSpacing: 2,
            textShadowColor: 'rgba(78, 230, 230, 0.3)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }]}>The Codex</Text>
        </View>
        <Text style={[storyStyles.centeredMessageText, {
          color: '#d4af37',
          textShadowColor: 'rgba(212, 175, 55, 0.3)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        }]}>
          Your personal journal for reflections, insights, and tracking
          your journey of self-discovery.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: 'rgba(78, 230, 230, 0.3)',
            borderRadius: 20,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderWidth: 1,
            borderColor: 'rgba(78, 230, 230, 0.5)',
            shadowColor: 'rgba(78, 230, 230, 0.2)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
            marginTop: 16,
          }}
          onPress={() => ui.setIsCodexVisible(true)}
        >
          <Text style={{
            color: 'rgba(78, 230, 230, 0.9)',
            fontSize: 16,
            fontWeight: '600',
            textShadowColor: 'rgba(78, 230, 230, 0.2)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}>
            Open Your Journal
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};