import React from 'react'
import { View, Text as RNText, StyleSheet, Image } from 'react-native'
import { parseQuoteContent } from '@/utils/format-quote'
import { getStoryImageUrl, normalizeSpeakerName } from '@/utils/story-helpers'
import { STORY_COLORS, STORY_SPACING, STORY_BORDER_RADIUS, STORY_FONT_SIZES, STORY_FONTS, STORY_LINE_HEIGHTS, STORY_LAYOUT } from './story-theme'
import type { PassageType } from '@/types/story'

interface StoryPassageProps {
  content: string
  passageType?: PassageType
  speakerName?: string | null
  speakerImage?: string | null
}

export function StoryPassage({ content, passageType, speakerName, speakerImage }: StoryPassageProps) {
  const quoteParts = parseQuoteContent(content)
  
  // If speaker_name is "Quote", always format as a quote
  const isQuoteBySpeaker = speakerName === 'Quote'

  // Render as quote if speaker_name is "Quote" or if it's a detected quote in narration
  if (isQuoteBySpeaker || (passageType === 'narration' && quoteParts.isQuote)) {
    // If quote detected by speaker, use full content; otherwise use parsed quote parts
    const quoteBody = isQuoteBySpeaker ? content : quoteParts.quoteBody
    const attribution = isQuoteBySpeaker ? null : quoteParts.attribution
    
    return (
      <View style={styles.quoteContainer}>
        <RNText style={styles.quoteText}>{quoteBody}</RNText>
        {attribution && (
          <RNText style={styles.quoteAttribution}>{attribution}</RNText>
        )}
      </View>
    )
  }

  switch (passageType) {
    case 'narration':
      return (
        <RNText style={styles.narrationText}>{content}</RNText>
      )
    case 'dialogue':
      const imageUrl = getStoryImageUrl(speakerImage)
      const normalizedSpeakerName = normalizeSpeakerName(speakerName)
      return (
        <View style={styles.dialogueContainer}>
          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={styles.speakerAvatar}
              resizeMode="cover"
            />
          )}
          <View style={styles.dialogueBubble}>
            {normalizedSpeakerName && (
              <RNText style={styles.speakerNameText}>{normalizedSpeakerName}</RNText>
            )}
            <RNText style={styles.dialogueText}>{content}</RNText>
          </View>
        </View>
      )
    case 'decision':
      const decisionImageUrl = getStoryImageUrl(speakerImage)
      return (
        <View style={styles.decisionContainer}>
          {decisionImageUrl && (
            <Image
              source={{ uri: decisionImageUrl }}
              style={styles.decisionImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.decisionHeader}>
            <RNText style={styles.decisionLabel}>DECISION</RNText>
          </View>
          <RNText style={styles.decisionText}>{content}</RNText>
          <RNText style={styles.decisionSubtext}>Your choice will have an impact</RNText>
        </View>
      )
    case 'action':
      const actionImageUrl = getStoryImageUrl(speakerImage)
      return (
        <View style={styles.actionContainer}>
          {actionImageUrl && (
            <Image
              source={{ uri: actionImageUrl }}
              style={styles.actionImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.actionContent}>
            <View style={styles.actionIndicator} />
            <RNText style={styles.actionText}>{content}</RNText>
          </View>
        </View>
      )
    case 'ending':
      return (
        <View style={styles.endingContainer}>
          <RNText style={styles.endingText}>{content}</RNText>
        </View>
      )
    default:
      return (
        <RNText style={styles.storyText}>{content}</RNText>
      )
  }
}

const styles = StyleSheet.create({
  storyText: {
    fontFamily: STORY_FONTS.system,
    fontSize: STORY_FONT_SIZES.base,
    color: STORY_COLORS.text,
    lineHeight: STORY_LINE_HEIGHTS.md,
    textAlign: 'left',
  },
  narrationText: {
    fontFamily: STORY_FONTS.vt323,
    fontSize: STORY_FONT_SIZES.xl,
    color: STORY_COLORS.text,
    lineHeight: STORY_LINE_HEIGHTS.lg,
    textAlign: 'left',
    letterSpacing: 0.5,
  },
  dialogueContainer: {
    flexDirection: 'row',
    marginVertical: STORY_SPACING.sm,
    alignItems: 'flex-end',
    gap: STORY_SPACING.md,
  },
  speakerAvatar: {
    width: STORY_LAYOUT.speakerAvatarSize,
    height: STORY_LAYOUT.speakerAvatarSize,
    borderRadius: STORY_LAYOUT.speakerAvatarSize / 2,
    borderWidth: 2,
    borderColor: STORY_COLORS.avatarBorder,
  },
  dialogueBubble: {
    backgroundColor: STORY_COLORS.dialogueBubble,
    borderRadius: STORY_BORDER_RADIUS.xl,
    paddingVertical: STORY_SPACING.md,
    paddingHorizontal: STORY_SPACING.lg,
    flex: 1,
    maxWidth: '80%',
    borderTopLeftRadius: STORY_BORDER_RADIUS.sm,
  },
  speakerNameText: {
    fontFamily: STORY_FONTS.system,
    fontSize: STORY_FONT_SIZES.sm,
    color: STORY_COLORS.textTertiary,
    marginBottom: STORY_SPACING.xs,
    fontWeight: '600',
  },
  dialogueText: {
    fontFamily: STORY_FONTS.vt323,
    fontSize: STORY_FONT_SIZES.base,
    color: STORY_COLORS.text,
    lineHeight: STORY_LINE_HEIGHTS.sm,
  },
  decisionContainer: {
    backgroundColor: STORY_COLORS.decisionContainer,
    borderRadius: STORY_BORDER_RADIUS.lg,
    paddingVertical: STORY_SPACING.xxl,
    paddingHorizontal: STORY_SPACING.xxl,
    marginVertical: STORY_SPACING.xl,
    borderWidth: 2,
    borderColor: STORY_COLORS.decisionBorder,
    borderStyle: 'solid',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  decisionHeader: {
    alignItems: 'center',
    marginBottom: STORY_SPACING.md,
  },
  decisionLabel: {
    fontFamily: STORY_FONTS.system,
    fontSize: STORY_FONT_SIZES.sm,
    fontWeight: '700',
    letterSpacing: 3,
    color: STORY_COLORS.decisionLabel,
    textAlign: 'center',
  },
  decisionText: {
    fontFamily: STORY_FONTS.system,
    fontSize: STORY_FONT_SIZES.lg,
    color: STORY_COLORS.text,
    lineHeight: STORY_LINE_HEIGHTS.lg,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: STORY_SPACING.md,
  },
  decisionSubtext: {
    fontFamily: STORY_FONTS.system,
    fontSize: STORY_FONT_SIZES.sm,
    color: STORY_COLORS.decisionSubtext,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  decisionImage: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginBottom: STORY_SPACING.md,
    borderRadius: STORY_BORDER_RADIUS.md,
  },
  actionContainer: {
    backgroundColor: STORY_COLORS.actionContainer,
    borderRadius: STORY_BORDER_RADIUS.lg,
    marginVertical: STORY_SPACING.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: STORY_COLORS.actionBorder,
  },
  actionImage: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  actionContent: {
    paddingVertical: STORY_SPACING.lg,
    paddingHorizontal: STORY_SPACING.xl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: STORY_SPACING.md,
  },
  actionIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: STORY_COLORS.actionIndicator,
    marginTop: 6,
    flexShrink: 0,
  },
  actionText: {
    fontFamily: STORY_FONTS.system,
    fontSize: STORY_FONT_SIZES.base,
    color: STORY_COLORS.text,
    lineHeight: STORY_LINE_HEIGHTS.md,
    textAlign: 'left',
    flex: 1,
    fontWeight: '500',
  },
  endingContainer: {
    backgroundColor: STORY_COLORS.endingContainer,
    borderRadius: STORY_BORDER_RADIUS.lg,
    paddingVertical: STORY_SPACING.xxl,
    paddingHorizontal: STORY_SPACING.xxl,
    marginVertical: STORY_SPACING.xxl,
    borderWidth: 2,
    borderColor: STORY_COLORS.endingBorder,
  },
  endingText: {
    fontFamily: STORY_FONTS.vt323,
    fontSize: STORY_FONT_SIZES.xxl,
    color: STORY_COLORS.text,
    lineHeight: STORY_LINE_HEIGHTS.xl,
    textAlign: 'center',
  },
  quoteContainer: {
    backgroundColor: STORY_COLORS.quoteContainer,
    borderRadius: STORY_BORDER_RADIUS.lg,
    paddingVertical: STORY_SPACING.xl,
    paddingHorizontal: STORY_SPACING.xxl,
    marginVertical: STORY_SPACING.lg,
    borderLeftWidth: STORY_SPACING.xs,
    borderLeftColor: STORY_COLORS.quoteBorder,
  },
  quoteText: {
    fontFamily: STORY_FONTS.crimsonItalic,
    fontSize: STORY_FONT_SIZES.lg,
    color: STORY_COLORS.text,
    lineHeight: STORY_LINE_HEIGHTS.lg,
    textAlign: 'left',
    marginBottom: STORY_SPACING.md,
  },
  quoteAttribution: {
    fontFamily: STORY_FONTS.vt323,
    fontSize: STORY_FONT_SIZES.base,
    color: STORY_COLORS.textSecondary,
    textAlign: 'right',
    marginTop: STORY_SPACING.sm,
    fontWeight: 'bold',
  },
})

