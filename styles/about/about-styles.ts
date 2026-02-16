import { StyleSheet, Dimensions, Platform } from "react-native";
import { colors } from "@/theme/design-tokens";

export const aboutStyles = StyleSheet.create({
  screen: {
    flex: 1,
    position: "relative",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 32,
  },
  content: {
    gap: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  creditsSection: {
    marginTop: 32,
    marginBottom: 24,
  },
  creditsSectionContainer: {
    borderRadius: 24,
    backgroundColor: colors.void.dark,
    minHeight: Dimensions.get("window").height * 0.55,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.archive.borderSubtle,
    ...Platform.select({
      ios: {
        shadowColor: colors.void.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  creditsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 12,
    paddingTop: 12,
  },
  creditsSubtitle: {
    marginBottom: 16,
  },
  creditsGrid: {
    gap: 16,
  },
  creditCard: {
    width: "100%",
  },
  creditValueContainer: {
    marginBottom: 8,
  },
  creditNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    gap: 8,
  },
  creditIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.archive.purple,
    ...Platform.select({
      ios: {
        shadowColor: colors.archive.purple,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  purpleIndicator: {
    backgroundColor: colors.archive.purple,
    shadowColor: colors.archive.purpleLight,
  },
  greenIndicator: {
    backgroundColor: colors.archive.teal,
    shadowColor: colors.archive.tealDark,
  },
  orangeIndicator: {
    backgroundColor: colors.archive.purpleLight,
    shadowColor: colors.archive.purple,
  },
  cyanIndicator: {
    backgroundColor: colors.archive.teal,
    shadowColor: colors.archive.tealDark,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.archive.backgroundDark,
    borderWidth: 1,
    borderColor: colors.archive.borderSubtle,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  developerList: {
    width: "100%",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    marginBottom: 8,
  },
  developerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    justifyContent: "center",
  },
});

export default aboutStyles;
