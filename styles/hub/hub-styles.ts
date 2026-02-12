import { StyleSheet } from "react-native"


export const hubStyles = StyleSheet.create({
    root: {
      position: 'relative',
      flex: 1,
    },
    carouselContainer: {
      flex: 1,
      zIndex: 2,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: {
      flex: 1,
    },
    bottomContainer: {
      zIndex: 1,
      paddingHorizontal: 4,
    },
  })


  export const contentWarningModalStyles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'stretch',
    },
    backdropPressable: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalInner: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      width: '100%',
    },
    panel: {
      width: '100%',
      maxWidth: 500,
      borderRadius: 16,
      backgroundColor: 'rgba(15, 23, 42, 0.98)',
      borderWidth: 1,
      borderColor: 'rgba(148, 163, 184, 0.3)',
      overflow: 'hidden',
    },
    contentContainer: {
      alignItems: 'stretch',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 12,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 16,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(251, 191, 36, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    textContainer: {
      flex: 1,
      gap: 12,
    },
    scrollView: {
      maxHeight: 240,
      marginTop: 8,
    },
    scrollContent: {
      paddingBottom: 8,
    },
    buttonContainer: {
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.2)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: 16,
    },
  })
  
  export const hubButtonsStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingBottom: 16,
      gap: 6,
    },
  })
  
  
export const hubPageStyles = StyleSheet.create({
    page: {
      paddingHorizontal: 36,
      paddingTop: 4,
      paddingBottom: 0,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 12,
      alignItems: 'center',
    },
    cardContainer: {
      flex: 1,
      alignItems: 'center',
      paddingTop: 4,
    },
    resourcesBlock: {
      marginTop: 16,
      width: '100%',
    },
    scrollCue: {
      marginTop: 12,
    },
  })
  

  export const resourceCardStyles = StyleSheet.create({
    wrapper: {
      width: '100%',
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: '#161622',
    },
    container: {
      padding: 16,
      minHeight: 160,
      justifyContent: 'space-between',
    },


    labelContainer: {
      flex: 1,
      gap: 2,
    },

    pressable: {
      flex: 1,
    },
    imageBackground: {
      width: '100%',
      height: '100%',
    },
    imageStyle: {
      opacity: 1,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    content: {
      flex: 1,
      justifyContent: 'space-between',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  })
  
  