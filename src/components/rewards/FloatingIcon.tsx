import React from 'react';
import { Image } from 'react-native';
import { uiIcons } from '../../assets';

interface FloatingIconProps {
  assetType?: keyof typeof uiIcons;
  assetName?: string;
  style?: any;
  size?: number;
}

export const FloatingIcon: React.FC<FloatingIconProps> = ({
  assetType = 'floatingIcons',
  assetName = 'magic',
  style,
  size = 24,
}) => {
  const asset = uiIcons[assetType][assetName] || uiIcons.floatingIcons.magic;

  return (
    <Image 
      source={asset} 
      style={[
        {
          width: size,
          height: size,
          position: 'absolute',
        },
        style
      ]} 
      resizeMode="contain"
    />
  );
};

export default FloatingIcon;
