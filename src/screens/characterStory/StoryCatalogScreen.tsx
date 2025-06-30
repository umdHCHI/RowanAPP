import {
  BlurView,
  createGlobalStyles,
  darkTheme,
  Dimensions,
  Icon,
  LinearGradient,
  Modal,
  React,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useEffect,
  useState,
  View,
} from '../../imports';

// Import archive service for backend operations
import { archiveService } from '../../services/archiveService';
// Import test function
// Import ChapterScreen for chapter selection - temporarily disabled
// import ChapterScreen from './ChapterScreen';

const { width } = Dimensions.get('window');

export type Grimoire = {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: string;
  timeToComplete: string;
  exploration: number;
  revelations: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  skillFocus: string[];
  atmosphere: string;
  statBoosts: string[];
  unlockLevel: number;
  isLocked?: boolean;
  passages?: any[];
  image?: string;
};

type GrimoireCatalogModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectGrimoire: (grimoire: Grimoire) => void;
};

const GrimoireCatalogModal = ({ visible, onClose, onSelectGrimoire }: GrimoireCatalogModalProps) => {
  const [grimoires, setGrimoires] = useState<Grimoire[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const globalStyles = createGlobalStyles(darkTheme);

  // Load grimoires from backend on mount
  useEffect(() => {
    const loadGrimoires = async () => {
      if (!visible) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Loading grimoires from backend...');
        const backendGrimoires = await archiveService.getAvailableStories();
        console.log('Backend grimoires response:', backendGrimoires);
        
        if (backendGrimoires && backendGrimoires.length > 0) {
          console.log('Setting grimoires:', backendGrimoires);
          setGrimoires(backendGrimoires);
        } else {
          console.log('No grimoires returned from backend');
          setGrimoires([]);
        }
      } catch (error) {
        console.error('Failed to load grimoires from the Archive:', error);
        setError('Failed to load grimoires from the Archive');
        setGrimoires([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadGrimoires();
  }, [visible]);

  const getRarityColors = (rarity: string): readonly [string, string] => {
    switch (rarity) {
      case 'Legendary': return ['#F97316', '#FCD34D'];
      case 'Epic': return ['#A855F7', '#F472B6'];
      case 'Rare': return ['#3B82F6', '#06B6D4'];
      default: return ['#6B7280', '#9CA3AF'];
    }
  };

  const getRarityGlow = (rarity: string): string => {
    switch (rarity) {
      case 'Legendary': return 'rgba(249, 115, 22, 0.3)';
      case 'Epic': return 'rgba(168, 85, 247, 0.3)';
      case 'Rare': return 'rgba(59, 130, 246, 0.3)';
      default: return 'rgba(107, 114, 128, 0.2)';
    }
  };

  const GrimoireCard = ({ grimoire }: { grimoire: Grimoire }) => (
    <TouchableOpacity
      style={[globalStyles.grimoireCard, { opacity: grimoire.isLocked ? 0.6 : 1 }]}
      onPress={() => !grimoire.isLocked && onSelectGrimoire(grimoire)}
      activeOpacity={grimoire.isLocked ? 1 : 0.8}
      disabled={grimoire.isLocked}
    >
      <LinearGradient
        colors={['rgba(30, 41, 59, 0.95)', 'rgba(51, 65, 85, 0.8)', 'rgba(30, 41, 59, 0.95)']}
        style={globalStyles.grimoireCardGradient}
      >
        <BlurView intensity={10} style={globalStyles.grimoireCardBlur}>
          {/* Rarity Border */}
          <LinearGradient
            colors={getRarityColors(grimoire.rarity)}
            style={globalStyles.grimoireRarityBorder}
          />
          
          {/* Lock Overlay */}
          {grimoire.isLocked && (
            <View style={globalStyles.grimoireLockOverlay}>
              <LinearGradient
                colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.6)']}
                style={globalStyles.grimoireLockGradient}
              >
                <Icon name="lock" size={24} color="#A855F7" />
                <Text style={[globalStyles.grimoireLockText, { color: '#A855F7' }]}>Level {grimoire.unlockLevel} Required</Text>
              </LinearGradient>
            </View>
          )}

          {/* Header */}
          <View style={globalStyles.grimoireCardHeader}>
            <View style={globalStyles.grimoireTitleSection}>
              <Text style={[globalStyles.grimoireCardTitle, { color: '#A855F7' }]}>{grimoire.title || 'Untitled Grimoire'}</Text>
              <Text style={[globalStyles.grimoireCardCategory, { color: '#9CA3AF' }]}>{grimoire.category || 'Unknown Category'}</Text>
            </View>
            
            <View style={globalStyles.grimoireRarityBadge}>
              <LinearGradient
                colors={getRarityColors(grimoire.rarity)}
                style={globalStyles.grimoireRarityBadgeGradient}
              >
                <Text style={globalStyles.grimoireRarityBadgeText}>{grimoire.rarity}</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Progress Indicator */}
          {(grimoire.exploration || 0) > 0 && (
            <View style={globalStyles.grimoireProgressSection}>
              <View style={globalStyles.grimoireProgressHeader}>
                <Icon name="compass" size={12} color="#06B6D4" />
                <Text style={[globalStyles.grimoireProgressLabel, { color: '#06B6D4' }]}>Exploration: {grimoire.exploration || 0}%</Text>
              </View>
              <View style={globalStyles.grimoireProgressBar}>
                <LinearGradient
                  colors={['#06B6D4', '#A855F7']}
                  style={[globalStyles.grimoireProgressFill, { width: `${grimoire.exploration || 0}%` }]}
                />
              </View>
            </View>
          )}

          {/* Description */}
          <Text style={[globalStyles.grimoireDescription, { color: '#9CA3AF' }]}>{grimoire.description || 'No description available'}</Text>
          
          {/* Atmosphere */}
          <View style={globalStyles.grimoireAtmosphereContainer}>
            <Icon name="eye" size={10} color="#06B6D4" />
            <Text style={[globalStyles.grimoireAtmosphereText, { color: '#06B6D4' }]}>✦ {grimoire.atmosphere || 'Mysterious atmosphere'} ✦</Text>
          </View>

          {/* Skill Focus Tags */}
          <View style={globalStyles.grimoireSkillFocusContainer}>
            <Text style={[globalStyles.grimoireSkillFocusLabel, { color: '#9CA3AF' }]}>Coping Skills:</Text>
            <View style={globalStyles.grimoireSkillTags}>
              {(grimoire.skillFocus || []).slice(0, 2).map((skill, index) => (
                <View key={index} style={globalStyles.grimoireSkillTag}>
                  <Text style={globalStyles.grimoireSkillTagText}>{skill}</Text>
                </View>
              ))}
              {(grimoire.skillFocus || []).length > 2 && (
                <View style={globalStyles.grimoireSkillTag}>
                  <Text style={globalStyles.grimoireSkillTagText}>+{(grimoire.skillFocus || []).length - 2}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Stat Boosts */}
          <View style={globalStyles.grimoireStatBoostsContainer}>
            <Text style={[globalStyles.grimoireStatBoostsLabel, { color: '#9CA3AF' }]}>Strengthens:</Text>
            <View style={globalStyles.grimoireStatBoostTags}>
              {(grimoire.statBoosts || []).map((stat, index) => (
                <View key={index} style={globalStyles.grimoireStatBoostTag}>
                  <Icon name="trending-up" size={8} color="#10B981" />
                  <Text style={[globalStyles.grimoireStatBoostText, { color: '#10B981' }]}>{stat}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Footer Info */}
          <View style={globalStyles.grimoireFooter}>
            <View style={globalStyles.grimoireFooterStat}>
              <Icon name="clock" size={12} color="#FB923C" />
              <Text style={[globalStyles.grimoireFooterStatText, { color: '#9CA3AF' }]}>{grimoire.timeToComplete || 'Unknown time'}</Text>
            </View>
            <View style={globalStyles.grimoireFooterStat}>
              <Icon name="key" size={12} color="#A855F7" />
              <Text style={[globalStyles.grimoireFooterStatText, { color: '#9CA3AF' }]}>{grimoire.revelations || 0} revelations</Text>
            </View>
            <View style={globalStyles.grimoireFooterStat}>
              <Icon name="zap" size={12} color="#A855F7" />
              <Text style={[globalStyles.grimoireFooterStatText, { color: '#9CA3AF' }]}>{grimoire.difficulty || 'Unknown'}</Text>
            </View>
          </View>

          {/* Action Button */}
          {!grimoire.isLocked && (
            <View style={globalStyles.grimoireActionButton}>
              <LinearGradient
                colors={['#7C3AED', '#A855F7']}
                style={globalStyles.grimoireActionButtonGradient}
              >
                <Icon name="book-open" size={14} color="#E0E7FF" />
                <Text style={globalStyles.grimoireActionButtonText}>
                  {(grimoire.exploration || 0) > 0 ? 'Continue Study' : 'Begin Reading'}
                </Text>
              </LinearGradient>
            </View>
          )}
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Loading state
  if (isLoading) {
    return (
      <Modal visible={visible} transparent onRequestClose={onClose}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <Icon name="loader" size={40} color="#A855F7" style={{ marginBottom: 16 }} />
          <Text style={{ color: 'white', fontSize: 18, margin: 20 }}>
            Loading Grimoires from the Archive...
          </Text>
        </View>
      </Modal>
    );
  }

  // Error state
  if (error) {
    return (
      <Modal visible={visible} transparent onRequestClose={onClose}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <Icon name="alert-circle" size={40} color="#EF4444" style={{ marginBottom: 16 }} />
          <Text style={{ color: 'white', fontSize: 18, margin: 20, textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity onPress={onClose} style={{ padding: 20, backgroundColor: '#333', borderRadius: 8, marginTop: 20 }}>
            <Text style={{ color: 'white' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <>
        <View style={globalStyles.grimoireModalOverlay}>
          <LinearGradient
            colors={['rgba(30, 41, 59, 0.95)', 'rgba(51, 65, 85, 0.8)', 'rgba(30, 41, 59, 0.95)']}
            style={StyleSheet.absoluteFillObject}
          />
          
          <View style={globalStyles.grimoireModalContent}>
            <LinearGradient
              colors={['rgba(30, 41, 59, 0.95)', 'rgba(51, 65, 85, 0.8)', 'rgba(30, 41, 59, 0.95)']}
              style={[globalStyles.grimoireModalGradient, { borderColor: '#374151' }]}
            >
              <BlurView intensity={20} style={globalStyles.grimoireModalBlur}>
                
                {/* Header */}
                <View style={globalStyles.grimoireModalHeader}>
                  <View style={globalStyles.grimoireHeaderContent}>
                    <Icon name="book" size={24} color="#A855F7" />
                    <Text style={[globalStyles.grimoireModalTitle, { color: '#A855F7' }]}>Archive of Grimoires</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity 
                        style={[globalStyles.grimoireCloseButton, { marginRight: 8 }]} 
                        onPress={() => runComprehensiveTest()}
                      >
                        <LinearGradient
                          colors={['rgba(59, 130, 246, 0.8)', 'rgba(37, 99, 235, 0.8)']}
                          style={globalStyles.grimoireCloseButtonGradient}
                        >
                          <Text style={{ color: '#E0E7FF', fontSize: 12 }}>Test</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      <TouchableOpacity style={globalStyles.grimoireCloseButton} onPress={onClose}>
                        <LinearGradient
                          colors={['rgba(239, 68, 68, 0.8)', 'rgba(220, 38, 38, 0.8)']}
                          style={globalStyles.grimoireCloseButtonGradient}
                        >
                          <Icon name="x" size={18} color="#FECACA" />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={[globalStyles.grimoireModalSubtitle, { color: '#9CA3AF' }]}>
                    Ancient grimoires of wisdom await your study. Each grimoire contains powerful coping techniques disguised as mystical knowledge.
                  </Text>
                </View>

                {/* Grimoire Grid */}
                <ScrollView 
                  style={globalStyles.grimoireScrollView}
                  contentContainerStyle={globalStyles.grimoireGrid}
                  showsVerticalScrollIndicator={false}
                >
                  {grimoires.length > 0 ? (
                    grimoires.map(grimoire => (
                      <GrimoireCard key={grimoire.id} grimoire={grimoire} />
                    ))
                  ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                      <Icon name="book" size={40} color="#A855F7" style={{ marginBottom: 16 }} />
                      <Text style={{ color: '#9CA3AF', fontSize: 18, textAlign: 'center' }}>
                        No Grimoires Available
                      </Text>
                      <Text style={{ color: '#6B7280', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
                        The Archive is currently empty. Check back later for new wisdom to discover.
                      </Text>
                    </View>
                  )}
                </ScrollView>
                
              </BlurView>
            </LinearGradient>
          </View>
        </View>
      </>
    </Modal>
  );
};

// Add a comprehensive test function
const runComprehensiveTest = async () => {
  console.log('=== RUNNING COMPREHENSIVE STORY TEST ===');
  
  try {
    // Test 1: Get story catalog
    console.log('1. Testing story catalog...');
    const catalog = await archiveService.getAvailableStories();
    console.log('Story catalog result:', catalog);
    console.log('Catalog length:', catalog?.length);
    
    if (catalog && catalog.length > 0) {
      const firstStory = catalog[0];
      console.log('First story:', firstStory);
      
      // Test 2: Get chapters for first story
      console.log('2. Testing chapters for story:', firstStory.id);
      const chapters = await archiveService.getChapters(firstStory.id);
      console.log('Chapters result:', chapters);
      
      if (chapters && chapters.length > 0) {
        const firstChapter = chapters[0];
        console.log('First chapter:', firstChapter);
        
        // Test 3: Get story content from chapter
        console.log('3. Testing story content from chapter:', firstChapter.id);
        const storyContent = await archiveService.getStoryContentFromChapter(firstStory.id, firstChapter.id);
        console.log('Story content result:', storyContent);
        console.log('Story content passages:', storyContent?.passages);
        console.log('Story content passages length:', storyContent?.passages?.length);
        
        if (storyContent && storyContent.passages && storyContent.passages.length > 0) {
          console.log('✅ SUCCESS: Story content loaded with passages');
          console.log('First passage:', storyContent.passages[0]);
        } else {
          console.log('❌ FAILED: No passages in story content');
        }
      } else {
        console.log('❌ FAILED: No chapters found');
      }
    } else {
      console.log('❌ FAILED: No stories in catalog');
    }
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
  }
  
  console.log('=== END COMPREHENSIVE TEST ===');
};

export default GrimoireCatalogModal;