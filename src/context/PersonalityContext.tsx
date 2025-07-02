import axios from "axios";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiBaseUrl } from "../services/apiConfig";
import { useAuth } from "./AuthContext";
import { useMasterState } from "./MasterStateContext";

// Types for personality system
export type PersonalityTrait =
  | "Openness"
  | "Conscientiousness"
  | "Extraversion"
  | "Agreeableness"
  | "Neuroticism";
export type UserType = "character" | "personality" | "unknown";

export interface PersonalityScores {
  Openness: number;
  Conscientiousness: number;
  Extraversion: number;
  Agreeableness: number;
  Neuroticism: number;
}

export interface PersonalityTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundGradient: string[];
  preferredLayout: "minimal" | "detailed" | "visual" | "structured";
  motivationalMessage: string;
}

export interface PersonalityBuild {
  title: string;
  class: string;
  description: string;
  baseStats: {
    awareness: number;
    resilience: number;
    connection: number;
    balance: number;
  };
  preferredTools: string[];
  storyCategories: string[];
}

// Personality-specific passages configurations
export interface Personalitypassages {
  // Map customizations
  mapTheme: {
    primaryColor: string;
    areaStyle: "mystical" | "structured" | "vibrant" | "serene" | "stormy";
    preferredAreas: string[];
  };

  // Mini-game (Thought Defender) customizations
  thoughtDefender: {
    negativeThoughts: string[];
    copingStrategies: string[];
    powerUps: string[];
    difficulty: "gentle" | "moderate" | "challenging";
  };

  // Story catalog customizations
  storyCatalog: {
    featuredCategories: string[];
    recommendedDifficulty: string[];
    personalizedPrompts: string[];
  };

  // Codex/Journal customizations
  codex: {
    promptStyle:
      | "creative"
      | "structured"
      | "social"
      | "empathetic"
      | "reflective";
    suggestedQuestions: string[];
    reflectionFramework: string[];
  };

  // Equipment/Tools customizations
  equipment: {
    recommendedTypes: string[];
    startingGear: string[];
    unlockPriority: string[];
  };
}

interface PersonalityContextType {
  // Core personality data
  userType: UserType;
  personalityScores: PersonalityScores;
  primaryTrait: PersonalityTrait;

  // Personality configurations
  currentTheme: PersonalityTheme;
  currentBuild: PersonalityBuild;
  currentpassages: Personalitypassages;

  // Helper functions
  getPersonalityConfig: (screenName: string) => any;
  isPersonalityUser: () => boolean;
  isCharacterUser: () => boolean;

  // Testing mode functions
  testingMode: boolean;
  setTestingMode: (enabled: boolean) => void;
  applyTestPersonality: (trait: PersonalityTrait) => void;
  resetToOriginal: () => void;

  // Loading states
  isLoading: boolean;
  error: string | null;
}

// Default personality configurations
const PERSONALITY_THEMES: Record<PersonalityTrait, PersonalityTheme> = {
  Openness: {
    primaryColor: "#9B59B6",
    secondaryColor: "#E8DAEF",
    backgroundGradient: ["#667eea", "#764ba2"],
    preferredLayout: "visual",
    motivationalMessage:
      "Your imagination is your greatest compass in The Archive.",
  },
  Conscientiousness: {
    primaryColor: "#27AE60",
    secondaryColor: "#D5F5E3",
    backgroundGradient: ["#2C3E50", "#4CA1AF"],
    preferredLayout: "structured",
    motivationalMessage:
      "Your methodical approach unlocks The Archive's deepest secrets.",
  },
  Extraversion: {
    primaryColor: "#F39C12",
    secondaryColor: "#FCF3CF",
    backgroundGradient: ["#FF6B6B", "#FFE66D"],
    preferredLayout: "detailed",
    motivationalMessage: "Your energy illuminates every corner of The Archive.",
  },
  Agreeableness: {
    primaryColor: "#3498DB",
    secondaryColor: "#D6EAF8",
    backgroundGradient: ["#74b9ff", "#81ecec"],
    preferredLayout: "minimal",
    motivationalMessage:
      "Your compassion heals the ancient wounds within these pages.",
  },
  Neuroticism: {
    primaryColor: "#8E44AD",
    secondaryColor: "#EBDEF0",
    backgroundGradient: ["#667eea", "#764ba2"],
    preferredLayout: "minimal",
    motivationalMessage: "Your depth of feeling transforms storms into wisdom.",
  },
};

