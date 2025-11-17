import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { uiIcons } from '../../assets/ui';

export { getUIAsset, uiAssetLabels, uiIcons } from '../../assets/ui';

interface AssetLabelProps {
  assetType?: keyof typeof uiIcons;
  assetName?: string;
  text: string;
  style?: any;
  iconStyle?: any;
  textStyle?: any;
}

export const AssetLabel: React.FC<AssetLabelProps> = ({
  assetType = 'sectionIcons',
  assetName = 'tag',
  text,
  style,
  iconStyle,
  textStyle,
}) => {
  const asset = uiIcons[assetType]?.[assetName] || uiIcons.labels?.nameTag;

  return (
    <View style={[styles.container, style]}>
      <Image 
        source={asset} 
        style={[styles.icon, iconStyle]} 
        resizeMode="contain"
      />
      <Text style={[styles.text, textStyle]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AssetLabel;
