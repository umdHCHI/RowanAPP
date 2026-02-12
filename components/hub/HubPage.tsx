
import { ScrollView, Dimensions, View } from 'react-native'
import { StoryCard } from './StoryCard'
import { ResourceCard } from './ResourceCard'
import { ProgressIndicator } from './ProgressIndicator'
import { hubPageStyles } from '@/styles/hub/hub-styles'
import type { HubPageProps } from '@/types/hub/hub'
const { width } = Dimensions.get('window')


export function HubPage({ card, onResourcePress, carouselHeight }: HubPageProps) {
  const isPrologue = card.isPrologue ?? String(card.title ?? '').toLowerCase().includes('prologue')
  const showResources = !isPrologue && card.hasResources

  // Uniform card height; use most of carousel so gap above pagination is small.
  const cardHeight = Math.round(carouselHeight * 0.9)
  const hasScroll = showResources

  return (
    <View style={[hubPageStyles.page, { width, height: carouselHeight }]}>
      {hasScroll ? (
        <ScrollView
          style={hubPageStyles.scroll}
          contentContainerStyle={[hubPageStyles.scrollContent, { minHeight: carouselHeight }]}
          showsVerticalScrollIndicator={false}
        >
          <StoryCard card={card} height={cardHeight} />
          <View style={hubPageStyles.scrollCue}>
            <ProgressIndicator card={card} showBottomLine />
          </View>
          <View style={hubPageStyles.resourcesBlock}>
            <ResourceCard card={card} onResourcePress={onResourcePress} />
          </View>
        </ScrollView>
      ) : (
        <View style={hubPageStyles.cardContainer}>
          <StoryCard card={card} height={cardHeight} />
        </View>
      )}
    </View>
  )
}