const PERSONALITY_BUILDS: Record<PersonalityTrait, PersonalityBuild> = {
  Openness: {
    title: "The Sage Explorer",
    class: "Creative Pathfinder",
    description: "Masters the art of perspective and boundless curiosity",
    baseStats: { awareness: 8, resilience: 6, connection: 6, balance: 5 },
    preferredTools: [
      "Creative Visualization",
      "Artistic Expression",
      "Mindful Exploration",
    ],
    storyCategories: ["Mystery", "Discovery", "Innovation"],
  },
  Conscientiousness: {
    title: "The Methodical Guardian",
    class: "Structured Keeper",
    description: "Builds strength through order and disciplined practice",
    baseStats: { awareness: 6, resilience: 8, connection: 5, balance: 7 },
    preferredTools: ["Structured Breathing", "Goal Setting", "Time Management"],
    storyCategories: ["Challenge", "Growth", "Achievement"],
  },
  Extraversion: {
    title: "The Social Catalyst",
    class: "Community Builder",
    description: "Draws power from connection and shared experiences",
    baseStats: { awareness: 6, resilience: 6, connection: 8, balance: 6 },
    preferredTools: ["Social Support", "Group Activities", "Verbal Processing"],
    storyCategories: ["Adventure", "Cooperation", "Leadership"],
  },
  Agreeableness: {
    title: "The Harmonious Healer",
    class: "Empathic Guide",
    description: "Transforms conflict into understanding and growth",
    baseStats: { awareness: 7, resilience: 5, connection: 8, balance: 7 },
    preferredTools: [
      "Compassionate Self-Talk",
      "Boundary Setting",
      "Loving-Kindness",
    ],
    storyCategories: ["Healing", "Relationships", "Harmony"],
  },
  Neuroticism: {
    title: "The Depth Walker",
    class: "Emotional Alchemist",
    description: "Transforms sensitivity into profound wisdom",
    baseStats: { awareness: 8, resilience: 5, connection: 6, balance: 5 },
    preferredTools: [
      "Emotional Regulation",
      "Storm Grounding",
      "Reflective Writing",
    ],
    storyCategories: ["Transformation", "Inner Journey", "Resilience"],
  },
};

