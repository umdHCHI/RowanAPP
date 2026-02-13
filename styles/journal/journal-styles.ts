import { StyleSheet, Dimensions } from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CANVAS_WIDTH = SCREEN_WIDTH - 80 
const CANVAS_HEIGHT = 300

export const drawingCanvasStyles = StyleSheet.create({
    container: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      padding: 16,
    },
    label: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: 12,
      textAlign: 'center',
    },
    colorRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 12,
    },
    colorDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
    },
    colorDotSpacing: {
      marginLeft: 12,
    },
    colorDotSelected: {
      borderWidth: 2,
      borderColor: '#E6C36A',
      transform: [{ scale: 1.1 }],
    },
    canvasWrapper: {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      marginBottom: 16,
    },
    canvasContainer: {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderRadius: 8,
      borderWidth: 2,
      borderColor: 'rgba(255, 215, 0, 0.3)',
      overflow: 'hidden',
      position: 'relative',
    },
    svg: {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 16,
      marginBottom: 12,
    },
    controlButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      marginHorizontal: 8,
    },
    controlButtonDisabled: {
      opacity: 0.5,
    },
    controlButtonText: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '500',
      color: '#FFD700',
    },
    controlButtonTextDisabled: {
      color: '#666',
    },
  })
  
export const journalAttributeStyles = StyleSheet.create({
    attributeChangesContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
      flexWrap: 'wrap',
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
  })


  export const journalEntryCardStyles = StyleSheet.create({
    card: {
      backgroundColor: '#1a1a2e',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      borderRadius: 24,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    cardContent: {
      padding: 20,
    },
    labelText: {
      fontFamily: 'FontTitle-White',
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 2,
      color: '#ffffff',
      marginBottom: 12,
    },
    input: {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 12,
      padding: 16,
      minHeight: 200,
      color: '#ffffff',
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'System',
      textAlignVertical: 'top',
    },
  })
  

  export const journalModeSelectorStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    modeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 28,
      backgroundColor: '#15111f',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    modeButtonActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      borderColor: 'rgba(255, 255, 255, 0.35)',
    },
    modeButtonText: {
      fontFamily: 'FontTitle-White',
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 1.5,
      color: 'rgba(255, 255, 255, 0.7)',
    },
    modeButtonTextActive: {
      color: '#ffffff',
      fontWeight: '600',
    },
  })
  
  export const journalPageStyles = StyleSheet.create({
    root: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    titleContainer: {
      alignItems: 'center',
      paddingVertical: 32,
      paddingHorizontal: 20,
    },
    title: {
      fontFamily: 'BeyondWonderland',
      fontSize: 42,
      textAlign: 'center',
      lineHeight: 48,
    },
    tabsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 16,
      gap: 24,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    tab: {
      paddingBottom: 12,
      position: 'relative',
    },
    tabActive: {
      // Active state handled by underline
    },
    tabText: {
      fontFamily: 'FontTitle-White',
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 2,
      color: 'rgba(255, 255, 255, 0.65)',
    },
    tabTextActive: {
      color: '#ffffff',
      fontWeight: '600',
    },
    tabUnderline: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: '#ffffff',
    },
    responseArea: {
      paddingHorizontal: 16,
      marginTop: 24,
      paddingBottom: 12,
    },
    drawingContainer: {
      marginBottom: 24,
      position: 'relative',
    },
    voiceContainer: {
      marginBottom: 16,
    },
    savedContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    savedText: {
      fontFamily: 'FontTitle-White',
      fontSize: 16,
      letterSpacing: 1.5,
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: 8,
    },
    congratsText: {
      fontFamily: 'FontTitle-White',
      fontSize: 14,
      letterSpacing: 1,
      color: 'rgba(255, 255, 255, 0.85)',
      textAlign: 'center',
      marginTop: 8,
    },
    bottomButtonText: {
      fontFamily: 'FontTitle-White',
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 2,
      color: '#ffffff',
    },
  })
  
  
export const journalPromptSectionStyles = StyleSheet.create({
    cardContainer: {
      width: '100%',
      paddingHorizontal: 20,
      marginBottom: 32,
    },
    card: {
      backgroundColor: '#1a1a2e',
      borderRadius: 24,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      padding: 24,
    },
    cardCategory: {
      fontFamily: 'System',
      fontSize: 12,
      fontWeight: '500',
      letterSpacing: 3,
      color: '#ffffffcc',
      marginBottom: 16,
      textAlign: 'center',
    },
    promptTextContainer: {
      minHeight: 80,
      justifyContent: 'center',
      marginBottom: 16,
    },
    awardsContainer: {
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    awardsText: {
      fontFamily: 'FontTitle-White',
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 2,
      color: '#ffffff',
    },
    promptText: {
      fontFamily: 'VT323-Regular',
      fontSize: 22,
      textAlign: 'center',
      color: '#ffffff',
      lineHeight: 26,
      letterSpacing: 0.6,
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: 12,
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.7)',
    },
    errorContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorText: {
      textAlign: 'center',
      color: '#F44336',
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.7)',
    },
  })
  

  export const journalSaveButtonStyles = StyleSheet.create({
    loadingContainer: {
      width: 200,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    saveButton: {
      width: 200,
      height: 50,
      borderRadius: 28,
      backgroundColor: '#15111f',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      fontFamily: 'FontTitle-White',
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 2,
      color: '#ffffff',
    },
  })



  
export const journalVoiceRecorderStyles = StyleSheet.create({
    container: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      padding: 16,
      minHeight: 200,
      justifyContent: 'center',
    },
    recorderContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    recordButton: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(255, 215, 0, 0.2)',
      borderWidth: 2,
      borderColor: '#FFD700',
    },
    recordButtonText: {
      marginTop: 8,
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '500',
      color: '#FFD700',
    },
    recordingContainer: {
      alignItems: 'center',
      gap: 16,
    },
    recordingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    recordingDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#F44336',
    },
    recordingText: {
      fontFamily: 'System',
      fontSize: 18,
      fontWeight: '600',
      color: '#FFD700',
    },
    stopButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      backgroundColor: '#F44336',
    },
    stopButtonText: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
    },
    recordedContainer: {
      alignItems: 'center',
      gap: 12,
    },
    recordedText: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '500',
      color: '#4CAF50',
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    deleteButtonText: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '500',
      color: '#FFD700',
    },
  })
  
  
  

  
  