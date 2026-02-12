

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'error' | 'warning'


export type ButtonProps = {
    children: React.ReactNode
    onPress: () => void
    variant?: 'primary' | 'secondary' | 'tertiary'
    size?: 'default' | 'small'
    hapticType?: HapticType
    enableHaptics?: boolean
    enableSound?: boolean
    fullWidth?: boolean
    disabled?: boolean
  }