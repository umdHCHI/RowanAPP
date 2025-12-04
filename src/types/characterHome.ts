
import { Story } from './index';

export interface ArchiveHeaderProps {
  homeStyles: any;
  wellness: any;
  auth: any;
  character: any;
  startTutorial: () => void;
}

export interface PassagesTabProps {
  homeStyles: any;
  storyStyles: any;
  isLoadingStories: boolean;
  stories: any[];
  archive: any;
  handleOpenStory: (story: Story) => void;
}