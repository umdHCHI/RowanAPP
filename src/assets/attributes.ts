// Attribute images for story rewards
export const attributeImages = {
  exploration: {
    level1: require('../../assets/attributes/exploration/explorationLv1.png'),
    level2: require('../../assets/attributes/exploration/explorationLv2.png'),
    level3: require('../../assets/attributes/exploration/explorationLv3.png'),
    level4: require('../../assets/attributes/exploration/explorationLv4.png'),
    level5: require('../../assets/attributes/exploration/explorationLv5.png'),
  },
  courage: {
    level1: require('../../assets/attributes/courage/courageLv1.png'),
    level2: require('../../assets/attributes/courage/courageLv2.png'),
    level3: require('../../assets/attributes/courage/courageLv3.png'),
    level4: require('../../assets/attributes/courage/courageLv4.png'),
    level5: require('../../assets/attributes/courage/courageLv5.png'),
  },
  connection: {
    level1: require('../../assets/attributes/connection/connectionLv1.png'),
    level2: require('../../assets/attributes/connection/connectionLv2.png'),
    level3: require('../../assets/attributes/connection/connectionLv3.png'),
    level4: require('../../assets/attributes/connection/connectionLv4.png'),
    level5: require('../../assets/attributes/connection/connectionLv5.png'),
  },
  fear: {
    level1: require('../../assets/attributes/fear/fear1.png'),
    level2: require('../../assets/attributes/fear/fearLv2.png'),
    level3: require('../../assets/attributes/fear/fearLv3.png'),
    level4: require('../../assets/attributes/fear/fearLv4.png'),
    level5: require('../../assets/attributes/fear/fearLv5.png'),
  }
};

// Helper function to get attribute image by stat and level
export const getAttributeImage = (statName: string, level: number = 3): any => {
  const normalizedStat = statName.toLowerCase();
  const attributeKey = ['awareness', 'resilience', 'connection', 'balance'].includes(normalizedStat)
    ? normalizedStat
    : normalizedStat === 'awareness' ? 'exploration'
    : normalizedStat === 'resilience' ? 'courage'
    : normalizedStat === 'connection' ? 'connection'
    : normalizedStat === 'balance' ? 'fear'
    : normalizedStat;

  const levelKey = `level${Math.max(1, Math.min(5, level))}` as keyof typeof attributeImages[keyof typeof attributeImages];
  const attribute = attributeImages[attributeKey as keyof typeof attributeImages];
  
  return attribute ? attribute[levelKey] : attributeImages.exploration.level3;
};

export default attributeImages;
