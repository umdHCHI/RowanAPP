import { PathData, PathType } from '../types';

export const ArchivePaths: Record<PathType, PathData> = {
  character: {
    icon: '⚔️',
    title: 'Path of the Forged Soul',
    subtitle: 'Character Creation Realm',
    description:
      'Shape an avatar to walk these halls for you. Choose how they look, choose how they stand in the face of stress, and begin your story through their footsteps.',
    curatorNote:
      '"Some scholars learn best through creation. A crafted self can face storms you may fear to touch."',
    benefits: [
      'Build your Archive avatar',
      'Express the self you want to grow into',
      'Light your way through your story journey'
    ],
    atmosphere: 'Creative Workshop',
    color: '#f72585',
    secondaryColor: '#4cc9f0',
    gradientColors: [
      'rgba(247, 37, 133, 0.9)',
      'rgba(76, 201, 240, 0.7)',
      'rgba(157, 78, 221, 0.8)'
    ],
    buttonText: 'Enter the Forge',
    journey: 'Embark on the Path of Creation'
  },

  personality: {
    icon: '🔮',
    title: 'Path of the True Self',
    subtitle: 'Personality Discovery Chambers',
    description:
      'Step into quiet chambers built for reflection. Explore your traits, notice your patterns, and let The Archive shape future stories around your nature.',
    curatorNote:
      '"Others find clarity by looking inward. The more you know your patterns, the steadier your path becomes."',
    benefits: [
      'Learn your core traits',
      'Get matched story paths',
      'See coping ideas tailored to you'
    ],
    atmosphere: 'Reflection Sanctum',
    color: '#9d4edd',
    secondaryColor: '#06ffa5',
    gradientColors: [
      'rgba(157, 78, 221, 0.9)',
      'rgba(6, 255, 165, 0.7)',
      'rgba(76, 201, 240, 0.8)'
    ],
    buttonText: 'Enter the Chambers',
    journey: 'Embark on the Path of Discovery'
  }
};