const PERSONALITY_passages: Record<PersonalityTrait, Personalitypassages> = {
  Openness: {
    mapTheme: {
      primaryColor: "#9B59B6",
      areaStyle: "mystical",
      preferredAreas: [
        "Gallery of Perspectives",
        "Innovation Labs",
        "Creative Chambers",
      ],
    },
    thoughtDefender: {
      negativeThoughts: [
        "This idea is too weird",
        "I should stick to normal things",
        "People will think I'm strange",
        "This is impractical",
      ],
      copingStrategies: [
        "Embrace uniqueness",
        "Explore new possibilities",
        "Trust your creativity",
        "Value different perspectives",
      ],
      powerUps: ["Imagination Boost", "Curiosity Shield", "Creative Flow"],
      difficulty: "moderate",
    },
    storyCatalog: {
      featuredCategories: [
        "Mystery",
        "Fantasy",
        "Innovation",
        "Art & Creativity",
      ],
      recommendedDifficulty: ["Exploratory", "Mind-Bending", "Imaginative"],
      personalizedPrompts: [
        "What if reality worked differently?",
        "Discover the impossible made possible",
        "Explore uncharted territories of the mind",
      ],
    },
    codex: {
      promptStyle: "creative",
      suggestedQuestions: [
        "What new perspective did this experience give you?",
        "How did this challenge your assumptions?",
        "What possibilities opened up for you?",
      ],
      reflectionFramework: ["Wonder", "Discovery", "Possibility", "Innovation"],
    },
    equipment: {
      recommendedTypes: ["focus", "creative"],
      startingGear: ["Imagination Journal", "Perspective Lens"],
      unlockPriority: ["creative", "exploration", "insight"],
    },
  },

  Conscientiousness: {
    mapTheme: {
      primaryColor: "#27AE60",
      areaStyle: "structured",
      preferredAreas: [
        "Systematic Archives",
        "Goal Chambers",
        "Progress Halls",
      ],
    },
    thoughtDefender: {
      negativeThoughts: [
        "I'm not organized enough",
        "I should be doing more",
        "I'm behind schedule",
        "This isn't perfect",
      ],
      copingStrategies: [
        "Progress over perfection",
        "One step at a time",
        "Acknowledge your efforts",
        "Structure supports growth",
      ],
      powerUps: ["Focus Boost", "Organization Shield", "Persistence Power"],
      difficulty: "challenging",
    },
    storyCatalog: {
      featuredCategories: [
        "Achievement",
        "Goal-Setting",
        "Self-Discipline",
        "Growth",
      ],
      recommendedDifficulty: ["Structured", "Progressive", "Methodical"],
      personalizedPrompts: [
        "Build sustainable habits",
        "Master step-by-step progress",
        "Achieve meaningful goals",
      ],
    },
    codex: {
      promptStyle: "structured",
      suggestedQuestions: [
        "What concrete steps did you take?",
        "How did this contribute to your goals?",
        "What system or structure helped you?",
      ],
      reflectionFramework: ["Planning", "Action", "Progress", "Achievement"],
    },
    equipment: {
      recommendedTypes: ["organization", "planning"],
      startingGear: ["Goal Tracker", "Habit Builder"],
      unlockPriority: ["structure", "planning", "achievement"],
    },
  },

  Extraversion: {
    mapTheme: {
      primaryColor: "#F39C12",
      areaStyle: "vibrant",
      preferredAreas: ["Social Nexus", "Community Halls", "Connection Bridges"],
    },
    thoughtDefender: {
      negativeThoughts: [
        "I'm bothering people",
        "I'm too much",
        "Nobody wants to hear this",
        "I should be quieter",
      ],
      copingStrategies: [
        "Your energy is valuable",
        "Connection enriches everyone",
        "Share your enthusiasm",
        "Build meaningful relationships",
      ],
      powerUps: ["Social Boost", "Energy Shield", "Connection Power"],
      difficulty: "moderate",
    },
    storyCatalog: {
      featuredCategories: ["Adventure", "Social", "Leadership", "Community"],
      recommendedDifficulty: ["Interactive", "Collaborative", "Energetic"],
      personalizedPrompts: [
        "Lead others through challenges",
        "Build lasting connections",
        "Share your energy with the world",
      ],
    },
    codex: {
      promptStyle: "social",
      suggestedQuestions: [
        "How did you connect with others?",
        "What energy did you bring to this situation?",
        "How did sharing this help you process?",
      ],
      reflectionFramework: ["Connection", "Energy", "Sharing", "Community"],
    },
    equipment: {
      recommendedTypes: ["social", "energy"],
      startingGear: ["Connection Bridge", "Energy Amplifier"],
      unlockPriority: ["social", "leadership", "community"],
    },
  },

  Agreeableness: {
    mapTheme: {
      primaryColor: "#3498DB",
      areaStyle: "serene",
      preferredAreas: [
        "Harmony Gardens",
        "Empathy Chambers",
        "Peace Sanctuaries",
      ],
    },
    thoughtDefender: {
      negativeThoughts: [
        "I'm being selfish",
        "I should put others first",
        "I don't deserve this",
        "I'm causing conflict",
      ],
      copingStrategies: [
        "Your needs matter too",
        "Healthy boundaries help everyone",
        "Self-care enables caring for others",
        "Harmony includes yourself",
      ],
      powerUps: ["Compassion Shield", "Boundary Boost", "Harmony Power"],
      difficulty: "gentle",
    },
    storyCatalog: {
      featuredCategories: ["Relationships", "Healing", "Empathy", "Harmony"],
      recommendedDifficulty: ["Gentle", "Nurturing", "Heartfelt"],
      personalizedPrompts: [
        "Heal relationships with wisdom",
        "Balance caring with self-care",
        "Find harmony in difficult situations",
      ],
    },
    codex: {
      promptStyle: "empathetic",
      suggestedQuestions: [
        "How did you show compassion (including to yourself)?",
        "What did you learn about healthy boundaries?",
        "How did you create harmony in this situation?",
      ],
      reflectionFramework: [
        "Compassion",
        "Understanding",
        "Harmony",
        "Balance",
      ],
    },
    equipment: {
      recommendedTypes: ["empathy", "boundaries"],
      startingGear: ["Compassion Heart", "Boundary Compass"],
      unlockPriority: ["empathy", "boundaries", "healing"],
    },
  },

  Neuroticism: {
    mapTheme: {
      primaryColor: "#8E44AD",
      areaStyle: "stormy",
      preferredAreas: [
        "Emotional Depths",
        "Storm Chambers",
        "Transformation Halls",
      ],
    },
    thoughtDefender: {
      negativeThoughts: [
        "I'm too sensitive",
        "I can't handle this",
        "Something bad will happen",
        "I'm overreacting",
      ],
      copingStrategies: [
        "Sensitivity is strength",
        "You've overcome challenges before",
        "This feeling will pass",
        "Your emotions are valid",
      ],
      powerUps: ["Calm Anchor", "Emotional Shield", "Resilience Boost"],
      difficulty: "gentle",
    },
    storyCatalog: {
      featuredCategories: [
        "Emotional Growth",
        "Resilience",
        "Self-Compassion",
        "Transformation",
      ],
      recommendedDifficulty: ["Gentle", "Supportive", "Transformative"],
      personalizedPrompts: [
        "Transform emotional storms into wisdom",
        "Build resilience through self-understanding",
        "Find strength in sensitivity",
      ],
    },
    codex: {
      promptStyle: "reflective",
      suggestedQuestions: [
        "What emotions came up for you?",
        "How did you care for yourself through this?",
        "What strength did you discover in this experience?",
      ],
      reflectionFramework: ["Feeling", "Processing", "Understanding", "Growth"],
    },
    equipment: {
      recommendedTypes: ["emotional", "grounding"],
      startingGear: ["Emotion Compass", "Grounding Stone"],
      unlockPriority: ["emotional", "grounding", "resilience"],
    },
  },
};

