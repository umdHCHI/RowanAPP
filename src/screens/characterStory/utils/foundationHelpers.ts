import { uiIcons } from "../../../assets/ui";

export const getFoundationIcon = (foundation: any) => {
  const foundationLabel = foundation.label?.toLowerCase() || '';

  // Map foundation labels to their corresponding icons
  if (foundationLabel.includes('awareness')) {
    return uiIcons.sectionIcons.awareness;
  } else if (foundationLabel.includes('resilience')) {
    return uiIcons.sectionIcons.resilience;
  } else if (foundationLabel.includes('connection')) {
    return uiIcons.sectionIcons.connection;
  } else if (foundationLabel.includes('balance')) {
    return uiIcons.sectionIcons.balance;
  } else if (foundationLabel.includes('exploration')) {
    return uiIcons.sectionIcons.exploration;
  } else if (foundationLabel.includes('courage')) {
    return uiIcons.sectionIcons.courage;
  } else if (foundationLabel.includes('fear')) {
    return uiIcons.sectionIcons.fear;
  } else {
    // Default fallback for unknown foundations
    return uiIcons.sectionIcons.greenslug;
  }
};

export const calculateOverallArchiveProgress = (stories: any[], archive: any) => {
  try {
    if (!stories || stories.length === 0) {
      const completedStories = Array.from(archive.completedStories || []).length;
      return {
        overallProgress: completedStories > 0 ? 100 : 0,
        totalStories: 0,
        storiesWithProgress: completedStories,
        averageProgress: completedStories > 0 ? 100 : 0,
        completedStories
      };
    }

    let totalProgress = 0;
    let storiesWithProgress = 0;
    let completedStories = 0;

    stories.forEach(story => {
      if (story.exploration !== undefined && story.exploration > 0) {
        totalProgress += story.exploration;
        storiesWithProgress++;

        if (story.exploration >= 100) {
          completedStories++;
        }
      }
    });

    if (storiesWithProgress === 0) {
      const archiveCompleted = Array.from(archive.completedStories || []).length;
      if (archiveCompleted > 0) {
        return {
          overallProgress: 100,
          totalStories: stories.length,
          storiesWithProgress: archiveCompleted,
          averageProgress: 100,
          completedStories: archiveCompleted
        };
      }
    }

    const averageProgress = storiesWithProgress > 0 ? Math.round(totalProgress / storiesWithProgress) : 0;
    const overallProgress = stories.length > 0 ? Math.round(totalProgress / stories.length) : 0;

    return {
      overallProgress,
      totalStories: stories.length,
      storiesWithProgress,
      averageProgress,
      completedStories
    };
  } catch (error) {
    return {
      overallProgress: 0,
      totalStories: 0,
      storiesWithProgress: 0,
      averageProgress: 0,
      completedStories: 0
    };
  }
};