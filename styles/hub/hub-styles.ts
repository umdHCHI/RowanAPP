import { StyleSheet } from "react-native";

export const hubStyles = StyleSheet.create({
  root: {
    position: "relative",
    flex: 1,
  },
  carouselContainer: {
    flex: 1,
    zIndex: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  bottomContainer: {
    zIndex: 1,
    paddingHorizontal: 4,
  },
});

export const contentWarningModalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
  },
  backdropPressable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    elevation: 0,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    width: "100%",
    zIndex: 1,
    elevation: 1,
  },
  panel: {
    width: "100%",
    maxWidth: 500,
    borderRadius: 16,
    backgroundColor: "rgba(15, 23, 42, 0.98)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.3)",
    overflow: "hidden",
  },
  contentContainer: {
    alignItems: "stretch",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    alignItems: "center",
    justifyContent: "center",
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
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
  },
});

export const hubButtonsStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingBottom: 16,
    gap: 6,
  },
});

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
    alignItems: "center",
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 4,
  },
  resourcesBlock: {
    marginTop: 16,
    width: "100%",
  },
  scrollCue: {
    marginTop: 12,
  },
});

export const resourceCardStyles = StyleSheet.create({
  wrapper: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#161622",
  },
  container: {
    padding: 16,
    minHeight: 160,
    justifyContent: "space-between",
  },

  labelContainer: {
    flex: 1,
    gap: 2,
  },

  pressable: {
    flex: 1,
  },
  imageBackground: {
    width: "100%",
    height: "100%",
  },
  imageStyle: {
    opacity: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export const hubPaginationStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 0,
    gap: 10,
    paddingBottom: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  dotActive: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
  },
});

export const hubMenuOverlayStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    width: "75%",
  },
  menuContainer: {
    flex: 1,

    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  menuTitle: {
    fontFamily: "BeyondWonderland",
    fontSize: 32,
    color: "#ffffff",
    textAlign: "center",
    flex: 1,
  },
  settingsButton: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 16,
  },
  menuItemsScrollView: {
    flex: 1,
  },
  menuItemsContainer: {
    gap: 8,
    paddingBottom: 8,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  menuItemText: {
    fontFamily: "BeyondWonderland",
    fontSize: 20,
    color: "#ffffff",
    textAlign: "left",
  },
  socialContainer: {
    gap: 24,
    marginTop: "auto",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  socialIconContainer: {
    alignItems: "center",
    gap: 8,
  },
  socialIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  socialIconLabel: {
    fontFamily: "BeyondWonderland",
    fontSize: 12,
    color: "#ffffff",
    textAlign: "center",
  },
});

export const progressIndicatorStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 0,
  },
  line: {
    width: 3,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.27)",
  },
  arrowWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
  },
});

export const bugReportModalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
  },
  backdropPressable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    elevation: 0,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    width: "100%",
    zIndex: 1,
    elevation: 1,
  },
  panel: {
    width: "100%",
    maxWidth: 500,
    borderRadius: 16,
    backgroundColor: "rgba(15, 23, 42, 0.98)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.3)",
    overflow: "hidden",
  },
  contentContainer: {
    alignItems: "stretch",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  headerTitle: {
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  descriptionText: {
    marginTop: 4,
    marginBottom: 16,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.3)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#f8fafc",
    fontSize: 14,
    marginBottom: 12,
  },
  inputMultiline: {
    minHeight: 120,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  buttonContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
    flexDirection: "row",
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
});

export const storyCardStyles = StyleSheet.create({
  wrapper: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
  },
  container: {
    flex: 1,
    backgroundColor: "#161622",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  image: { width: "100%", height: "100%" },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  cardContent: {
    flex: 1,
    padding: 18,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerLabel: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
    maxWidth: "80%",
  },
  bookIcon: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  titleSection: { gap: 6 },
  bottomSection: { gap: 12 },
});