// Testing personalities for quick switching
const TEST_PERSONALITIES: Record<string, PersonalityScores> = {
  "High Openness": {
    Openness: 9,
    Conscientiousness: 4,
    Extraversion: 6,
    Agreeableness: 7,
    Neuroticism: 3,
  },
  "High Conscientiousness": {
    Openness: 5,
    Conscientiousness: 9,
    Extraversion: 4,
    Agreeableness: 6,
    Neuroticism: 2,
  },
  "High Extraversion": {
    Openness: 7,
    Conscientiousness: 6,
    Extraversion: 9,
    Agreeableness: 8,
    Neuroticism: 2,
  },
  "High Agreeableness": {
    Openness: 6,
    Conscientiousness: 7,
    Extraversion: 4,
    Agreeableness: 9,
    Neuroticism: 4,
  },
  "High Neuroticism": {
    Openness: 5,
    Conscientiousness: 3,
    Extraversion: 2,
    Agreeableness: 6,
    Neuroticism: 8,
  },
};

const PersonalityContext = createContext<PersonalityContextType | undefined>(
  undefined
);

export const usePersonality = () => {
  const context = useContext(PersonalityContext);
  if (context === undefined) {
    throw new Error("usePersonality must be used within a PersonalityProvider");
  }
  return context;
};

interface PersonalityProviderProps {
  children: ReactNode;
}

