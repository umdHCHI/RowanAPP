// TODO: change character options to now character

// Hex Character Pack assets (sprite sheets)
export const baseOptions = [//DONE
  require('../../assets/character-creator/Bases/base_main/base_one.png'),
  require('../../assets/character-creator/Bases/base_main/base_two.png'),
  require('../../assets/character-creator/Bases/base_main/base_three.png'),
  require('../../assets/character-creator/Bases/base_main/base_four.png'),
  require('../../assets/character-creator/Bases/base_main/base_five.png'),
  require('../../assets/character-creator/Bases/base_main/base_six.png'),
  require('../../assets/character-creator/Bases/base_main/base_seven.png'),
  require('../../assets/character-creator/Bases/base_main/base_eight.png'),
  require('../../assets/character-creator/Bases/base_main/base_nine.png'),
];

export const hairOptionsF = [
  require('../../assets/character-creator/Hairs/Hair Sheet Black.png'),//REPLACE
  require('../../assets/character-creator/Hairs/Hair Sheet Brown 1.png'),
  require('../../assets/character-creator/Hairs/Hair Sheet Brown 2.png'),
  require('../../assets/character-creator/Hairs/Hair Sheet Brown 3.png'),
  require('../../assets/character-creator/Hairs/Hair Sheet Blonde.png'),
  require('../../assets/character-creator/Hairs/Hair Sheet Orange.png'),
  require('../../assets/character-creator/Hairs/Hair Sheet Red.png'),
  require('../../assets/character-creator/Hairs/Hair Sheet Pink.png'),
  require('../../assets/character-creator/Hairs/Hair Sheet Magent.png'),
  require('../../assets/character-creator/Hairs/Hair Sheet Lilac.png'),
  require('../../assets/character-creator/Hairs/Hair Sheet Dark Blue.png'),
  require('../../assets/character-creator/Hairs/Hair Sheet Blue.png'),
  require('../../assets/character-creator/Hairs/Hair Sheet Blue-Green.png'),
  require('../../assets/character-creator/Hairs/Hair Sheet Light Green.png'),
  require('../../assets/character-creator/Hairs/Hair Sheet Green.png'),
  require('../../assets/character-creator/Hairs/Hair Sheet White.png'),
];

export const clothesOptionsF = [
  require('../../assets/character-creator/Clothes/Blonde.png'),
];

export const eyesOptionsF = [
  require('../../assets/character-creator/Eyes/Blonde.png'),
];

export const mouthOptionsF = [
  require('../../assets/character-creator/Mouths/Mouth 1.png'),
];

// Use the same options for all genders
export const hairOptionsM = hairOptionsF;
export const clothesOptionsM = clothesOptionsF;
export const eyesOptionsM = eyesOptionsF;
export const mouthOptionsM = mouthOptionsF; 