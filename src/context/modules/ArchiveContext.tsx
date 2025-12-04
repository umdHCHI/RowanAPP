// Manages archive progress, stories, mini-games, and foundations

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiService } from "../../services/apiService";
import { CodexEntry, MiniGameProgress, Story } from "../../types";
import {
  ThoughtDefenderRunDTO,
  ThoughtDefenderRunResponse,
} from "../../types/thoughtDefender";
import { ArchiveFoundation, MentalArtifact } from "./types";

export interface ArchiveContextType {
  completedStories: Set<string>;
  codexEntries: CodexEntry[];
  miniGameProgress: MiniGameProgress;
  discoveredArtifacts: MentalArtifact[];
  finalRewardsArtifacts: MentalArtifact[];
  learnedSkills: string[];
  archiveFoundations: ArchiveFoundation[];
  restorationMetrics: {
    chroniclesExplored: number;
    artifactsDiscovered: number;
    revelationsUnlocked: number;
  };

  handleStoryComplete: (storyId: string) => void;
  handleCodexEntry: (
    entry: Omit<CodexEntry, "id" | "created_at" | "updated_at">
  ) => void;
  handleMiniGameComplete: (
    gameType: "thoughtDefender" | "drawing",
    data: any
  ) => void;
  handleArtifactUnlock: (artifact: MentalArtifact) => void;
  handleSkillLearned: (skills: string[]) => void;
  handleStoryRewardTracker: (rewardTracker: any) => void;
  setFinalRewardsArtifacts: (artifacts: MentalArtifact[]) => void;
  loadArchiveProgress: () => Promise<void>;
  saveArchiveProgress: () => Promise<void>;
  logThoughtDefenderRun: (
    run: ThoughtDefenderRunDTO
  ) => Promise<ThoughtDefenderRunResponse>;
}

const ArchiveContext = createContext<ArchiveContextType | undefined>(undefined);

export const useArchive = () => {
  const context = useContext(ArchiveContext);
  if (!context) {
    throw new Error("useArchive must be used within ArchiveProvider");
  }
  return context;
};

interface ArchiveProviderProps {
  children: ReactNode;
  memoryStories: Story[];
  researchCondition: "A" | "B" | "unknown";
  authToken?: string | null;
  onGainExperience?: (amount: number, source?: string) => Promise<void>;
  onGainLumens?: (amount: number, source?: string) => Promise<void>;
  onGainWellness?: (gains: Record<string, number>) => Promise<void>;
  onGainResonance?: (amount: number, source?: string) => Promise<void>;
  onLoadHomeData?: () => Promise<void>;
}

