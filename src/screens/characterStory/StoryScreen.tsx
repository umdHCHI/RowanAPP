import {
  Alert,
  Animated,
  createGlobalStyles,
  Dimensions,
  Icon,
  LinearGradient,
  Modal,
  React,
  Text,
  TouchableOpacity,
  useCallback,
  useEffect,
  useState,
  View,
} from '../../imports';

// Import useTheme directly to avoid circular dependency issues
import { useTheme } from '../../context/ThemeContext';
// Import archive service for backend operations
import { archiveService } from '../../services/archiveService';
import { getCopingToolMapping, testCopingToolsSetup } from '../../services/testBackendIntegration';

const { width, height } = Dimensions.get('window');

// Artifact Unlock Database
const artifactDatabase = {
  'Clarity Lens of Mindful Sight': {
    name: 'Clarity Lens of Mindful Sight',
    type: 'Focus Relic',
    rarity: 'Legendary',
    description: 'A crystalline lens revealing the true shape of anxious thoughts.',
    powers: ['Enhanced focus', 'Anxiety pattern recognition', 'Present-moment anchoring'],
    statBoosts: { 'Sight Beyond Sight': 2 }
  },
  'Guardian Ward of Boundaries': {
    name: 'Guardian Ward of Boundaries',
    type: 'Protective Seal',
    rarity: 'Epic',
    description: 'An ethereal barrier against overwhelming expectations.',
    powers: ['Pressure resistance', 'Boundary setting', 'Perfectionism protection'],
    statBoosts: { 'Unbreakable Will': 2 }
  },
  'Foundation Stone of Grounding': {
    name: 'Foundation Stone of Grounding',
    type: 'Stability Anchor',
    rarity: 'Rare',
    description: 'A rustic stone that roots you in reality when stress looms.',
    powers: ['Stress grounding', 'Reality anchoring', 'Panic prevention'],
    statBoosts: { 'Elemental Harmony': 2 }
  },
  'Sanctuary Shroud of Comfort': {
    name: 'Sanctuary Shroud of Comfort',
    type: 'Comfort Codex',
    rarity: 'Epic',
    description: 'A worn grimoire that wraps the mind in collective solace.',
    powers: ['Social comfort', 'Belonging enhancement', 'Isolation protection'],
    statBoosts: { "Heart's Compass": 2 }
  },
  'Empathy Conduit Artifact': {
    name: 'Empathy Conduit Artifact',
    type: 'Connection Keystone',
    rarity: 'Epic',
    description: 'A heart-shaped gem that amplifies compassion when guiding others.',
    powers: ['Emotional resonance', 'Listener\'s clarity', 'Support amplification'],
    statBoosts: { "Heart's Compass": 3 }
  },
  'Toolkit Grimoire Artifact': {
    name: 'Toolkit Grimoire Artifact',
    type: 'Strategy Grimoire',
    rarity: 'Rare',
    description: 'A pocket grimoire filled with diverse coping methods.',
    powers: ['Adaptive strategy recall', 'Creative problem-solving', 'Perspective shift'],
    statBoosts: { 'Sight Beyond Sight': 2, "Heart's Compass": 1 }
  }
};

type GrimoireScreenProps = {
  visible: boolean;
  onClose: () => void;
  grimoire?: any;
  onStatGain?: (statName: string, amount: number) => void;
  onArtifactUnlock?: (artifact: any) => void;
  onSkillLearned?: (skills: string[]) => void;
  onStoryComplete?: (completionData: {
    grimoireId: string;
    finalRewards: string[];
    skillsLearned: string[];
    totalStatGains: {[key: string]: number};
  }) => void;
};

