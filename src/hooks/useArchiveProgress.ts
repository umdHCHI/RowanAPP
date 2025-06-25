import { useMemo, useState } from 'react';
import { availableGrimoires } from '../data/storyData';

export interface ArchiveFoundation {
  icon: string;
  label: string;
  value: number;
  maxValue: number;
  colors: string[];
  description: string;
  recentGain: number;
  nextUnlock: string;
  storyTriggers: string[];
}

export interface CodexEntry {
  id: string;
  type: string;
  content: string;
  prompt: string;
  skillCategory: string;
  mapArea: string;
  difficulty: string;
  timestamp: number;
}

export interface MiniGameProgress {
  thoughtDefenderLevel: number;
  thoughtDefenderScore: number;
  thoughtDefenderWins: number;
  drawingEntries: number;
  totalGameTime: number;
}

export interface MentalArtifact {
  name: string;
  type: string;
  equipped: boolean;
  resonance: number;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export const useArchiveProgress = () => {
  const [completedStories, setCompletedStories] = useState<Set<string>>(new Set());
  const [codexEntries, setCodexEntries] = useState<CodexEntry[]>([]);
  const [miniGameProgress, setMiniGameProgress] = useState<MiniGameProgress>({
    thoughtDefenderLevel: 0,
    thoughtDefenderScore: 0,
    thoughtDefenderWins: 0,
    drawingEntries: 0,
    totalGameTime: 0
  });
  const [discoveredArtifacts, setDiscoveredArtifacts] = useState<MentalArtifact[]>([]);
  const [finalRewardsArtifacts, setFinalRewardsArtifacts] = useState<MentalArtifact[]>([]);
  const [learnedSkills, setLearnedSkills] = useState<string[]>([]);

  // Calculate foundation values based on actual progress
  const calculateFoundationValues = useMemo(() => {
    const baseValues = {
      'Sight Beyond Sight': 2,
      'Unbreakable Will': 2, 
      "Heart's Compass": 2,
      'Elemental Harmony': 2
    };

    // Add points from completed stories
    completedStories.forEach(storyId => {
      const story = availableGrimoires.find(g => g.id === storyId);
      if (story) {
        // Each completed story gives points to its skill focus areas
        story.skillFocus.forEach(skill => {
          if (skill.includes('Mindful') || skill.includes('Stress') || skill.includes('Academic')) {
            baseValues['Sight Beyond Sight'] += 3;
          }
          if (skill.includes('Self-Compassion') || skill.includes('Growth') || skill.includes('Inner Critic')) {
            baseValues['Unbreakable Will'] += 3;
          }
          if (skill.includes('Social') || skill.includes('Anxiety') || skill.includes('Authentic')) {
            baseValues["Heart's Compass"] += 3;
          }
          if (skill.includes('Balance') || skill.includes('Time') || skill.includes('Self-Care')) {
            baseValues['Elemental Harmony'] += 3;
          }
        });
      }
    });

    // Add points from codex entries (reflection/journal entries)
    codexEntries.forEach(entry => {
      // Each codex entry gives points based on skill category
      switch (entry.skillCategory) {
        case 'awareness':
        case 'mindfulness':
          baseValues['Sight Beyond Sight'] += 2;
          break;
        case 'resilience':
        case 'perseverance':
          baseValues['Unbreakable Will'] += 2;
          break;
        case 'connection':
        case 'empathy':
          baseValues["Heart's Compass"] += 2;
          break;
        case 'balance':
        case 'harmony':
          baseValues['Elemental Harmony'] += 2;
          break;
        default:
          // Give small points to all foundations for general reflection
          Object.keys(baseValues).forEach(key => {
            baseValues[key as keyof typeof baseValues] += 1;
          });
      }
    });

    // Add points from mini-game achievements
    if (miniGameProgress.thoughtDefenderWins > 0) {
      baseValues['Unbreakable Will'] += miniGameProgress.thoughtDefenderWins * 2;
      baseValues['Sight Beyond Sight'] += miniGameProgress.thoughtDefenderWins;
    }
    
    if (miniGameProgress.thoughtDefenderLevel > 0) {
      baseValues['Unbreakable Will'] += miniGameProgress.thoughtDefenderLevel;
    }

    if (miniGameProgress.drawingEntries > 0) {
      baseValues['Elemental Harmony'] += miniGameProgress.drawingEntries * 2;
      baseValues["Heart's Compass"] += miniGameProgress.drawingEntries;
    }

    // Cap all values at maxValue (20)
    Object.keys(baseValues).forEach(key => {
      baseValues[key as keyof typeof baseValues] = Math.min(20, baseValues[key as keyof typeof baseValues]);
    });

    return baseValues;
  }, [completedStories, codexEntries, miniGameProgress]);

  // Helper function to get next unlock description
  const getNextUnlock = (foundationLabel: string, currentValue: number) => {
    const nextLevel = Math.floor(currentValue / 5) + 1;
    const unlocks = {
      'Sight Beyond Sight': [
        'Enhanced Perception - See through deceptive thoughts',
        'Mindful Awareness - Present moment clarity',
        'Pattern Recognition - Identify thought cycles',
        'Truth Sight - Distinguish reality from illusion'
      ],
      'Unbreakable Will': [
        'Iron Resolve - Resist overwhelming stress',
        'Steadfast Determination - Maintain focus under pressure',
        'Unshakeable Core - Weather emotional storms',
        'Indomitable Spirit - Rise above all challenges'
      ],
      "Heart's Compass": [
        'Empathic Mastery - Deep emotional understanding',
        'Connection Wisdom - Navigate relationships skillfully',
        'Compassionate Leadership - Guide others with heart',
        'Universal Love - Embrace all beings with kindness'
      ],
      'Elemental Harmony': [
        'Life Equilibrium - Perfect work-life balance',
        'Flow State Mastery - Effortless action and presence',
        'Cosmic Alignment - Harmony with universal forces',
        'Transcendent Balance - Beyond duality and conflict'
      ]
    };
    
    const foundationUnlocks = unlocks[foundationLabel as keyof typeof unlocks];
    return foundationUnlocks?.[nextLevel - 1] || 'Mastery achieved';
  };

  // Archive Foundation Stats - Now dynamically calculated
  const archiveFoundations = useMemo(() => {
    const newValues = calculateFoundationValues;
    
    return [
      {
        icon: '👁️',
        label: 'Sight Beyond Sight',
        value: newValues['Sight Beyond Sight'],
        maxValue: 20,
        colors: ['#3B82F6', '#06B6D4'] as const,
        description: 'Your ability to perceive hidden truths and see through illusions of the mind',
        recentGain: 0,
        nextUnlock: getNextUnlock('Sight Beyond Sight', newValues['Sight Beyond Sight']),
        storyTriggers: ['mindfulness_practice', 'reflection_moments', 'self_awareness_choices']
      },
      {
        icon: '⚓',
        label: 'Unbreakable Will',
        value: newValues['Unbreakable Will'],
        maxValue: 20,
        colors: ['#059669', '#10B981'] as const,
        description: 'The fortified strength of your spirit against the storms of adversity',
        recentGain: 0,
        nextUnlock: getNextUnlock('Unbreakable Will', newValues['Unbreakable Will']),
        storyTriggers: ['perseverance_choices', 'facing_fears', 'overcoming_obstacles']
      },
      {
        icon: '🔗',
        label: "Heart's Compass",
        value: newValues["Heart's Compass"],
        maxValue: 20,
        colors: ['#DC2626', '#F472B6'] as const,
        description: 'Your power to forge meaningful bonds and navigate the realm of emotions',
        recentGain: 0,
        nextUnlock: getNextUnlock("Heart's Compass", newValues["Heart's Compass"]),
        storyTriggers: ['connection_choices', 'helping_others', 'vulnerability_moments']
      },
      {
        icon: '⚖️',
        label: 'Elemental Harmony',
        value: newValues['Elemental Harmony'],
        maxValue: 20,
        colors: ['#D97706', '#FCD34D'] as const,
        description: 'Mastery over the delicate balance between all aspects of your existence',
        recentGain: 0,
        nextUnlock: getNextUnlock('Elemental Harmony', newValues['Elemental Harmony']),
        storyTriggers: ['balance_choices', 'priority_setting', 'self_care_actions']
      },
    ];
  }, [calculateFoundationValues]);

  // Restoration metrics
  const restorationMetrics = useMemo(() => ({
    chroniclesExplored: completedStories.size,
    artifactsDiscovered: discoveredArtifacts.length + finalRewardsArtifacts.length,
    revelationsUnlocked: learnedSkills.length,
  }), [completedStories, discoveredArtifacts, finalRewardsArtifacts, learnedSkills]);

  // Action handlers
  const handleStoryComplete = (grimoireId: string) => {
    setCompletedStories(prev => new Set([...prev, grimoireId]));
  };

  const handleCodexEntry = (entry: Omit<CodexEntry, 'id' | 'timestamp'>) => {
    const newEntry = {
      id: Date.now().toString(),
      ...entry,
      timestamp: Date.now(),
    };
    setCodexEntries(prev => [...prev, newEntry]);
  };

  const handleMiniGameComplete = (gameType: 'thoughtDefender' | 'drawing', data: any) => {
    if (gameType === 'thoughtDefender') {
      setMiniGameProgress(prev => ({
        ...prev,
        thoughtDefenderLevel: Math.max(prev.thoughtDefenderLevel, data.level || 0),
        thoughtDefenderScore: Math.max(prev.thoughtDefenderScore, data.score || 0),
        thoughtDefenderWins: prev.thoughtDefenderWins + (data.won ? 1 : 0),
        totalGameTime: prev.totalGameTime + (data.gameTime || 0)
      }));
    } else if (gameType === 'drawing') {
      setMiniGameProgress(prev => ({
        ...prev,
        drawingEntries: prev.drawingEntries + 1
      }));
    }
  };

  const handleArtifactUnlock = (artifact: MentalArtifact) => {
    if (!discoveredArtifacts.find(a => a.name === artifact.name) && 
        !finalRewardsArtifacts.find(a => a.name === artifact.name)) {
      setDiscoveredArtifacts(prev => [...prev, artifact]);
    }
  };

  const handleSkillLearned = (skills: string[]) => {
    setLearnedSkills(prev => [...new Set([...prev, ...skills])]);
  };

  return {
    // State
    completedStories,
    codexEntries,
    miniGameProgress,
    discoveredArtifacts,
    finalRewardsArtifacts,
    learnedSkills,
    archiveFoundations,
    restorationMetrics,
    
    // Actions
    handleStoryComplete,
    handleCodexEntry,
    handleMiniGameComplete,
    handleArtifactUnlock,
    handleSkillLearned,
    setCompletedStories,
    setCodexEntries,
    setMiniGameProgress,
    setDiscoveredArtifacts,
    setFinalRewardsArtifacts,
    setLearnedSkills,
  };
}; 