export const ArchiveProvider: React.FC<ArchiveProviderProps> = ({
  children,
  memoryStories,
  researchCondition,
  authToken,
  onGainExperience,
  onGainResonance,
  onGainLumens,
  onGainWellness,
  onLoadHomeData,
}) => {
  const [completedStories, setCompletedStories] = useState<Set<string>>(
    new Set()
  );
  const [codexEntries, setCodexEntries] = useState<CodexEntry[]>([]);
  const [miniGameProgress, setMiniGameProgress] = useState<MiniGameProgress>({
    thoughtDefenderLevel: 0,
    thoughtDefenderScore: 0,
    thoughtDefenderWins: 0,
    drawingEntries: 0,
    totalGameTime: 0,
  });
  const [discoveredArtifacts, setDiscoveredArtifacts] = useState<
    MentalArtifact[]
  >([]);
  const [finalRewardsArtifacts, setFinalRewardsArtifacts] = useState<
    MentalArtifact[]
  >([]);
  const [learnedSkills, setLearnedSkills] = useState<string[]>([]);

  // ===== CRITICAL: Clear archive state when auth changes =====
  // This prevents data leakage between different user accounts
  useEffect(() => {
    if (!authToken) {
      console.log(
        "🧹 [ArchiveContext] Auth token cleared - resetting all archive state"
      );
      setCompletedStories(new Set());
      setCodexEntries([]);
      setMiniGameProgress({
        thoughtDefenderLevel: 0,
        thoughtDefenderScore: 0,
        thoughtDefenderWins: 0,
        drawingEntries: 0,
        totalGameTime: 0,
      });
      setDiscoveredArtifacts([]);
      setFinalRewardsArtifacts([]);
      setLearnedSkills([]);
    }
  }, [authToken]);

  const calculateFoundationValues = useMemo(() => {
    const baseValues = {
      "Sight Beyond Sight": 2,
      "Unbreakable Will": 2,
      "Heart's Compass": 2,
      "Elemental Harmony": 2,
    };

    completedStories.forEach((storyId) => {
      const story = memoryStories.find((g: Story) => g.id === Number(storyId));
      if (story && story.skillFocus) {
        story.skillFocus.forEach((skill: string) => {
          if (
            skill.includes("Mindful") ||
            skill.includes("Stress") ||
            skill.includes("Academic")
          ) {
            baseValues["Sight Beyond Sight"] += 3;
          }
          if (
            skill.includes("Self-Compassion") ||
            skill.includes("Growth") ||
            skill.includes("Inner Critic")
          ) {
            baseValues["Unbreakable Will"] += 3;
          }
          if (
            skill.includes("Social") ||
            skill.includes("Anxiety") ||
            skill.includes("Authentic")
          ) {
            baseValues["Heart's Compass"] += 3;
          }
          if (
            skill.includes("Balance") ||
            skill.includes("Time") ||
            skill.includes("Self-Care")
          ) {
            baseValues["Elemental Harmony"] += 3;
          }
        });
      }
    });

    codexEntries.forEach((entry) => {
      switch (entry.skillCategory) {
        case "Emotional Awareness":
        case "mindfulness":
          baseValues["Sight Beyond Sight"] += 2;
          break;
        case "Self-Compassion":
        case "Personal Growth":
          baseValues["Unbreakable Will"] += 2;
          break;
        case "Social Connection":
        case "empathy":
          baseValues["Heart's Compass"] += 2;
          break;
        case "Stress Management":
        case "harmony":
          baseValues["Elemental Harmony"] += 2;
          break;
        default:
          Object.keys(baseValues).forEach((key) => {
            baseValues[key as keyof typeof baseValues] += 1;
          });
      }
    });

    if (miniGameProgress.thoughtDefenderWins > 0) {
      baseValues["Unbreakable Will"] +=
        miniGameProgress.thoughtDefenderWins * 2;
      baseValues["Sight Beyond Sight"] += miniGameProgress.thoughtDefenderWins;
    }

    if (miniGameProgress.thoughtDefenderLevel > 0) {
      baseValues["Unbreakable Will"] += miniGameProgress.thoughtDefenderLevel;
    }

    if (miniGameProgress.drawingEntries > 0) {
      baseValues["Elemental Harmony"] += miniGameProgress.drawingEntries * 2;
      baseValues["Heart's Compass"] += miniGameProgress.drawingEntries;
    }

    Object.keys(baseValues).forEach((key) => {
      baseValues[key as keyof typeof baseValues] = Math.min(
        20,
        baseValues[key as keyof typeof baseValues]
      );
    });

    return baseValues;
  }, [completedStories, codexEntries, miniGameProgress, memoryStories]);

  const getNextUnlock = (foundationLabel: string, currentValue: number) => {
    const nextLevel = Math.floor(currentValue / 5) + 1;
    const unlocks = {
      "Sight Beyond Sight": [
        "Enhanced Perception - See through deceptive thoughts",
        "Mindful Awareness - Present moment clarity",
        "Pattern Recognition - Identify thought cycles",
        "Truth Sight - Distinguish reality from illusion",
      ],
      "Unbreakable Will": [
        "Iron Resolve - Resist overwhelming stress",
        "Steadfast Determination - Maintain focus under pressure",
        "Unshakeable Core - Weather emotional storms",
        "Indomitable Spirit - Rise above all challenges",
      ],
      "Heart's Compass": [
        "Empathic Mastery - Deep emotional understanding",
        "Connection Wisdom - Navigate relationships skillfully",
        "Compassionate Leadership - Guide others with heart",
        "Universal Love - Embrace all beings with kindness",
      ],
      "Elemental Harmony": [
        "Life Equilibrium - Perfect work-life balance",
        "Flow State Mastery - Effortless action and presence",
        "Cosmic Alignment - Harmony with universal forces",
        "Transcendent Balance - Beyond duality and conflict",
      ],
    };

    const foundationUnlocks = unlocks[foundationLabel as keyof typeof unlocks];
    return foundationUnlocks?.[nextLevel - 1] || "Mastery achieved";
  };

  const archiveFoundations = useMemo(() => {
    const newValues = calculateFoundationValues;

    return [
      {
        icon: "👁️",
        label: "Sight Beyond Sight",
        value: newValues["Sight Beyond Sight"],
        maxValue: 20,
        colors: ["#3B82F6", "#06B6D4"],
        description:
          "Your ability to perceive hidden truths and see through illusions of the mind",
        recentGain: 0,
        nextUnlock: getNextUnlock(
          "Sight Beyond Sight",
          newValues["Sight Beyond Sight"]
        ),
        storyTriggers: [
          "mindfulness_practice",
          "reflection_moments",
          "self_awareness_choices",
        ],
      },
      {
        icon: "⚓",
        label: "Unbreakable Will",
        value: newValues["Unbreakable Will"],
        maxValue: 20,
        colors: ["#059669", "#10B981"],
        description:
          "The fortified strength of your spirit against the storms of adversity",
        recentGain: 0,
        nextUnlock: getNextUnlock(
          "Unbreakable Will",
          newValues["Unbreakable Will"]
        ),
        storyTriggers: [
          "perseverance_choices",
          "facing_fears",
          "overcoming_obstacles",
        ],
      },
      {
        icon: "🔗",
        label: "Heart's Compass",
        value: newValues["Heart's Compass"],
        maxValue: 20,
        colors: ["#DC2626", "#F472B6"],
        description:
          "Your power to forge meaningful bonds and navigate the realm of emotions",
        recentGain: 0,
        nextUnlock: getNextUnlock(
          "Heart's Compass",
          newValues["Heart's Compass"]
        ),
        storyTriggers: [
          "connection_choices",
          "helping_others",
          "vulnerability_moments",
        ],
      },
      {
        icon: "⚖️",
        label: "Elemental Harmony",
        value: newValues["Elemental Harmony"],
        maxValue: 20,
        colors: ["#D97706", "#FCD34D"],
        description:
          "Mastery over the delicate balance between all aspects of your existence",
        recentGain: 0,
        nextUnlock: getNextUnlock(
          "Elemental Harmony",
          newValues["Elemental Harmony"]
        ),
        storyTriggers: [
          "balance_choices",
          "priority_setting",
          "self_care_actions",
        ],
      },
    ];
  }, [calculateFoundationValues]);

  const restorationMetrics = useMemo(
    () => ({
      chroniclesExplored: completedStories.size,
      artifactsDiscovered:
        discoveredArtifacts.length + finalRewardsArtifacts.length,
      revelationsUnlocked: learnedSkills.length,
    }),
    [
      completedStories,
      discoveredArtifacts,
      finalRewardsArtifacts,
      learnedSkills,
    ]
  );

  const handleStoryComplete = (storyId: string) => {
    setCompletedStories((prev) => new Set([...prev, storyId]));
  };

  const handleCodexEntry = (
    entry: Omit<CodexEntry, "id" | "created_at" | "updated_at">
  ) => {
    const newEntry: CodexEntry = {
      id: Date.now(),
      prompt: entry.prompt,
      prompt_id: entry.prompt_id,
      prompt_text: entry.prompt_text,
      entry_type: entry.entry_type,
      content: entry.content,
      content_preview: entry.content_preview,
      skill_category: entry.skill_category,
      difficulty: entry.difficulty,
      word_count: entry.word_count,
      duration_seconds: entry.duration_seconds,
      username: entry.username,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      type: entry.entry_type,
      passages: entry.content,
      skillCategory: entry.skill_category,
      mapArea: entry.skill_category,
    };
    setCodexEntries((prev) => [...prev, newEntry]);
  };

  const handleMiniGameComplete = async (
    gameType: "thoughtDefender" | "drawing",
    data: any
  ) => {
    if (gameType === "thoughtDefender") {
      setMiniGameProgress((prev) => ({
        ...prev,
        thoughtDefenderLevel: Math.max(
          prev.thoughtDefenderLevel,
          data.level || 0
        ),
        thoughtDefenderScore: Math.max(
          prev.thoughtDefenderScore,
          data.score || 0
        ),
        thoughtDefenderWins: prev.thoughtDefenderWins + (data.won ? 1 : 0),
        totalGameTime: prev.totalGameTime + (data.gameTime || 0),
      }));

      if (
        data.experienceGained &&
        data.experienceGained > 0 &&
        onGainExperience
      ) {
        try {
          await onGainExperience(
            data.experienceGained,
            `thought_defender_${data.difficulty || "normal"}`
          );
        } catch (error) {
          // Handle error silently
        }
      }
    } else if (gameType === "drawing") {
      setMiniGameProgress((prev) => ({
        ...prev,
        drawingEntries: prev.drawingEntries + 1,
      }));
    }
  };

  const logThoughtDefenderRun = async (run: ThoughtDefenderRunDTO) => {
    try {
      const payload = {
        score: run.score,
        level: run.level,
        durationMs: run.durationMs,
        enemiesDestroyed: run.wavesCleared || 0,
        damageTaken: Math.max(0, 3 - run.livesRemaining),
        completed: run.result === "win",
        modifiers: {
          difficulty: run.difficulty,
          accuracy: run.accuracy,
          shotsFired: run.shotsFired,
          hits: run.hits,
          perksUsed: run.perksUsed,
          powerupsCollected: run.powerupsCollected,
        },
        meta: {
          startedAt: run.startedAt,
          finishedAt: run.finishedAt,
          clientVersion: run.clientVersion,
          result: run.result,
        },
      };

      const res = await apiService.logThoughtDefenderRun(payload);
      if (onLoadHomeData) {
        await onLoadHomeData();
      }
      return res;
    } catch (e: any) {
      return { ok: false, message: e?.message ?? "Failed" };
    }
  };

  const handleArtifactUnlock = (artifact: MentalArtifact) => {
    if (
      !discoveredArtifacts.find((a) => a.name === artifact.name) &&
      !finalRewardsArtifacts.find((a) => a.name === artifact.name)
    ) {
      setDiscoveredArtifacts((prev) => [...prev, artifact]);
    }
  };

  const handleSkillLearned = (skills: string[]) => {
    setLearnedSkills((prev) => [...new Set([...prev, ...skills])]);
  };

  const handleStoryRewardTracker = (rewardTracker: any) => {
    if (rewardTracker.totalStatGains) {
      Object.entries(rewardTracker.totalStatGains).forEach(([stat, value]) => {
        if (typeof value === "number" && value > 0) {
          if (researchCondition === "A") {
            if (stat === "lumens" && onGainLumens) {
              onGainLumens(value, `story_${rewardTracker.storyId}`);
            } else if (stat === "experience" && onGainExperience) {
              onGainExperience(value, `story_${rewardTracker.storyId}`);
            } else if (onGainWellness) {
              onGainWellness({ [stat]: value });
            }
          } else if (researchCondition === "B") {
            if (stat === "experience" && onGainExperience) {
              onGainExperience(value, `story_${rewardTracker.storyId}`);
            } else if (stat === "lumens" && onGainLumens) {
              onGainLumens(value, `story_${rewardTracker.storyId}`);
            } else if (onGainWellness) {
              onGainWellness({ [stat]: value });
            }
          } else {
            if (stat !== "experience" && stat !== "lumens" && onGainWellness) {
              onGainWellness({ [stat]: value });
            }
          }
        }
      });
    }

    if (rewardTracker.finalRewards && rewardTracker.finalRewards.length > 0) {
      rewardTracker.finalRewards.forEach((reward: string) => {
        if (researchCondition === "A") {
          handleArtifactUnlock({
            name: reward,
            type: "gear_reward",
            equipped: false,
            lumens: 1,
            description: `Equipment earned from story completion`,
            rarity: "Common" as any,
          });
        } else if (researchCondition === "B") {
          handleArtifactUnlock({
            name: reward,
            type: "coping_tool",
            equipped: false,
            lumens: 1,
            description: `Coping strategy learned from story completion`,
            rarity: "Common" as any,
          });
        }
      });
    }

    if (rewardTracker.skillsLearned && rewardTracker.skillsLearned.length > 0) {
      handleSkillLearned(rewardTracker.skillsLearned);
    }
  };

  const loadArchiveProgress = async () => {
    // Placeholder for future backend implementation
  };

  const saveArchiveProgress = async () => {
    // Placeholder for future backend implementation
  };

  const value: ArchiveContextType = {
    completedStories,
    codexEntries,
    miniGameProgress,
    discoveredArtifacts,
    finalRewardsArtifacts,
    learnedSkills,
    archiveFoundations,
    restorationMetrics,
    handleStoryComplete,
    handleCodexEntry,
    handleMiniGameComplete,
    handleArtifactUnlock,
    handleSkillLearned,
    handleStoryRewardTracker,
    setFinalRewardsArtifacts,
    loadArchiveProgress,
    saveArchiveProgress,
    logThoughtDefenderRun,
  };

  return (
    <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>
  );
};
