import { Alert } from 'react-native';
import { CodexEntry } from '../../../types/journal';


export const transformCodexEntry = (entry: {
  type: string;
  passages: string;
  prompt: string;
  skillCategory: string;
  mapArea: string;
  difficulty: string;
}): Omit<CodexEntry, "id" | "created_at" | "updated_at"> => {
  return {
    prompt: parseInt(entry.prompt) || 1,
    prompt_id: entry.prompt || "legacy_prompt",
    prompt_text: entry.prompt || "Legacy prompt",
    entry_type: (entry.type as 'journal' | 'draw' | 'voice') || 'journal',
    content: entry.passages || "",
    content_preview: entry.passages ? entry.passages.substring(0, 100) : "",
    skill_category: entry.skillCategory || "general",
    difficulty: entry.difficulty || "medium",
    word_count: entry.passages ? entry.passages.split(' ').length : 0,
    duration_seconds: null,
    username: "user",
  };
};

/**
 * Shows success notification after codex entry submission
 * @param entryType - Type of entry (journal, draw, voice)
 * @param skillCategory - Category of skill/wellness area
 */
export const showCodexSuccessAlert = (
  entryType: 'journal' | 'draw' | 'voice',
  skillCategory: string,
  researchCondition?: 'character' | 'personality' // Optional for dual-path support
) => {
  const emoji = entryType === 'journal' ? '📝' : entryType === 'draw' ? '🎨' : '🎤';
  const action = entryType === 'journal' ? 'reflection' : entryType === 'draw' ? 'drawing' : 'recording';
  
  // Character path: RPG-themed notifications
  const characterTitle = `${emoji} ${action.charAt(0).toUpperCase() + action.slice(1)} Recorded`;
  const characterMessage = `Your ${skillCategory} ${action} has been added to the Archive.`;
  
  // Personality path: Wellness-themed notifications (could be customized differently)
  const personalityTitle = `${emoji} Insight Captured`;
  const personalityMessage = `Your ${skillCategory} ${action} has been saved for reflection.`;
  
  const title = researchCondition === 'personality' ? personalityTitle : characterTitle;
  const message = researchCondition === 'personality' ? personalityMessage : characterMessage;
  
  Alert.alert(title, message, [{ text: "Continue Exploring", style: "default" }]);
};

/**
 * Complete handler for codex entry submission
 * Combines transformation, archive update, and success notification
 */
export const handleCodexEntrySubmission = (
  entry: {
    type: string;
    passages: string;
    prompt: string;
    skillCategory: string;
    mapArea: string;
    difficulty: string;
  },
  archiveContext: any // MasterStateContext archive object
) => {
  // Transform form data to API format
  const transformedEntry = transformCodexEntry(entry);
  
  // Submit to archive (triggers API call in MasterStateContext)
  archiveContext.handleCodexEntry(transformedEntry);
  
  // Show success notification
  showCodexSuccessAlert(
    transformedEntry.entry_type,
    entry.skillCategory
  );
};