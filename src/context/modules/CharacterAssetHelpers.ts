// Utility functions for character appearance asset selection

import {
  baseOptions,
  bgOptionsBlonde,
  bgOptionsBlue,
  bgOptionsBlueGreen,
  bgOptionsBrown,
  bgOptionsDark,
  bgOptionsDarkBlue,
  bgOptionsDarkBrown,
  bgOptionsGreen,
  bgOptionsLightBrown,
  bgOptionsLightGreen,
  bgOptionsLilac,
  bgOptionsMagent,
  bgOptionsOrange,
  bgOptionsPink,
  bgOptionsRed,
  bgOptionsWhite,
  clothesOptionsBlonde,
  clothesOptionsBlue,
  clothesOptionsBlueGreen,
  clothesOptionsBrown,
  clothesOptionsDark,
  clothesOptionsDarkBlue,
  clothesOptionsDarkBrown,
  clothesOptionsGreen,
  clothesOptionsLightBrown,
  clothesOptionsLightGreen,
  clothesOptionsLilac,
  clothesOptionsMagent,
  clothesOptionsOrange,
  clothesOptionsPink,
  clothesOptionsRed,
  clothesOptionsWhite,
  eyebrowsOptionsBlonde,
  eyebrowsOptionsBlue,
  eyebrowsOptionsBlueGreen,
  eyebrowsOptionsBrown,
  eyebrowsOptionsDark,
  eyebrowsOptionsDarkBlue,
  eyebrowsOptionsDarkBrown,
  eyebrowsOptionsGreen,
  eyebrowsOptionsLightBrown,
  eyebrowsOptionsLightGreen,
  eyebrowsOptionsLilac,
  eyebrowsOptionsMagent,
  eyebrowsOptionsOrange,
  eyebrowsOptionsPink,
  eyebrowsOptionsRed,
  eyebrowsOptionsWhite,
  eyesOptionsBlonde,
  eyesOptionsBlue,
  eyesOptionsBlueGreen,
  eyesOptionsBrown,
  eyesOptionsDark,
  eyesOptionsDarkBlue,
  eyesOptionsDarkBrown,
  eyesOptionsGreen,
  eyesOptionsLightBrown,
  eyesOptionsLightGreen,
  eyesOptionsLilac,
  eyesOptionsMagent,
  eyesOptionsOrange,
  eyesOptionsPink,
  eyesOptionsRed,
  eyesOptionsWhite,
  hairOptionsBlack,
  hairOptionsBlonde,
  hairOptionsBlue,
  hairOptionsBlueGreen,
  hairOptionsBrown1,
  hairOptionsBrown2,
  hairOptionsBrown3,
  hairOptionsDarkBlue,
  hairOptionsGreen,
  hairOptionsLightGreen,
  hairOptionsLilac,
  hairOptionsMagent,
  hairOptionsOrange,
  hairOptionsPink,
  hairOptionsRed,
  hairOptionsWhite,
  mouthOptions,
} from "../../assets/characterOptions";

export const getHairAsset = (hairStyle: number, hairColor: number) => {
  try {
    const hairArrays = [
      hairOptionsBlack,
      hairOptionsBlonde,
      hairOptionsBlue,
      hairOptionsBlueGreen,
      hairOptionsBrown1,
      hairOptionsBrown2,
      hairOptionsBrown3,
      hairOptionsDarkBlue,
      hairOptionsGreen,
      hairOptionsLightGreen,
      hairOptionsLilac,
      hairOptionsMagent,
      hairOptionsOrange,
      hairOptionsPink,
      hairOptionsRed,
      hairOptionsWhite,
    ];

    const safeHairColor = Math.max(0, Math.min(hairColor, hairArrays.length - 1));
    const colorArray = hairArrays[safeHairColor] || hairOptionsBlack;
    const safeHairStyle = Math.max(0, Math.min(hairStyle, colorArray.length - 1));

    return colorArray[safeHairStyle] || colorArray[0];
  } catch (error) {
    return hairOptionsBlack[0];
  }
};