export const PersonalityProvider: React.FC<PersonalityProviderProps> = ({
  children,
}) => {
  const { authToken } = useAuth();
  const { onboarding } = useMasterState();

  // Core state
  const [userType, setUserType] = useState<UserType>("unknown");
  const [personalityScores, setPersonalityScores] = useState<PersonalityScores>(
    {
      Openness: 5,
      Conscientiousness: 5,
      Extraversion: 5,
      Agreeableness: 5,
      Neuroticism: 5,
    }
  );
  const [primaryTrait, setPrimaryTrait] =
    useState<PersonalityTrait>("Openness");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Testing mode state
  const [testingMode, setTestingMode] = useState(false);
  const [originalData, setOriginalData] = useState<{
    scores: PersonalityScores;
    primary: PersonalityTrait;
    userType: UserType;
  } | null>(null);

  // Initialize personality data
  useEffect(() => {
    const initializePersonality = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if user has completed character creation
        if (
          onboarding.assignedPath === "character" ||
          onboarding.researchGroup === "A"
        ) {
          setUserType("character");
          // For character users, use balanced personality or default
          const balanced: PersonalityScores = {
            Openness: 6,
            Conscientiousness: 6,
            Extraversion: 6,
            Agreeableness: 6,
            Neuroticism: 4,
          };
          setPersonalityScores(balanced);
          setPrimaryTrait("Openness"); // Default for character users
          setIsLoading(false);
          return;
        }

        // Try to fetch personality profile
        if (authToken) {
          const response = await axios.get(`${apiBaseUrl}users/me/`, {
            headers: { Authorization: `Token ${authToken}` },
          });

          const personalityProfile = response.data.personality_profile;

          if (personalityProfile) {
            setUserType("personality");
            const scores: PersonalityScores = {
              Openness: personalityProfile.openness,
              Conscientiousness: personalityProfile.conscientiousness,
              Extraversion: personalityProfile.extraversion,
              Agreeableness: personalityProfile.agreeableness,
              Neuroticism: personalityProfile.neuroticism,
            };

            setPersonalityScores(scores);

            // Find primary trait
            const primary = Object.entries(scores).reduce((a, b) =>
              scores[a[0] as PersonalityTrait] > scores[b[0] as PersonalityTrait]
                ? a
                : b
            )[0] as PersonalityTrait;

            setPrimaryTrait(primary);
          } else {
            // No personality profile found
            setUserType("unknown");
          }
        }
      } catch (err) {
        console.error("Error initializing personality:", err);
        setError("Failed to load personality data");
        setUserType("unknown");
      } finally {
        setIsLoading(false);
      }
    };

    initializePersonality();
  }, [authToken, onboarding.assignedPath, onboarding.researchGroup]);

  // Helper functions
  const isPersonalityUser = () => userType === "personality";
  const isCharacterUser = () => userType === "character";

  const getPersonalityConfig = (screenName: string) => {
    const passages = PERSONALITY_passages[primaryTrait];

    switch (screenName) {
      case "map":
        return passages.mapTheme;
      case "thoughtDefender":
        return passages.thoughtDefender;
      case "storyCatalog":
        return passages.storyCatalog;
      case "codex":
        return passages.codex;
      case "equipment":
        return passages.equipment;
      default:
        return passages;
    }
  };

  // Testing mode functions
  const applyTestPersonality = (trait: PersonalityTrait) => {
    if (!originalData) {
      setOriginalData({
        scores: personalityScores,
        primary: primaryTrait,
        userType: userType,
      });
    }

    const testProfile = Object.entries(TEST_PERSONALITIES).find(
      ([name, scores]) => {
        const dominantTrait = Object.entries(scores).reduce((a, b) =>
          scores[a[0] as PersonalityTrait] > scores[b[0] as PersonalityTrait]
            ? a
            : b
        )[0] as PersonalityTrait;
        return dominantTrait === trait;
      }
    );

    if (testProfile) {
      setPersonalityScores(testProfile[1]);
      setPrimaryTrait(trait);
      setUserType("personality");
    }
  };

  const resetToOriginal = () => {
    if (originalData) {
      setPersonalityScores(originalData.scores);
      setPrimaryTrait(originalData.primary);
      setUserType(originalData.userType);
      setOriginalData(null);
    }
  };

  // Get current configurations
  const currentTheme = PERSONALITY_THEMES[primaryTrait];
  const currentBuild = PERSONALITY_BUILDS[primaryTrait];
  const currentpassages = PERSONALITY_passages[primaryTrait];

  const value: PersonalityContextType = {
    // Core data
    userType,
    personalityScores,
    primaryTrait,

    // Configurations
    currentTheme,
    currentBuild,
    currentpassages,

    // Helper functions
    getPersonalityConfig,
    isPersonalityUser,
    isCharacterUser,

    // Testing mode
    testingMode,
    setTestingMode,
    applyTestPersonality,
    resetToOriginal,

    // Loading states
    isLoading,
    error,
  };

  return (
    <PersonalityContext.Provider value={value}>
      {children}
    </PersonalityContext.Provider>
  );
};

export default PersonalityContext;
