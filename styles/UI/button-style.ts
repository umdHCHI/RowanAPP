import { colors, fontFamily } from "@/theme/design-tokens";
import { TextStyle } from "react-native";
import { StyleSheet } from "react-native";


export const buttonStyles = StyleSheet.create({
    button: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: {
      fontFamily: fontFamily.titleWhite[0],
      color: colors.archive.white,
      fontSize: 16,
    } as TextStyle,
    fullWidth: {
      width: '100%',
    },
    disabled: {
      opacity: 0.5,
    },
  })    