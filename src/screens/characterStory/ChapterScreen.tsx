import {
  BlurView,
  createGlobalStyles,
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
  View
} from '../../imports';

// Import useTheme directly to avoid circular dependency issues
import { useTheme } from '../../context/ThemeContext';
import { archiveService, ChapterSummary } from '../../services/archiveService';

const { width, height } = Dimensions.get('window');

type ChapterScreenProps = {
  visible: boolean;
  onClose: () => void;
  storyId: string;
  storyTitle: string;
  onChapterSelect: (chapterId: number) => void;
};

const ChapterScreen = ({ visible, onClose, storyId, storyTitle, onChapterSelect }: ChapterScreenProps) => {
  const { theme } = useTheme();
  const globalStyles = createGlobalStyles(theme);
  
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chapters when modal becomes visible
  useEffect(() => {
    const loadChapters = async () => {
      if (!visible || !storyId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const backendChapters = await archiveService.getChapters(storyId);
        
        if (backendChapters && backendChapters.length > 0) {
          setChapters(backendChapters);
        } else {
          setChapters([]);
        }
      } catch (error) {
        setError('Failed to load chapters from the Archive');
        setChapters([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChapters();
  }, [visible, storyId]);

  const handleChapterSelect = (chapter: ChapterSummary) => {
    onChapterSelect(chapter.id);
    onClose();
  };

  const ChapterCard = ({ chapter }: { chapter: ChapterSummary }) => (
    <TouchableOpacity
      style={globalStyles.grimoireCard}
      onPress={() => handleChapterSelect(chapter)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(30, 41, 59, 0.95)', 'rgba(51, 65, 85, 0.8)', 'rgba(30, 41, 59, 0.95)']}
        style={globalStyles.grimoireCardGradient}
      >
        <BlurView intensity={10} style={globalStyles.grimoireCardBlur}>
          {/* Chapter Number Badge */}
          <View style={globalStyles.grimoireRarityBadge}>
            <LinearGradient
              colors={['#A855F7', '#7C3AED']}
              style={globalStyles.grimoireRarityBadgeGradient}
            >
              <Text style={globalStyles.grimoireRarityBadgeText}>Chapter {chapter.chapterNumber}</Text>
            </LinearGradient>
          </View>

          {/* Header */}
          <View style={globalStyles.grimoireCardHeader}>
            <View style={globalStyles.grimoireTitleSection}>
              <Text style={[globalStyles.grimoireCardTitle, { color: '#A855F7' }]}>{chapter.title || 'Untitled Chapter'}</Text>
              {chapter.isStartingChapter && (
                <View style={globalStyles.grimoireRarityBadge}>
                  <LinearGradient
                    colors={['#10B981', '#34D399']}
                    style={globalStyles.grimoireRarityBadgeGradient}
                  >
                    <Text style={globalStyles.grimoireRarityBadgeText}>Starting Point</Text>
                  </LinearGradient>
                </View>
              )}
            </View>
          </View>

          {/* Action Button */}
          <View style={globalStyles.grimoireActionButton}>
            <LinearGradient
              colors={['#7C3AED', '#A855F7']}
              style={globalStyles.grimoireActionButtonGradient}
            >
              <Icon name="book-open" size={14} color="#E0E7FF" />
              <Text style={globalStyles.grimoireActionButtonText}>
                Begin Chapter
              </Text>
            </LinearGradient>
          </View>
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
            Loading Chapters...
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
                <View style={[globalStyles.grimoireModalHeader, { borderBottomColor: '#374151' }]}>
                  <View style={globalStyles.grimoireHeaderContent}>
                    <Icon name="book" size={24} color="#A855F7" />
                    <Text style={[globalStyles.grimoireModalTitle, { color: '#A855F7' }]}>Select Chapter</Text>
                    <TouchableOpacity style={globalStyles.grimoireCloseButton} onPress={onClose}>
                      <LinearGradient
                        colors={['rgba(239, 68, 68, 0.8)', 'rgba(220, 38, 38, 0.8)']}
                        style={globalStyles.grimoireCloseButtonGradient}
                      >
                        <Icon name="x" size={18} color="#FECACA" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                  <Text style={[globalStyles.grimoireModalSubtitle, { color: '#9CA3AF' }]}>
                    {storyTitle}
                  </Text>
                  <Text style={[globalStyles.grimoireModalSubtitle, { color: '#9CA3AF', fontSize: 14 }]}>
                    Choose which chapter to begin your journey
                  </Text>
                </View>

                {/* Chapters Grid */}
                <ScrollView 
                  style={globalStyles.grimoireScrollView}
                  contentContainerStyle={globalStyles.grimoireGrid}
                  showsVerticalScrollIndicator={false}
                >
                  {chapters.length > 0 ? (
                    chapters.map(chapter => (
                      <ChapterCard key={chapter.id} chapter={chapter} />
                    ))
                  ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                      <Icon name="book" size={40} color="#A855F7" style={{ marginBottom: 16 }} />
                      <Text style={{ color: '#9CA3AF', fontSize: 18, textAlign: 'center' }}>
                        No Chapters Available
                      </Text>
                      <Text style={{ color: '#6B7280', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
                        This story may not have chapters yet.
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

export default ChapterScreen; 