export const getClothesAsset = (shirtType: number, clothesColor: number) => {
  const clothesArrays = [
    clothesOptionsBrown,
    clothesOptionsBlonde,
    clothesOptionsBlue,
    clothesOptionsBlueGreen,
    clothesOptionsDarkBrown,
    clothesOptionsDarkBlue,
    clothesOptionsDark,
    clothesOptionsGreen,
    clothesOptionsLightBrown,
    clothesOptionsLightGreen,
    clothesOptionsLilac,
    clothesOptionsMagent,
    clothesOptionsOrange,
    clothesOptionsPink,
    clothesOptionsRed,
    clothesOptionsWhite,
  ];
  const colorArray = clothesArrays[clothesColor || 0] || clothesOptionsBrown;
  return colorArray[shirtType] || colorArray[0];
};

export const getEyesAsset = (eyeType: number, eyeColor: number) => {
  const eyesArrays = [
    eyesOptionsBrown,
    eyesOptionsBlonde,
    eyesOptionsBlue,
    eyesOptionsBlueGreen,
    eyesOptionsDarkBrown,
    eyesOptionsDarkBlue,
    eyesOptionsDark,
    eyesOptionsGreen,
    eyesOptionsLightBrown,
    eyesOptionsLightGreen,
    eyesOptionsLilac,
    eyesOptionsMagent,
    eyesOptionsOrange,
    eyesOptionsPink,
    eyesOptionsRed,
    eyesOptionsWhite,
  ];
  const colorArray = eyesArrays[eyeColor] || eyesOptionsBrown;
  return colorArray[eyeType] || colorArray[0];
};

export const getEyebrowsAsset = (eyebrowStyle: number, eyebrowColor: number) => {
  const eyebrowsArrays = [
    eyebrowsOptionsBrown,
    eyebrowsOptionsBlonde,
    eyebrowsOptionsBlue,
    eyebrowsOptionsBlueGreen,
    eyebrowsOptionsDarkBrown,
    eyebrowsOptionsDarkBlue,
    eyebrowsOptionsDark,
    eyebrowsOptionsGreen,
    eyebrowsOptionsLightBrown,
    eyebrowsOptionsLightGreen,
    eyebrowsOptionsLilac,
    eyebrowsOptionsMagent,
    eyebrowsOptionsOrange,
    eyebrowsOptionsPink,
    eyebrowsOptionsRed,
    eyebrowsOptionsWhite,
  ];
  const colorArray = eyebrowsArrays[eyebrowColor] || eyebrowsOptionsBrown;
  return colorArray[eyebrowStyle] || colorArray[0];
};

export const getCurrentBackgroundAsset = (backgroundType: number, backgroundColor: number) => {
  const backgroundColorArrays = [
    bgOptionsBrown,
    bgOptionsBlonde,
    bgOptionsBlue,
    bgOptionsBlueGreen,
    bgOptionsDarkBrown,
    bgOptionsDarkBlue,
    bgOptionsDark,
    bgOptionsGreen,
    bgOptionsLightBrown,
    bgOptionsLightGreen,
    bgOptionsLilac,
    bgOptionsMagent,
    bgOptionsOrange,
    bgOptionsPink,
    bgOptionsRed,
    bgOptionsWhite,
  ];
  const colorArray = backgroundColorArrays[backgroundColor || 0] || bgOptionsBrown;
  return colorArray[backgroundType] || colorArray[0];
};

export const getBaseAsset = (baseColor: number) => {
  try {
    const safeIndex = Math.max(0, Math.min(baseColor, baseOptions.length - 1));
    const asset = baseOptions[safeIndex] || baseOptions[0];
    return asset;
  } catch {
    return baseOptions[0];
  }
};

export const getMouthAsset = (mouthType: number) => {
  try {
    const safeMouthType = Math.max(0, Math.min(mouthType, mouthOptions.length - 1));
    return mouthOptions[safeMouthType] || mouthOptions[0];
  } catch (error) {
    return mouthOptions[0];
  }
};