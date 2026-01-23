import type { PowerUp } from '@/types/game'

export interface ThoughtPattern {
  id: string
  monsterKey: string
  phrase: string
  counterRecord: string
}

export const THOUGHT_PATTERNS: ThoughtPattern[] = [
  {
    id: 'void_001',
    monsterKey: 'void_eater',
    phrase: 'Nothing I do matters.',
    counterRecord: 'You acted anyway. The Archive recorded the outcome.',
  },
  {
    id: 'void_002',
    monsterKey: 'void_eater',
    phrase: 'If I slow down, I fall behind.',
    counterRecord: 'You slowed down and the breach still closed.',
  },
  {
    id: 'void_003',
    monsterKey: 'void_eater',
    phrase: 'Everyone else is stronger than me.',
    counterRecord: 'Strength was not required. Persistence was.',
  },
  {
    id: 'void_004',
    monsterKey: 'void_eater',
    phrase: 'This effort will be forgotten.',
    counterRecord: 'The Archive does not forget what was done.',
  },
  {
    id: 'void_005',
    monsterKey: 'void_eater',
    phrase: 'I should have started sooner.',
    counterRecord: 'You started when you could. That was enough.',
  },
  {
    id: 'void_006',
    monsterKey: 'void_eater',
    phrase: 'I cannot keep this up.',
    counterRecord: 'You kept it up until the breach closed.',
  },
  {
    id: 'void_007',
    monsterKey: 'void_eater',
    phrase: 'I am not doing enough.',
    counterRecord: 'What you did was recorded. It was enough.',
  },
  {
    id: 'void_008',
    monsterKey: 'void_eater',
    phrase: 'This will not change anything.',
    counterRecord: 'The breach closed. Something changed.',
  },
  {
    id: 'void_009',
    monsterKey: 'void_eater',
    phrase: 'I am wasting my time.',
    counterRecord: 'Time was spent. The Archive noted the result.',
  },
  {
    id: 'void_010',
    monsterKey: 'void_eater',
    phrase: 'I am not good at this.',
    counterRecord: 'Competence was not measured. Action was.',
  },
  {
    id: 'void_011',
    monsterKey: 'void_eater',
    phrase: 'Others would do this better.',
    counterRecord: 'You did it. The outcome was recorded.',
  },
  {
    id: 'void_012',
    monsterKey: 'void_eater',
    phrase: 'I will fail eventually.',
    counterRecord: 'Failure was not observed. The breach closed.',
  },
]


export function getPowerUpImageSource(type: PowerUp['type']) {
  const imageMap: Record<PowerUp['type'], any> = {
    slowTime: require('../assets/Vantage/slowTime.png'),
    multishot: require('../assets/Vantage/multishot.png'),
    fastShoot: require('../assets/Vantage/fastShoot.png'),
    extraLife: require('../assets/Vantage/extraLife.png'),
    multiplier: require('../assets/Vantage/multiplier.png'),
    shield: require('../assets/Vantage/shield.png'),
  }
  return imageMap[type]
}