const GrimoireScreen = ({ visible, onClose, grimoire, onStatGain, onArtifactUnlock, onSkillLearned, onStoryComplete }: GrimoireScreenProps) => {
  const { theme } = useTheme();
  const globalStyles = createGlobalStyles(theme);
  
  // State declarations - moved to top level
  const [currentId, setCurrentId] = useState('start');
  const [totalStatGains, setTotalStatGains] = useState<{[key: string]: number}>({});
  const [recentGains, setRecentGains] = useState<{[key: string]: number}>({});
  const [showStatGain, setShowStatGain] = useState(false);
  const [unlockedArtifacts, setUnlockedArtifacts] = useState<string[]>([]);
  const [learnedSkills, setLearnedSkills] = useState<string[]>([]);
  const [showArtifactUnlock, setShowArtifactUnlock] = useState(false);
  const [newArtifact, setNewArtifact] = useState<any>(null);
  const [isLoadingPassage, setIsLoadingPassage] = useState(false);
  const [chapterRewards, setChapterRewards] = useState<{[key: string]: any}>({});
  const [showChapterComplete, setShowChapterComplete] = useState(false);
  const [copingToolMapping, setCopingToolMapping] = useState<{[key: string]: number}>({});
  const [savedRewards, setSavedRewards] = useState<any>(null);
  const [currentStoryData, setCurrentStoryData] = useState<any>(null);
  
  // Animations - moved to top level
  const fadeAnim = new Animated.Value(0);
  const statGainAnim = new Animated.Value(0);
  const passageAnim = new Animated.Value(0);
  const artifactUnlockAnim = new Animated.Value(0);
  
  // Check if grimoire has backend content
  const storyData = currentStoryData || grimoire?.content || null;

  // Safe variable declarations - ensure these never cause null errors
  const passages = storyData?.passages || grimoire?.passages || [];
  const grimoireTitle = storyData?.title || grimoire?.title || 'Unknown Story';
  const grimoireSubtitle = storyData?.subtitle || grimoire?.subtitle || '';
  const grimoireAtmosphere = storyData?.atmosphere || grimoire?.atmosphere || '';
  const grimoireDifficulty = storyData?.difficulty || grimoire?.difficulty || '';
  const grimoireRarity = storyData?.rarity || grimoire?.rarity || 'Common';

  // Debug logging - moved inside useEffect to avoid conditional execution
  useEffect(() => {
    if (visible && grimoire) {
      console.log('GrimoireScreen props:', { visible, grimoire });
      console.log('Story data found:', storyData ? 'Yes' : 'No');
      console.log('Story ID being looked up:', grimoire?.id);
      console.log('Using backend content:', !!grimoire?.content);
      console.log('Is chapter-based story:', grimoire?.content?.isChapterBased);
      console.log('Passages count:', passages?.length);
      console.log('First passage:', passages?.[0]);
    }
  }, [visible, grimoire, storyData, passages]);

  // Load coping tool mappings and saved rewards when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load coping tool mapping
        const mapping = await getCopingToolMapping();
        setCopingToolMapping(mapping);
        console.log('Loaded coping tool mapping:', mapping);
        
        // Load saved rewards if we have a character ID
        if (grimoire?.content?.characterId) {
          const rewards = await archiveService.getCharacterRewards(grimoire.content.characterId);
          setSavedRewards(rewards);
          console.log('Loaded saved rewards:', rewards);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    
    loadData();
  }, [grimoire?.content?.characterId]);
  
  // Add effect to handle stat gain animation
  useEffect(() => {
    if (showStatGain) {
      // Animate stat gain notification
      Animated.sequence([
        Animated.timing(statGainAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(statGainAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowStatGain(false);
      });
    }
  }, [showStatGain]);

  // Add effect to handle artifact unlock animation
  useEffect(() => {
    if (showArtifactUnlock && newArtifact) {
      // Animate artifact unlock
      Animated.sequence([
        Animated.timing(artifactUnlockAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(4000),
        Animated.timing(artifactUnlockAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowArtifactUnlock(false);
      });
    }
  }, [showArtifactUnlock, newArtifact]);
  
  // Effect to find current passage when currentId or passages change
  const [current, setCurrent] = useState<any>(null);

  useEffect(() => {
    if (currentId && passages && passages.length > 0) {
      const foundPassage = passages.find((p: any) => p.id === currentId);
      setCurrent(foundPassage || null);
    } else {
      setCurrent(null);
    }
  }, [currentId, passages]);

  // Effect to ensure current passage is found when currentId changes
  useEffect(() => {
    if (currentId && passages && passages.length > 0) {
      const foundPassage = passages.find((p: any) => p.id === currentId);
      console.log('Looking for passage with ID:', currentId);
      console.log('Found passage:', foundPassage);
      
      if (!foundPassage) {
        console.warn('Passage not found for ID:', currentId);
        console.log('Available passage IDs:', passages.map((p: any) => p.id));
        // Fallback to first passage if current passage not found
        if (passages[0]) {
          console.log('Falling back to first passage:', passages[0].id);
          setCurrentId(passages[0].id);
        }
      }
    } else if (passages && passages.length > 0 && !currentId) {
      // If no currentId is set but we have passages, set to first passage
      console.log('No currentId set, using first passage:', passages[0].id);
      setCurrentId(passages[0].id);
    } else if (!passages || passages.length === 0) {
      console.error('No passages available for story:', grimoire?.id);
      console.log('Story data:', storyData);
      console.log('Grimoire content:', grimoire?.content);
    }
  }, [currentId, passages, grimoire?.id, storyData, grimoire?.content]);

  // Effect for modal visibility and initialization
  useEffect(() => {
    if (visible) {
      // Initialize story data
      if (grimoire?.content) {
        setCurrentStoryData(grimoire.content);
      }
      
      // Reset state when opening
      // For chapter-based stories, start with the first passage ID
      if (grimoire?.content?.isChapterBased && grimoire?.content?.passages?.length > 0) {
        const firstPassage = grimoire.content.passages[0];
        const firstPassageId = firstPassage.id || 'start';
        setCurrentId(firstPassageId);
        console.log('Chapter-based story: starting with passage ID:', firstPassageId);
        console.log('First passage content:', firstPassage.text?.substring(0, 50) + '...');
      } else {
        setCurrentId('start');
      }
      setTotalStatGains({});
      setUnlockedArtifacts([]);
      setLearnedSkills([]);
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
      // Animate passage text
      Animated.timing(passageAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, grimoire]);

  // Effect for passage animation when currentId changes
  useEffect(() => {
    if (currentId) {
      // Reset and animate passage when changing
      passageAnim.setValue(0);
      Animated.timing(passageAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [currentId]);

  // Rewards mapping for p4_action choices
  const choiceRewards = {
    "confront": {
      "add_item": "binders_quill_of_mastery",
      "experience": 50,
      "item_name": "Binder's Quill of Mastery",
      "item_description": "A quill that writes with the ink of determination, granting clarity in moments of challenge.",
      "gear_type_id": null, // Will be set dynamically when gear types are available
      "stat_bonuses": {
        "focus_bonus": 5,
        "confidence_bonus": 3
      }
    },
    "avoid": {
      "add_item": "ear_rune_of_will", 
      "experience": 30,
      "item_name": "Ear Rune of Will",
      "item_description": "A protective rune that shields the mind from overwhelming noise and distractions.",
      "gear_type_id": null, // Will be set dynamically when gear types are available
      "stat_bonuses": {
        "resilience_bonus": 5,
        "mindfulness_bonus": 3
      }
    },
    "assist": {
      "add_item": "guides_bookmark_of_kinship",
      "experience": 40,
      "item_name": "Guide's Bookmark of Kinship",
      "item_description": "A bookmark that opens doors to hidden knowledge and connections with others.",
      "gear_type_id": null, // Will be set dynamically when gear types are available
      "stat_bonuses": {
        "empathy_bonus": 5,
        "organization_bonus": 3
      }
    }
  };

  // Process template syntax for the current passage if needed
  const processCurrentPassage = useCallback(() => {
    console.log('processCurrentPassage called for ID:', currentId);
    console.log('Current passage text:', current?.text?.substring(0, 100) + '...');
    console.log('Current passage has template syntax:', current?.text?.includes('{% if'));
    console.log('Current passage choices:', current?.choices);
    
    // Safety check: if no current passage, return null
    if (!current) {
      console.warn('No current passage found for ID:', currentId);
      console.log('Available passages:', passages);
      return null;
    }
    
    if (current && current.text && current.text.includes('{% if') && (!current.choices || current.choices.length === 0)) {
      console.log('Processing template syntax for current passage:', current.id);
      
      // Extract choices from template syntax
      const choiceMatches = current.text.match(/\{% if variables\.branch_choice == "([^"]+)" %\}([\s\S]*?)(?=\{% elif|\{% endif %})/g);
      console.log('Found choice matches:', choiceMatches);
      
      if (choiceMatches && choiceMatches.length > 0) {
        console.log(`Found template choices for current passage ${current.id}:`, choiceMatches.length);
        
        // Create choices from the template
        const choices = choiceMatches.map((match: string, index: number) => {
          const choiceMatch = match.match(/\{% if variables\.branch_choice == "([^"]+)" %\}([\s\S]*?)(?=\{% elif|\{% endif %})/);
          if (choiceMatch) {
            const choiceId = choiceMatch[1]; // "confront", "avoid", "assist"
            const choiceContent = choiceMatch[2].trim();
            
            // Create choice text based on the choice ID
            let choiceText = '';
            let choiceDescription = '';
            
            switch (choiceId) {
              case 'confront':
                choiceText = 'Stride toward the clear voice';
                choiceDescription = 'Face the challenge directly with courage';
                break;
              case 'avoid':
                choiceText = 'Use ear-rune to dull the chorus';
                choiceDescription = 'Temporarily block out the overwhelming noise';
                break;
              case 'assist':
                choiceText = 'Seek the Librarian\'s guidance';
                choiceDescription = 'Find help from the Archive\'s keeper';
                break;
              default:
                choiceText = `Choose ${choiceId}`;
                choiceDescription = 'Make your decision';
            }
            
            const choice = {
              text: choiceText,
              next: `choice_${choiceId}`, // This will be handled by the choice system
              statEffects: {},
              description: choiceDescription,
              skillsLearned: [],
              choiceId: choiceId,
              choiceContent: choiceContent,
              isTemplateChoice: true
            };
            
            console.log('Created choice:', choice);
            return choice;
          }
          return null;
        }).filter(Boolean);
        
        console.log('Final choices array:', choices);
        
        // Set the passage content to a prompt and add the choices
        const promptText = 'The moment of decision arrives. The Archive\'s whispers grow clearer, demanding a response. What will you do?';
        
        // Return the updated current passage without updating state
        const updatedCurrent = {
          ...current,
          text: promptText,
          choices: choices,
          passageType: 'decision'
        };
        
        console.log('Updated current passage with template choices:', currentId);
        console.log('Updated passage choices:', choices);
        console.log('Updated current passage:', updatedCurrent);
        return updatedCurrent;
      }
    }
    return current;
  }, [current, currentId, storyData]);

  // Debug: Force process if we have template syntax but no choices
  const [debugProcessedCurrent, setDebugProcessedCurrent] = useState<any>(null);
  
  useEffect(() => {
    // Process the current passage
    const processedCurrent = processCurrentPassage();
    
    // Special case for p4_action - create the three standard choices
    if (processedCurrent && processedCurrent.id === 'p4_action' && (!processedCurrent.choices || processedCurrent.choices.length === 0)) {
      console.log('DEBUG: Creating standard choices for p4_action');
      
      const choices = [
        {
          text: 'Stride toward the clear voice',
          next: 'choice_confront',
          statEffects: {},
          description: 'Face the challenge directly with courage',
          skillsLearned: [],
          choiceId: 'confront',
          choiceContent: 'You stride toward the clear voice. The aisles straighten themselves; each step inscribes a glowing rune beneath your boots. The whisper condenses into a firm command—yet instead of panic, you feel laser-focus sharpen around you.',
          isTemplateChoice: true
        },
        {
          text: 'Use ear-rune to dull the chorus',
          next: 'choice_avoid',
          statEffects: {},
          description: 'Temporarily block out the overwhelming noise',
          skillsLearned: [],
          choiceId: 'avoid',
          choiceContent: 'You murmur the syllables of an ear-rune and press your palms over your ears. The chorus dulls to a distant throb, but the shelves remain a tangled maze—proof that concealment only delays the challenge.',
          isTemplateChoice: true
        },
        {
          text: 'Seek the Librarian\'s guidance',
          next: 'choice_assist',
          statEffects: {},
          description: 'Find help from the Archive\'s keeper',
          skillsLearned: [],
          choiceId: 'assist',
          choiceContent: 'You press against a seam in the nearest shelf. It swings inward, revealing a narrow alcove where the Librarian stands. With a gentle nod, they slide you an ornate bookmark and gesture toward a hidden passage.',
          isTemplateChoice: true
        }
      ];
      
      console.log('DEBUG: Created standard choices for p4_action:', choices);
      
      setDebugProcessedCurrent({
        ...processedCurrent,
        text: 'The moment of decision arrives. The Archive\'s whispers grow clearer, demanding a response. What will you do?',
        choices: choices,
        passageType: 'decision'
      });
    } else {
      setDebugProcessedCurrent(processedCurrent);
    }
  }, [processCurrentPassage]);

  // Add more debug logging
  useEffect(() => {
    console.log('Passages array:', passages);
    console.log('Current ID:', currentId);
    console.log('Current passage found:', debugProcessedCurrent);
    console.log('Story data structure:', {
      title: storyData?.title,
      passagesCount: passages?.length,
      firstPassage: passages?.[0],
      isChapterBased: grimoire?.content?.isChapterBased
    });
    
    // Log all passage IDs for debugging
    if (passages && passages.length > 0) {
      console.log('Available passage IDs:', passages.map((p: any) => p.id));
    }
    
    // Choices debug logging
    if (debugProcessedCurrent) {
      console.log('=== CHOICES RENDERING DEBUG ===');
      console.log('debugProcessedCurrent ID:', debugProcessedCurrent?.id);
      console.log('debugProcessedCurrent text:', debugProcessedCurrent?.text);
      console.log('debugProcessedCurrent choices:', debugProcessedCurrent?.choices);
      console.log('debugProcessedCurrent choices length:', debugProcessedCurrent?.choices?.length);
      console.log('debugProcessedCurrent choices type:', typeof debugProcessedCurrent?.choices);
      console.log('debugProcessedCurrent choices is array:', Array.isArray(debugProcessedCurrent?.choices));
      
      if (!debugProcessedCurrent?.choices) {
        console.log('No choices found - returning null');
      } else if (debugProcessedCurrent.choices.length === 0) {
        console.log('Choices array is empty - returning null');
      } else {
        console.log('About to map choices, count:', debugProcessedCurrent.choices.length);
        debugProcessedCurrent.choices.forEach((choice: any, idx: number) => {
          console.log('Rendering choice:', idx, choice);
          console.log('Choice text:', choice.text);
          console.log('Choice type:', typeof choice);
        });
        console.log('=== END CHOICES RENDERING DEBUG ===');
      }
    }
  }, [passages, currentId, debugProcessedCurrent, storyData, grimoire]);

  // Function to fetch passage content from backend
  const fetchPassageContent = async (passageId: string) => {
    try {
      console.log('Fetching passage content for:', passageId);
      setIsLoadingPassage(true);
      const passageData = await archiveService.getPassage(grimoire?.id, passageId);
      if (passageData?.passage?.content) {
        let passageContent = passageData.passage.content;
        
        // Process template syntax if present
        if (passageContent.includes('{% if')) {
          console.log('Found template syntax in passage:', passageId);
          
          // Extract choices from template syntax
          const choiceMatches = passageContent.match(/\{% if variables\.branch_choice == "([^"]+)" %\}([\s\S]*?)(?=\{% elif|\{% endif %})/g);
          
          if (choiceMatches && choiceMatches.length > 0) {
            console.log(`Found template choices for passage ${passageId}:`, choiceMatches.length);
            
            // Create choices from the template
            const choices = choiceMatches.map((match: string, index: number) => {
              const choiceMatch = match.match(/\{% if variables\.branch_choice == "([^"]+)" %\}([\s\S]*?)(?=\{% elif|\{% endif %})/);
              if (choiceMatch) {
                const choiceId = choiceMatch[1]; // "confront", "avoid", "assist"
                const choiceContent = choiceMatch[2].trim();
                
                // Create choice text based on the choice ID
                let choiceText = '';
                let choiceDescription = '';
                
                switch (choiceId) {
                  case 'confront':
                    choiceText = 'Stride toward the clear voice';
                    choiceDescription = 'Face the challenge directly with courage';
                    break;
                  case 'avoid':
                    choiceText = 'Use ear-rune to dull the chorus';
                    choiceDescription = 'Temporarily block out the overwhelming noise';
                    break;
                  case 'assist':
                    choiceText = 'Seek the Librarian\'s guidance';
                    choiceDescription = 'Find help from the Archive\'s keeper';
                    break;
                  default:
                    choiceText = `Choose ${choiceId}`;
                    choiceDescription = 'Make your decision';
                }
                
                return {
                  text: choiceText,
                  next: `choice_${choiceId}`, // This will be handled by the choice system
                  statEffects: {},
                  description: choiceDescription,
                  skillsLearned: [],
                  choiceId: choiceId,
                  choiceContent: choiceContent,
                  isTemplateChoice: true
                };
              }
              return null;
            }).filter(Boolean);
            
            // Set the passage content to a prompt and add the choices
            passageContent = 'The moment of decision arrives. The Archive\'s whispers grow clearer, demanding a response. What will you do?';
            
            // Update the passage with processed content and choices
            const updatedPassages = storyData.passages.map((p: any) => 
              p.id === passageId ? { 
                ...p, 
                text: passageContent,
                choices: choices,
                passageType: 'decision'
              } : p
            );
            
            // Update the story data
            const updatedStoryData = { ...storyData, passages: updatedPassages };
            
            // Update the state instead of directly modifying grimoire.content
            setCurrentStoryData(updatedStoryData);
          } else {
            // Remove template syntax and use the first option as fallback
            passageContent = passageContent.replace(/\{% if.*?%\}[\s\S]*?{% elif.*?%}[\s\S]*?{% endif %}/g, '');
            passageContent = passageContent.replace(/\{% if.*?%\}[\s\S]*?{% endif %}/g, '');
            passageContent = passageContent.trim();
            
            // Update the passage content
            const updatedPassages = storyData.passages.map((p: any) => 
              p.id === passageId ? { ...p, text: passageContent } : p
            );
            
            // Update the story data
            const updatedStoryData = { ...storyData, passages: updatedPassages };
            
            // Update the state instead of directly modifying grimoire.content
            setCurrentStoryData(updatedStoryData);
          }
        } else {
          // No template syntax, just update the content
          const updatedPassages = storyData.passages.map((p: any) => 
            p.id === passageId ? { ...p, text: passageContent } : p
          );
          
          // Update the story data
          const updatedStoryData = { ...storyData, passages: updatedPassages };
          
          // Update the state instead of directly modifying grimoire.content
          setCurrentStoryData(updatedStoryData);
        }
        
        console.log('Updated passage content:', passageContent.substring(0, 50) + '...');
      }
    } catch (error) {
      console.error('Failed to fetch passage content:', error);
    } finally {
      setIsLoadingPassage(false);
    }
  };

  // Function to handle tap-to-continue for narration passages
  const handlePassageTap = async () => {
    if (!debugProcessedCurrent || isLoadingPassage) return;
    // If this is a narration passage with no choices, auto-progress
    if (debugProcessedCurrent.passageType === 'narration' && (!debugProcessedCurrent.choices || debugProcessedCurrent.choices.length === 0)) {
      // Find the next passage in the sequence
      const currentIndex = storyData.passages.findIndex((p: any) => p.id === currentId);
      const nextPassage = storyData.passages[currentIndex + 1];
      if (nextPassage) {
        // Always fetch the next passage's content before progressing
        setIsLoadingPassage(true);
        try {
          const passageData = await archiveService.getPassage(grimoire?.id, nextPassage.id);
          if (passageData?.passage?.content) {
            let passageContent = passageData.passage.content;
            
            // Process template syntax if present
            if (passageContent.includes('{% if')) {
              console.log('Found template syntax in next passage:', nextPassage.id);
              
              // Extract choices from template syntax
              const choiceMatches = passageContent.match(/\{% if variables\.branch_choice == "([^"]+)" %\}([\s\S]*?)(?=\{% elif|\{% endif %})/g);
              
              if (choiceMatches && choiceMatches.length > 0) {
                console.log(`Found template choices for next passage ${nextPassage.id}:`, choiceMatches.length);
                
                // Create choices from the template
                const choices = choiceMatches.map((match: string, index: number) => {
                  const choiceMatch = match.match(/\{% if variables\.branch_choice == "([^"]+)" %\}([\s\S]*?)(?=\{% elif|\{% endif %})/);
                  if (choiceMatch) {
                    const choiceId = choiceMatch[1];
                    const choiceContent = choiceMatch[2].trim();
                    
                    // Create choice text based on the choice ID
                    let choiceText = '';
                    let choiceDescription = '';
                    
                    switch (choiceId) {
                      case 'confront':
                        choiceText = 'Stride toward the clear voice';
                        choiceDescription = 'Face the challenge directly with courage';
                        break;
                      case 'avoid':
                        choiceText = 'Use ear-rune to dull the chorus';
                        choiceDescription = 'Temporarily block out the overwhelming noise';
                        break;
                      case 'assist':
                        choiceText = 'Seek the Librarian\'s guidance';
                        choiceDescription = 'Find help from the Archive\'s keeper';
                        break;
                      default:
                        choiceText = `Choose ${choiceId}`;
                        choiceDescription = 'Make your decision';
                    }
                    
                    return {
                      text: choiceText,
                      next: `choice_${choiceId}`,
                      statEffects: {},
                      description: choiceDescription,
                      skillsLearned: [],
                      choiceId: choiceId,
                      choiceContent: choiceContent,
                      isTemplateChoice: true
                    };
                  }
                  return null;
                }).filter(Boolean);
                
                // Set the passage content to a prompt and add the choices
                passageContent = 'The moment of decision arrives. The Archive\'s whispers grow clearer, demanding a response. What will you do?';
                
                // Update the passage with processed content and choices
                const updatedPassages = storyData.passages.map((p: any) =>
                  p.id === nextPassage.id ? { 
                    ...p, 
                    text: passageContent,
                    choices: choices,
                    passageType: 'decision'
                  } : p
                );
                const updatedStoryData = { ...storyData, passages: updatedPassages };
                setCurrentStoryData(updatedStoryData);
              } else {
                // Remove template syntax and use the first option as fallback
                passageContent = passageContent.replace(/\{% if.*?%\}[\s\S]*?{% elif.*?%}[\s\S]*?{% endif %}/g, '');
                passageContent = passageContent.replace(/\{% if.*?%\}[\s\S]*?{% endif %}/g, '');
                passageContent = passageContent.trim();
                
                // Update the passage content
                const updatedPassages = storyData.passages.map((p: any) =>
                  p.id === nextPassage.id ? { ...p, text: passageContent } : p
                );
                const updatedStoryData = { ...storyData, passages: updatedPassages };
                setCurrentStoryData(updatedStoryData);
              }
            } else {
              // No template syntax, just update the content
              const updatedPassages = storyData.passages.map((p: any) =>
                p.id === nextPassage.id ? { ...p, text: passageContent } : p
              );
              const updatedStoryData = { ...storyData, passages: updatedPassages };
              setCurrentStoryData(updatedStoryData);
            }
          }
        } catch (err) {
          console.error('Failed to fetch next passage content:', err);
        } finally {
          setIsLoadingPassage(false);
        }
        await handleChoice({
          text: 'Continue...',
          next: nextPassage.id,
          statEffects: {},
          description: 'Proceed to the next passage',
          skillsLearned: [],
          isProgression: true
        });
      }
    }
  };

  const handleChoice = async (choice: any) => {
    const { next, statEffects, skillsLearned, artifactUnlock, isEnding, finalRewards, wisdomGained, choiceId, isTemplateChoice } = choice;
    
    // Handle template choices (from backend template syntax)
    if (isTemplateChoice && choiceId) {
      try {
        console.log('Making template choice:', choiceId);
        
        // Get the reward for this choice
        const reward = choiceRewards[choiceId as keyof typeof choiceRewards];
        if (reward) {
          console.log('Applying reward for choice:', choiceId, reward);
          console.log('Current coping tool mapping:', copingToolMapping);
          
          // Update reward with actual coping tool ID if available
          const updatedReward = {
            ...reward,
            gear_type_id: copingToolMapping[choiceId] || null
          };
          
          console.log('Updated reward with coping tool ID:', updatedReward.gear_type_id);
          
          setChapterRewards(prev => ({ ...prev, [choiceId]: updatedReward }));
          
          // Add experience to total stat gains
          setTotalStatGains(prev => ({
            ...prev,
            'Experience': (prev['Experience'] || 0) + updatedReward.experience
          }));
          
          // Show reward notification
          setRecentGains({ 'Experience': updatedReward.experience });
          setShowStatGain(true);
          
          // Save rewards to backend
          try {
            await archiveService.saveChoiceRewards(
              grimoire.id,
              storyData?.chapterId || 1,
              { [choiceId]: updatedReward }
            );
            console.log('Successfully saved choice reward to backend');
          } catch (error) {
            console.error('Failed to save choice reward to backend:', error);
            // Continue even if backend save fails
          }
          
          // Acquire coping tool if gear_type_id is provided
          if (updatedReward.gear_type_id) {
            try {
              console.log('Acquiring coping tool with ID:', updatedReward.gear_type_id);
              const acquiredTool = await archiveService.acquireCopingTool(updatedReward.gear_type_id);
              console.log('Successfully acquired coping tool:', acquiredTool);
              
              // Show coping tool acquisition notification
              Alert.alert(
                '🎁 New Coping Tool Acquired!',
                `You have earned: ${updatedReward.item_name}\n\n${updatedReward.item_description}`,
                [{ text: 'Excellent!', style: 'default' }]
              );
            } catch (error) {
              console.error('Failed to acquire coping tool:', error);
              // Still show the reward even if coping tool acquisition fails
              Alert.alert(
                '🎁 Reward Earned!',
                `You have earned: ${updatedReward.item_name}\n\n${updatedReward.item_description}\n\n(Note: Coping tool acquisition failed, but your reward has been recorded)`,
                [{ text: 'Continue', style: 'default' }]
              );
            }
          } else {
            // No coping tool to acquire, just show the reward
            console.log('No coping tool ID available, showing reward only');
            Alert.alert(
              '🎁 Reward Earned!',
              `You have earned: ${updatedReward.item_name}\n\n${updatedReward.item_description}\n\n(Note: Coping tools not yet configured in backend)`,
              [{ text: 'Excellent!', style: 'default' }]
            );
          }
        }
        
        // For template choices, we don't send to backend - just show the result directly
        if (choice.choiceContent) {
          const fallbackPassage = {
            id: `choice_fallback_${choiceId}`,
            text: choice.choiceContent,
            atmosphere: 'mysterious',
            passageType: 'result',
            choices: [
              {
                text: 'Continue to Chapter Summary',
                next: 'chapter_complete',
                statEffects: {},
                description: 'View your chapter rewards and progress',
                skillsLearned: [],
                isChapterEnd: true
              }
            ]
          };
          
          const updatedPassages = [...storyData.passages, fallbackPassage];
          const updatedStoryData = { ...storyData, passages: updatedPassages };
          
          setCurrentStoryData(updatedStoryData);
          
          setTimeout(() => setCurrentId(fallbackPassage.id), 500);
          return;
        }
      } catch (error) {
        console.error('Failed to handle template choice:', error);
        // Fallback: show the choice content directly
        if (choice.choiceContent) {
          const fallbackPassage = {
            id: `choice_fallback_${choiceId}`,
            text: choice.choiceContent,
            atmosphere: 'mysterious',
            passageType: 'result',
            choices: [
              {
                text: 'Continue to Chapter Summary',
                next: 'chapter_complete',
                statEffects: {},
                description: 'View your chapter rewards and progress',
                skillsLearned: [],
                isChapterEnd: true
              }
            ]
          };
          
          const updatedPassages = [...storyData.passages, fallbackPassage];
          const updatedStoryData = { ...storyData, passages: updatedPassages };
          
          setCurrentStoryData(updatedStoryData);
          
          setTimeout(() => setCurrentId(fallbackPassage.id), 500);
          return;
        }
      }
    }
    
    // Handle chapter completion
    if (next === 'chapter_complete' || choice.isChapterEnd) {
      console.log('Chapter complete, showing summary');
      
      // Save final chapter rewards to backend
      if (Object.keys(chapterRewards).length > 0) {
        try {
          // Calculate total experience from stat gains
          const totalExperience = Object.values(totalStatGains).reduce((sum: number, amount: number) => sum + amount, 0);
          
          // Map frontend stat names to backend wellness stats
          const wellnessGains: any = {};
          Object.entries(totalStatGains).forEach(([stat, amount]) => {
            if (stat !== 'Experience') {
              let backendStat = stat;
              switch (stat) {
                case 'Sight Beyond Sight':
                  backendStat = 'awareness';
                  break;
                case 'Unbreakable Will':
                  backendStat = 'resilience';
                  break;
                case "Heart's Compass":
                  backendStat = 'connection';
                  break;
                case 'Elemental Harmony':
                  backendStat = 'balance';
                  break;
                default:
                  backendStat = stat.toLowerCase();
              }
              wellnessGains[backendStat] = amount;
            }
          });
          
          await archiveService.saveStoryCompletion(
            grimoire.id,
            totalExperience,
            wellnessGains
          );
          console.log('Successfully saved chapter completion to backend');
        } catch (error) {
          console.error('Failed to save chapter completion to backend:', error);
          // Continue even if backend save fails
        }
      }
      
      setShowChapterComplete(true);
      return;
    }
    
    // Handle stat effects
    if (statEffects) {
      const newRecentGains: {[key: string]: number} = {};
      
      Object.entries(statEffects).forEach(([statName, amount]) => {
        newRecentGains[statName] = amount as number;
        setTotalStatGains(prev => ({
          ...prev,
          [statName]: (prev[statName] || 0) + (amount as number)
        }));
        
        // Call parent callback for stat gain
        if (onStatGain) {
          onStatGain(statName, amount as number);
        }
      });
      
      setRecentGains(newRecentGains);
      setShowStatGain(true);
    }

    // Handle skills learned
    if (skillsLearned && skillsLearned.length > 0) {
      setLearnedSkills(prev => [...prev, ...skillsLearned]);
      if (onSkillLearned) {
        onSkillLearned(skillsLearned);
      }
    }

    // Handle artifact unlock
    if (artifactUnlock && artifactDatabase[artifactUnlock as keyof typeof artifactDatabase]) {
      const artifact = artifactDatabase[artifactUnlock as keyof typeof artifactDatabase];
      setNewArtifact(artifact);
      setUnlockedArtifacts(prev => [...prev, artifactUnlock]);
      setShowArtifactUnlock(true);

      if (onArtifactUnlock) {
        onArtifactUnlock(artifact);
      }
    }
    
    // Check if this is an ending choice
    if (isEnding || (!next && (finalRewards || wisdomGained))) {
      // End of grimoire - show completion summary
      const totalGainsText = Object.entries(totalStatGains)
        .map(([stat, amount]) => `${stat}: +${amount}`)
        .join('\n');
      
      const artifactsText = unlockedArtifacts.length > 0 
        ? `\n\n🎭 Artifacts Unlocked:\n${unlockedArtifacts.join('\n')}`
        : '';
      
      const skillsText = learnedSkills.length > 0 
        ? `\n\n🎯 Coping Skills Learned:\n${learnedSkills.join(', ')}`
        : '';

      const finalRewardsText = finalRewards && finalRewards.length > 0
        ? `\n\n🏆 Final Rewards:\n${finalRewards.join('\n')}`
        : '';

      const wisdomText = wisdomGained 
        ? `\n\n📜 Wisdom Gained:\n"${wisdomGained}"`
        : '';
      
      Alert.alert(
        '📚 Grimoire Mastered! ✨',
        `Your journey through the ${grimoireTitle} has transformed your understanding:\n\n⚡ Archive Foundations Strengthened:\n${totalGainsText}${artifactsText}${skillsText}${finalRewardsText}${wisdomText}\n\nYour character has grown significantly through these choices. The wisdom you've gained will serve you well in future challenges.`,
        [{ text: 'Return to Archive', onPress: onClose }]
      );

      if (onStoryComplete) {
        onStoryComplete({
          grimoireId: grimoire?.id || '',
          finalRewards: finalRewards || [],
          skillsLearned: learnedSkills,
          totalStatGains: totalStatGains,
        });
      }
    } else if (next) {
      // Handle chapter-based story flow
      if (storyData?.isChapterBased && grimoire?.content?.chapterId) {
        try {
          console.log('Chapter-based story: fetching next passage:', next);
          // For chapter-based stories, we need to fetch the actual passage content
          const nextPassage = await archiveService.getPassage(grimoire.id, next);
          if (nextPassage?.passage?.content) {
            // Update the current passage with the fetched content
            const updatedPassages = storyData.passages.map((p: any) => 
              p.id === next ? { ...p, text: nextPassage.passage.content } : p
            );
            
            // Update the story data with the new passage content
            const updatedStoryData = { ...storyData, passages: updatedPassages };
            
            // Update the state instead of directly modifying grimoire.content
            setCurrentStoryData(updatedStoryData);
            
            console.log('Updated passage content:', nextPassage.passage.content);
          }
        } catch (error) {
          console.error('Failed to fetch passage content:', error);
        }
      }
      
      // Update current passage ID
      setTimeout(() => setCurrentId(next), 500);
    }
  };

  // Safety check: ensure current passage is found - moved after all hooks
  const isLoading = !debugProcessedCurrent;
  
  if (isLoading) {
    console.warn('Current passage not found for ID:', currentId);
    console.log('Available passages:', passages);
    console.log('Story data:', storyData);
    console.log('Grimoire:', grimoire);
  }

  // Add fallback for when no passages are available
  const hasValidPassages = passages && passages.length > 0;
  const hasValidStoryData = storyData || grimoire;
  const hasValidGrimoire = grimoire && (grimoire.title || grimoire.id);

  const StatGainNotification = () => {
    if (!showStatGain) return null;
    
    return (
      <Animated.View 
        style={[
          globalStyles.grimoireStatGainNotification,
          { 
            opacity: statGainAnim,
            transform: [{
              translateY: statGainAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }]
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.95)', 'rgba(34, 197, 94, 0.95)']}
          style={globalStyles.grimoireStatGainGradient}
        >
          <Icon name="trending-up" size={20} color="#065F46" />
          <View style={globalStyles.grimoireStatGainContent}>
            <Text style={globalStyles.grimoireStatGainTitle}>Archive Foundations Strengthened!</Text>
            {Object.entries(recentGains).map(([stat, amount]) => (
              <Text key={stat} style={globalStyles.grimoireStatGainText}>
                {stat} +{amount}
              </Text>
            ))}
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const ArtifactUnlockNotification = () => {
    if (!showArtifactUnlock || !newArtifact) return null;
    
    return (
      <Animated.View 
        style={[
          globalStyles.grimoireArtifactUnlockNotification,
          { 
            opacity: artifactUnlockAnim,
            transform: [{
              scale: artifactUnlockAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.8, 1.1, 1]
              })
            }]
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(168, 85, 247, 0.95)', 'rgba(139, 92, 246, 0.95)']}
          style={globalStyles.grimoireArtifactUnlockGradient}
        >
          <Icon name="gift" size={24} color="#FCD34D" />
          <View style={globalStyles.grimoireArtifactUnlockContent}>
            <Text style={globalStyles.grimoireArtifactUnlockTitle}>🎭 New Artifact Unlocked! ✨</Text>
            <Text style={globalStyles.grimoireArtifactUnlockName}>{newArtifact.name}</Text>
            <Text style={globalStyles.grimoireArtifactUnlockDescription}>{newArtifact.description}</Text>
            <View style={globalStyles.grimoireArtifactPowers}>
              {newArtifact.powers.slice(0, 2).map((power: string, index: number) => (
                <Text key={index} style={globalStyles.grimoireArtifactPowerText}>• {power}</Text>
              ))}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const ChapterCompletionModal = () => {
    if (!showChapterComplete) return null;
    
    const totalExperience = Object.values(chapterRewards).reduce((sum: number, reward: any) => sum + (reward.experience || 0), 0);
    const earnedItems = Object.values(chapterRewards).map((reward: any) => reward.item_name).filter(Boolean);
    
    return (
      <Modal visible={showChapterComplete} transparent onRequestClose={() => setShowChapterComplete(false)}>
        <>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <LinearGradient
              colors={['rgba(30, 41, 59, 0.95)', 'rgba(51, 65, 85, 0.8)', 'rgba(30, 41, 59, 0.95)']}
              style={{ padding: 24, borderRadius: 16, width: '90%', maxWidth: 400 }}
            >
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <Icon name="award" size={40} color="#FCD34D" />
                <Text style={{ color: '#FCD34D', fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>
                  Chapter Complete!
                </Text>
              </View>
              
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: '#9CA3AF', fontSize: 16, textAlign: 'center', marginBottom: 16 }}>
                  You have completed Chapter {grimoire?.content?.chapterId || 1} of {grimoireTitle}
                </Text>
                
                {totalExperience > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <Icon name="trending-up" size={20} color="#10B981" />
                    <Text style={{ color: '#10B981', fontSize: 18, marginLeft: 8 }}>
                      +{totalExperience} Experience
                    </Text>
                  </View>
                )}
                
                {earnedItems.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: '#A855F7', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
                      Items Earned:
                    </Text>
                    {earnedItems.map((itemName: string, index: number) => (
                      <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Icon name="gift" size={16} color="#FCD34D" />
                        <Text style={{ color: '#E0E7FF', fontSize: 14, marginLeft: 8 }}>
                          {itemName}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              
              <TouchableOpacity
                style={{ backgroundColor: '#7C3AED', padding: 16, borderRadius: 8, alignItems: 'center' }}
                onPress={() => {
                  setShowChapterComplete(false);
                  onClose();
                }}
              >
                <Text style={{ color: '#E0E7FF', fontSize: 16, fontWeight: 'bold' }}>
                  Return to Archive
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </>
      </Modal>
    );
  };

  const getRarityColors = (rarity: string): readonly [string, string] => {
    switch (rarity) {
      case 'Legendary': return ['#F97316', '#FCD34D'];
      case 'Epic': return ['#A855F7', '#F472B6'];
      case 'Rare': return ['#3B82F6', '#06B6D4'];
      default: return ['#6B7280', '#9CA3AF'];
    }
  };

  const getChoiceIcon = (choice: any) => {
    if (choice.statEffects) {
      const stats = Object.keys(choice.statEffects);
      if (stats.includes('Sight Beyond Sight')) return '👁️';
      if (stats.includes('Unbreakable Will')) return '⚓';
      if (stats.includes("Heart's Compass")) return '🔗';
      if (stats.includes('Elemental Harmony')) return '⚖️';
    }
    return '📜';
  };

  const getChoiceColor = (choice: any): readonly [string, string] => {
    if (choice.statEffects) {
      const stats = Object.keys(choice.statEffects);
      if (stats.includes('Sight Beyond Sight')) return ['#3B82F6', '#06B6D4'];
      if (stats.includes('Unbreakable Will')) return ['#059669', '#10B981'];
      if (stats.includes("Heart's Compass")) return ['#DC2626', '#F472B6'];
      if (stats.includes('Elemental Harmony')) return ['#D97706', '#FCD34D'];
    }
    return ['#6B7280', '#9CA3AF'];
  };

  // Effect to handle template processing state updates
  useEffect(() => {
    if (debugProcessedCurrent && debugProcessedCurrent !== current) {
      // If the processed current passage is different from the original current passage,
      // it means we have template processing that needs to be applied to the story data
      const updatedPassages = storyData.passages.map((p: any) => 
        p.id === currentId ? debugProcessedCurrent : p
      );
      
      const updatedStoryData = { ...storyData, passages: updatedPassages };
      setCurrentStoryData(updatedStoryData);
    }
  }, [debugProcessedCurrent, current, currentId, storyData]);

  return (
    <Modal 
      visible={visible} 
      animationType="fade" 
      transparent={true} 
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <>
        {!visible || !hasValidGrimoire ? null : !hasValidStoryData ? (
          // Error state - no story data at all
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <Text style={{ color: 'white', fontSize: 18, margin: 20, textAlign: 'center' }}>
              Story data not found for ID: {grimoire?.id || 'Unknown'}
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 14, margin: 20, textAlign: 'center' }}>
              This story may not be available in the current Archive.
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 20, backgroundColor: '#333', borderRadius: 8, marginTop: 20 }}>
              <Text style={{ color: 'white' }}>Close</Text>
            </TouchableOpacity>
          </View>
        ) : !hasValidPassages ? (
          // Error state - no passages available
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <Text style={{ color: 'white', fontSize: 18, margin: 20, textAlign: 'center' }}>
              No passages available for: {grimoireTitle}
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 14, margin: 20, textAlign: 'center' }}>
              This story may not have any content yet.
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 20, backgroundColor: '#333', borderRadius: 8, marginTop: 20 }}>
              <Text style={{ color: 'white' }}>Close</Text>
            </TouchableOpacity>
          </View>
        ) : isLoading ? (
          // Loading state - current passage not found
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <Icon name="loader" size={40} color="#A855F7" style={{ marginBottom: 16 }} />
            <Text style={{ color: 'white', fontSize: 18, margin: 20, textAlign: 'center' }}>
              Loading passage...
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 14, margin: 20, textAlign: 'center' }}>
              Preparing your journey through the Archive.
            </Text>
          </View>
        ) : !debugProcessedCurrent ? (
          // Fallback state - current passage still not found after fallbacks
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <Icon name="alert-circle" size={40} color="#EF4444" style={{ marginBottom: 16 }} />
            <Text style={{ color: 'white', fontSize: 18, margin: 20, textAlign: 'center' }}>
              Unable to load story content
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 14, margin: 20, textAlign: 'center' }}>
              Please try again or contact support.
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 20, backgroundColor: '#333', borderRadius: 8, marginTop: 20 }}>
              <Text style={{ color: 'white' }}>Close</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Main content
          <View style={globalStyles.grimoireModalOverlay}>
            <View style={globalStyles.grimoireModalContent}>
              {/* Header */}
              <View style={globalStyles.grimoireHeader}>
                <View style={globalStyles.grimoireHeaderLeft}>
                  <View style={globalStyles.grimoireTitleRow}>
                    <Text style={globalStyles.grimoireTitle}>
                      {grimoireTitle}
                      {grimoire?.content?.isChapterBased && (
                        <Text style={{ color: '#FCD34D', fontSize: 14 }}> (Chapter {grimoire?.content?.chapterId})</Text>
                      )}
                    </Text>
                    <View style={globalStyles.grimoireRarityBadge}>
                      <Text style={globalStyles.grimoireRarityText}>
                        {grimoireRarity}
                      </Text>
                    </View>
                  </View>
                  <Text style={globalStyles.grimoireSubtitle}>
                    {grimoireSubtitle}
                  </Text>
                  <View style={globalStyles.grimoireDifficultyRow}>
                    <Icon name="target" size={10} color={theme.rarityEpic} />
                    <Text style={globalStyles.grimoireDifficultyText}>
                      {grimoireDifficulty}
                    </Text>
                  </View>
                  <View style={globalStyles.grimoireAtmosphereRow}>
                    <Icon name="wind" size={10} color={theme.statusInfo} />
                    <Text style={globalStyles.grimoireAtmosphereText}>
                      {grimoireAtmosphere}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={globalStyles.grimoireCloseButton}
                  onPress={onClose}
                >
                  <Icon name="x" size={16} style={globalStyles.grimoireCloseIcon} />
                </TouchableOpacity>
                {/* Temporary test button for gear types */}
                <TouchableOpacity 
                  style={[globalStyles.grimoireCloseButton, { marginRight: 40 }]}
                  onPress={async () => {
                    console.log('Testing coping tools setup...');
                    await testCopingToolsSetup();
                    // Reload coping tool mapping after setup
                    const mapping = await getCopingToolMapping();
                    setCopingToolMapping(mapping);
                  }}
                >
                  <Icon name="settings" size={16} style={globalStyles.grimoireCloseIcon} />
                </TouchableOpacity>
                {/* Rewards viewer button */}
                <TouchableOpacity 
                  style={[globalStyles.grimoireCloseButton, { marginRight: 80 }]}
                  onPress={() => {
                    console.log('Current saved rewards:', savedRewards);
                    console.log('Current chapter rewards:', chapterRewards);
                    console.log('Current total stat gains:', totalStatGains);
                    
                    const totalExperience = Object.values(chapterRewards).reduce((sum: number, reward: any) => sum + (reward.experience || 0), 0);
                    const earnedItems = Object.values(chapterRewards).map((reward: any) => reward.item_name).filter(Boolean);
                    
                    // Build comprehensive rewards display
                    let rewardsText: string = '📊 Current Rewards Status\n\n';
                    
                    // Chapter rewards (current session)
                    if (Object.keys(chapterRewards).length > 0) {
                      rewardsText += '🎯 Chapter Rewards (This Session):\n';
                      Object.entries(chapterRewards).forEach(([choice, reward]: [string, any]) => {
                        rewardsText += `• ${choice}: ${reward.experience} XP + ${reward.item_name}\n`;
                      });
                      rewardsText += '\n';
                    }
                    
                    // Backend saved data
                    if (savedRewards) {
                      rewardsText += '💾 Backend Saved Data:\n';
                      if (savedRewards.characterStats) {
                        rewardsText += `• Level: ${savedRewards.level}\n`;
                        rewardsText += `• Total Experience: ${savedRewards.totalExperience}/${savedRewards.experienceNeeded} (${Math.round(savedRewards.experienceProgress * 100)}%)\n`;
                        rewardsText += `• Wellness Average: ${savedRewards.wellnessAverage}/20\n`;
                        rewardsText += `• Equipped Tools: ${savedRewards.equippedToolsCount}\n`;
                        
                        if (savedRewards.wellnessStats && Object.keys(savedRewards.wellnessStats).length > 0) {
                          rewardsText += `• Wellness Stats:\n`;
                          Object.entries(savedRewards.wellnessStats).forEach(([stat, value]) => {
                            rewardsText += `  - ${stat}: ${value}/20\n`;
                          });
                        }
                      }
                      if (savedRewards.characterGear && savedRewards.characterGear.length > 0) {
                        rewardsText += `• Gear Owned: ${savedRewards.characterGear.length} items\n`;
                      }
                      if (savedRewards.storyProgress && savedRewards.storyProgress.length > 0) {
                        rewardsText += `• Stories Started: ${savedRewards.totalStoriesStarted}\n`;
                        rewardsText += `• Stories Completed: ${savedRewards.storiesCompleted}\n`;
                        
                        // Show current story progress if available
                        const currentStory = savedRewards.storyProgress.find((progress: any) => 
                          progress.story_title === grimoireTitle || progress.story === grimoire?.id
                        );
                        if (currentStory) {
                          rewardsText += `• Current Story Progress: ${currentStory.progress_percentage}%\n`;
                          rewardsText += `• Passages Visited: ${currentStory.passages_visited_count}\n`;
                          rewardsText += `• Choices Made: ${currentStory.choices_made_count}\n`;
                        }
                      }
                      if (savedRewards.characterCopingTools && savedRewards.characterCopingTools.length > 0) {
                        rewardsText += `• Coping Tools Owned: ${savedRewards.characterCopingTools.length} tools\n`;
                      }
                      rewardsText += '\n';
                    }
                    
                    // Current session totals
                    rewardsText += `📈 This Session:\n`;
                    rewardsText += `• Experience Gained: ${totalExperience}\n`;
                    rewardsText += `• Coping Tools Earned: ${earnedItems.join(', ') || 'None yet'}\n`;
                    rewardsText += `• Skills Learned: ${learnedSkills.join(', ') || 'None yet'}\n`;
                    
                    Alert.alert(
                      '📊 Rewards Status',
                      rewardsText,
                      [{ text: 'OK', style: 'default' }]
                    );
                  }}
                >
                  <Icon name="award" size={16} style={globalStyles.grimoireCloseIcon} />
                </TouchableOpacity>
                {/* Test button to check rewards */}
                <TouchableOpacity 
                  style={[globalStyles.grimoireCloseButton, { marginRight: 120 }]}
                  onPress={async () => {
                    try {
                      console.log('Testing reward system...');
                      
                      // Fetch latest character data
                      const latestRewards = await archiveService.getCharacterRewards('test');
                      console.log('Latest character rewards:', latestRewards);
                      
                      // Show current status
                      Alert.alert(
                        '🧪 Reward System Test',
                        `Character Level: ${latestRewards.level}\n` +
                        `Total Experience: ${latestRewards.totalExperience}\n` +
                        `Coping Tools Owned: ${latestRewards.characterCopingTools?.length || 0}\n` +
                        `Stories Completed: ${latestRewards.storiesCompleted}\n\n` +
                        `Current Session:\n` +
                        `• Experience Gained: ${Object.values(chapterRewards).reduce((sum: number, reward: any) => sum + (reward.experience || 0), 0)}\n` +
                        `• Items Earned: ${Object.values(chapterRewards).map((reward: any) => reward.item_name).filter(Boolean).join(', ') || 'None'}`,
                        [{ text: 'OK', style: 'default' }]
                      );
                    } catch (error) {
                      console.error('Test failed:', error);
                      Alert.alert('Test Failed', 'Could not fetch latest rewards data');
                    }
                  }}
                >
                  <Icon name="test-tube" size={16} style={globalStyles.grimoireCloseIcon} />
                </TouchableOpacity>
              </View>
              {/* Main content */}
              <View style={globalStyles.grimoireMainContent}>
                {/* Current atmosphere */}
                {debugProcessedCurrent?.atmosphere && (
                  <View style={globalStyles.grimoireCurrentAtmosphere}>
                    <Icon name="eye" size={12} color={theme.statusInfo} />
                    <Text style={globalStyles.grimoireAtmosphereText}>
                      ✦ {debugProcessedCurrent.atmosphere} ✦
                    </Text>
                  </View>
                )}
                {/* Passage text */}
                <TouchableOpacity 
                  style={globalStyles.grimoirePassageContainer}
                  onPress={handlePassageTap}
                  activeOpacity={debugProcessedCurrent?.passageType === 'narration' && (!debugProcessedCurrent?.choices || debugProcessedCurrent?.choices.length === 0) ? 0.8 : 1}
                  disabled={debugProcessedCurrent?.passageType !== 'narration' || (debugProcessedCurrent?.choices && debugProcessedCurrent?.choices.length > 0)}
                >
                  <Text style={globalStyles.grimoirePassageText}>
                    {debugProcessedCurrent?.text || 'NO TEXT FOUND'}
                  </Text>
                  
                  {/* Show tap-to-continue indicator for narration passages */}
                  {debugProcessedCurrent?.passageType === 'narration' && (!debugProcessedCurrent?.choices || debugProcessedCurrent?.choices.length === 0) && (
                    <View style={{ marginTop: 16, alignItems: 'center' }}>
                      <LinearGradient
                        colors={['rgba(168, 85, 247, 0.8)', 'rgba(139, 92, 246, 0.8)']}
                        style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}
                      >
                        <Icon name="chevron-down" size={16} color="#FCD34D" />
                        <Text style={{ color: '#FCD34D', marginLeft: 8, fontSize: 14, fontWeight: '600' }}>Tap to continue</Text>
                      </LinearGradient>
                    </View>
                  )}
                  
                  {/* Show loading indicator */}
                  {isLoadingPassage && (
                    <View style={{ marginTop: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                      <Icon name="loader" size={20} color="#A855F7" />
                      <Text style={{ color: '#A855F7', marginLeft: 8, fontSize: 14 }}>Loading passage...</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {/* Choices */}
                <View style={globalStyles.grimoireChoicesContainer}>
                  {(() => {
                    if (!debugProcessedCurrent?.choices) {
                      return null;
                    }
                    
                    if (debugProcessedCurrent.choices.length === 0) {
                      return null;
                    }
                    
                    const choiceElements = debugProcessedCurrent.choices.map((choice: any, idx: number) => {
                      return (
                        <TouchableOpacity
                          key={idx}
                          style={globalStyles.grimoireChoiceButton}
                          onPress={() => handleChoice(choice)}
                          activeOpacity={0.8}
                        >
                          <View style={globalStyles.grimoireChoiceRow}>
                            <Text style={globalStyles.grimoireChoiceIcon}>
                              {getChoiceIcon(choice)}
                            </Text>
                            <Text style={globalStyles.grimoireChoiceText}>
                              {choice.text}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    });
                    
                    return choiceElements;
                  })()}
                </View>
              </View>
            </View>
          </View>
        )}
        <StatGainNotification />
        <ArtifactUnlockNotification />
        <ChapterCompletionModal />
      </>
    </Modal>
  );
};

export default GrimoireScreen;