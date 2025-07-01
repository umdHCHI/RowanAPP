import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

type ButtonVariant = "lightGreen" | "darkBrown" | "lightBrown";

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const getButtonImage = (variant: ButtonVariant) => {
  switch (variant) {
    case "lightGreen":
      return require("../../assets/UI/buttons/lightGreenlongbutton.png");
    case "darkBrown":
      return require("../../assets/UI/buttons/darkBrownlongbutton.png");
    case "lightBrown":
      return require("../../assets/UI/buttons/lightBrownlongbutton.png");
    default:
      return require("../../assets/UI/buttons/lightGreenlongbutton.png");
  }
};

const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = "lightGreen",
  style,
  textStyle,
}) => {
  return (
    <View style={[styles.wrapper, style]}>
      <Image
        source={getButtonImage(variant)}
        style={styles.buttonImage}
        resizeMode="stretch"
      />
      <TouchableOpacity
        onPress={onPress}
        style={styles.touchable}
        activeOpacity={0.8}
      >
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    minWidth: 120,
    height: 40,
  },
  buttonImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  touchable: {
    flex: 1,
    alignItems: "center",
    justifypassages: "center",
    paddingHorizontal: 10,
  },
  text: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
});

export default Button;
