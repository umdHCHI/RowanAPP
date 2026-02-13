import { View } from 'react-native'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { progressIndicatorStyles } from '@/styles/hub/hub-styles'
import type { ProgressIndicatorProps } from '@/types/hub/hub'

export function ProgressIndicator({ card, showBottomLine = true }: ProgressIndicatorProps) {
  return (
    <View style={progressIndicatorStyles.container}>
      {/* Top line */}
      <View style={progressIndicatorStyles.line} />
      
      {/* Arrow indicator */}
      <View style={progressIndicatorStyles.arrowWrap}>
        <MaterialDesignIcons name="arrow-down" size={30} color="#ffffff" />
      </View>
      
      {/* Bottom line */}
      {showBottomLine && <View style={progressIndicatorStyles.line} />}
    </View>
  )
}



