// Hub-specific types

export type CardStatus = "locked" | "available" | "completed";

export interface StoryCard {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  tagline: string;
  storyId: number;
  status: CardStatus;
  /** True when this is the Prologue (story 1, from backend progress/story). */
  isPrologue?: boolean;
  /** True when user has started but not completed (enables "Continue this Book"). */
  inProgress?: boolean;
  hasResources: boolean;
  imageUrl?: string | null; // Backend image URL
  storyThemes?: string[];
}

export interface ContentWarningModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content?: string;
  storyThemes?: string[];
}

export interface HubButtonsProps {
  card: StoryCard;
  onPrimaryPress: () => void;
}

export interface HubPageProps {
  card: StoryCard;
  onResourcePress: () => void;
  carouselHeight: number;
}

export interface HubPaginationProps {
  cards: StoryCard[];
  activeIndex: number;
  onDotPress: (index: number) => void;
}

export interface MenuOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export interface MenuItem {
  label: string;
  route?: string;
  action?: () => void;
}

export interface ProgressIndicatorProps {
  card: StoryCard;
  showBottomLine?: boolean;
}

export interface StoryCardProps {
  card: StoryCard;
  height: number;
}
