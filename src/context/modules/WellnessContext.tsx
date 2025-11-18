// Manages coping tools, journal prompts, and codex entries

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { apiService } from '../../services/apiService';
import { CodexEntry, CopingTool, HomeData, JournalPrompt } from '../../types';

export interface WellnessContextType {
  availableTools: CopingTool[];
  myTools: CopingTool[];
  equippedTools: CopingTool[];
  recentCodexEntries: CodexEntry[];
  homeData: HomeData | null;

  availablePrompts: JournalPrompt[];
  categoryPrompts: {
    journal: JournalPrompt | null;
    draw: JournalPrompt | null;
    voice: JournalPrompt | null;
  };

  // Tool methods
  loadAvailableTools: () => Promise<void>;
  loadMyTools: () => Promise<void>;
  acquireTool: (toolId: number) => Promise<void>;
  equipTool: (toolId: number) => Promise<void>;
  unequipTool: (toolId: number) => Promise<void>;
  useTool: (toolId: number, effectiveness?: number, notes?: string) => Promise<void>;

  // Codex entry methods
  loadRecentCodexEntries: () => Promise<void>;
  createCodexEntry: (entryData: {
    prompt: number;
    entry_type: 'journal' | 'draw' | 'voice';
    content: string;
  }) => Promise<void>;
  quickJournalEntry: (
    promptId: number,
    content: string,
    entryType: 'journal' | 'draw' | 'voice'
  ) => Promise<void>;

  // Journal prompt methods
  loadAvailablePrompts: () => Promise<void>;
  loadCategoryPrompts: (unlockedAreas: string[], completedStories: string[]) => Promise<void>;
  refreshPrompts: () => Promise<void>;
  markPromptInactive: (promptId: number) => Promise<void>;

  // Home data
  loadHomeData: () => Promise<void>;
  setHomeData: (data: HomeData | null) => void;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

export const useWellness = () => {
  const context = useContext(WellnessContext);
  if (!context) {
    throw new Error('useWellness must be used within WellnessProvider');
  }
  return context;
};

interface WellnessProviderProps {
  children: ReactNode;
  characterId: string | null;
  onError: (error: string) => void;
  completedStories: Set<string>;
}

export const WellnessProvider: React.FC<WellnessProviderProps> = ({
  children,
  characterId,
  onError,
  completedStories,
}) => {
  const [availableTools, setAvailableTools] = useState<CopingTool[]>([]);
  const [myTools, setMyTools] = useState<CopingTool[]>([]);
  const [equippedTools, setEquippedTools] = useState<CopingTool[]>([]);
  const [recentCodexEntries, setRecentCodexEntries] = useState<CodexEntry[]>([]);
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [availablePrompts, setAvailablePrompts] = useState<JournalPrompt[]>([]);
  const [categoryPrompts, setCategoryPrompts] = useState<{
    journal: JournalPrompt | null;
    draw: JournalPrompt | null;
    voice: JournalPrompt | null;
  }>({
    journal: null,
    draw: null,
    voice: null,
  });

  // ===== CRITICAL: Clear wellness state when character ID changes =====
  // This prevents data leakage between different user accounts
  useEffect(() => {
    if (!characterId) {
      // Character ID cleared (user logged out) - clear all wellness data
      console.log('🧹 [WellnessContext] Character ID cleared - resetting all wellness state');
      setAvailableTools([]);
      setMyTools([]);
      setEquippedTools([]);
      setRecentCodexEntries([]);
      setHomeData(null);
      setAvailablePrompts([]);
      setCategoryPrompts({ journal: null, draw: null, voice: null });
    }
  }, [characterId]);

  const loadAvailableTools = useCallback(async () => {
    try {
      const tools = await apiService.getAvailableCopingTools();
      setAvailableTools(tools);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Available tools endpoint not found - this is expected
      }
    }
  }, []);

  const loadMyTools = useCallback(async () => {
    try {
      const tools = await apiService.getMyTools();
      setMyTools(tools);

      try {
        const equipped = await apiService.getEquippedTools();
        setEquippedTools(equipped);
      } catch (equippedError: any) {
        setEquippedTools([]);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // My tools endpoint not found - this is expected
      }
    }
  }, []);

  const acquireTool = async (toolId: number) => {
    try {
      await apiService.acquireCopingTool(toolId);
      await loadMyTools();

      Alert.alert('🛠️ Tool Acquired!', 'You have acquired a new coping tool!', [
        { text: 'Excellent!', style: 'default' },
      ]);
    } catch (error: any) {
      onError('Failed to acquire tool: ' + (error?.message || 'Unknown error'));
    }
  };

  const equipTool = async (toolId: number) => {
    try {
      const characterTool = myTools.find((tool) => tool.id === toolId);

      if (characterTool) {
        await apiService.equipTool(toolId);
      } else {
        const baseTool = availableTools.find((tool) => tool.id === toolId);
        if (baseTool) {
          const characterToolInstance = myTools.find(
            (tool) => tool.tool_id === baseTool.tool_id || tool.name === baseTool.name
          );

          if (characterToolInstance) {
            await apiService.equipTool(characterToolInstance.id);
          } else {
            throw new Error(`Tool not found in your collection. You may need to acquire it first.`);
          }
        } else {
          throw new Error(`Tool with ID ${toolId} not found.`);
        }
      }

      await loadMyTools();
    } catch (error: any) {
      onError('Failed to equip tool: ' + (error?.message || 'Unknown error'));
    }
  };

  const unequipTool = async (toolId: number) => {
    try {
      const characterTool = myTools.find((tool) => tool.id === toolId);

      if (characterTool) {
        await apiService.unequipTool(toolId);
      } else {
        const baseTool = availableTools.find((tool) => tool.id === toolId);
        if (baseTool) {
          const characterToolInstance = myTools.find(
            (tool) => tool.tool_id === baseTool.tool_id || tool.name === baseTool.name
          );

          if (characterToolInstance) {
            await apiService.unequipTool(characterToolInstance.id);
          } else {
            throw new Error(`Tool not found in your collection.`);
          }
        } else {
          throw new Error(`Tool with ID ${toolId} not found.`);
        }
      }

      await loadMyTools();
    } catch (error: any) {
      onError('Failed to unequip tool: ' + (error?.message || 'Unknown error'));
    }
  };

  const useTool = async (toolId: number, effectiveness?: number, notes?: string) => {
    try {
      const characterTool = myTools.find((tool) => tool.id === toolId);

      if (characterTool) {
        await apiService.useTool(toolId, effectiveness, notes);
      } else {
        const baseTool = availableTools.find((tool) => tool.id === toolId);
        if (baseTool) {
          const characterToolInstance = myTools.find(
            (tool) => tool.tool_id === baseTool.tool_id || tool.name === baseTool.name
          );

          if (characterToolInstance) {
            await apiService.useTool(characterToolInstance.id, effectiveness, notes);
          } else {
            throw new Error(`Tool not found in your collection. You may need to acquire it first.`);
          }
        } else {
          throw new Error(`Tool with ID ${toolId} not found.`);
        }
      }

      await loadMyTools();

      Alert.alert('🌟 Tool Used!', 'Your tool usage has been recorded.', [
        { text: 'Great!', style: 'default' },
      ]);
    } catch (error: any) {
      onError('Failed to use tool: ' + (error?.message || 'Unknown error'));
    }
  };

  const createCodexEntry = async (entryData: {
    prompt: number;
    entry_type: 'journal' | 'draw' | 'voice';
    content: string;
  }) => {
    try {
      const uid = homeData?.userProfile?.user?.id ?? homeData?.userProfile?.id;
      if (!uid) {
        return;
      }

      const currentCharacterId = characterId || homeData?.userProfile?.id;

      await apiService.createCodexEntry(entryData, currentCharacterId);
      await apiService.markPromptAsInactive(entryData.prompt);

      await loadRecentCodexEntries();
      await loadCategoryPrompts([], Array.from(completedStories));
    } catch (error: any) {
      onError('Failed to create entry: ' + (error?.message || 'Unknown error'));
      throw error;
    }
  };

  const quickJournalEntry = async (
    promptId: number,
    content: string,
    entryType: 'journal' | 'draw' | 'voice'
  ) => {
    try {
      await createCodexEntry({
        prompt: promptId,
        entry_type: entryType,
        content: content,
      });

      Alert.alert('✨ Entry Saved!', 'Your journal entry has been captured.', [
        { text: 'Thank you!', style: 'default' },
      ]);
    } catch (error: any) {
      onError('Failed to save journal entry: ' + (error?.message || 'Unknown error'));
    }
  };

  const loadAvailablePrompts = useCallback(async () => {
    try {
      const prompts = await apiService.getJournalPrompts();
      setAvailablePrompts(prompts);
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 404) {
        // Endpoint not implemented yet
      }
      setAvailablePrompts([]);
    }
  }, []);

  const loadCategoryPrompts = useCallback(async (areas?: string[], completed?: string[]) => {
    try {
      const prompts = await apiService.getPromptsByCategory(areas, completed);
      setCategoryPrompts(prompts);
    } catch {
      try {
        const fallbackPrompts = await apiService.getJournalPrompts();
        const fallbackResult = {
          journal: fallbackPrompts.find((p) => p.category === 'journal') || null,
          draw: fallbackPrompts.find((p) => p.category === 'draw') || null,
          voice: fallbackPrompts.find((p) => p.category === 'voice') || null,
        };
        setCategoryPrompts(fallbackResult);
      } catch {
        setCategoryPrompts({ journal: null, draw: null, voice: null });
      }
    }
  }, []);

  const refreshPrompts = useCallback(async () => {
    try {
      const unlockedAreas = Array.from(completedStories);
      const completedStoriesArray = Array.from(completedStories);

      await Promise.all([
        loadAvailablePrompts(),
        loadCategoryPrompts(unlockedAreas, completedStoriesArray),
      ]);
    } catch (error) {
      // Error refreshing prompts
    }
  }, [completedStories, loadAvailablePrompts, loadCategoryPrompts]);

  const markPromptInactive = useCallback(async (promptId: number) => {
    try {
      await apiService.markPromptAsInactive(promptId);
    } catch (error) {
      // Don't throw - this is not critical functionality
    }
  }, []);

  const loadRecentCodexEntries = useCallback(async () => {
    try {
      const entries = await apiService.getUserCodexEntries();
      setRecentCodexEntries(entries);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Endpoint not found
      }
      setRecentCodexEntries([]);
    }
  }, []);

  const loadHomeData = useCallback(async () => {
    try {
      const profile = await apiService.getProfile();

      const completionType = profile?.completion_type;
      const hasPersonalityProfile = profile?.personality_profile?.profile_summary?.dominant_trait;
      const isCharacterUser = completionType === 'character' && !hasPersonalityProfile;

      const characterToUse = profile?.character;

      const unifiedHomeData: HomeData = {
        userProfile: profile,
        character: characterToUse || undefined,
        primaryTrait: isCharacterUser
          ? undefined
          : ((profile?.profile?.primary_trait as any) ||
              (profile?.personality_profile?.profile_summary?.dominant_trait as any) ||
              undefined),
      };

      setHomeData(unifiedHomeData);
    } catch (error: any) {
      setHomeData(null);
    }
  }, []);

  const value: WellnessContextType = {
    availableTools,
    myTools,
    equippedTools,
    recentCodexEntries,
    homeData,
    availablePrompts,
    categoryPrompts,
    loadAvailableTools,
    loadMyTools,
    acquireTool,
    equipTool,
    unequipTool,
    useTool,
    loadRecentCodexEntries,
    createCodexEntry,
    quickJournalEntry,
    loadAvailablePrompts,
    loadCategoryPrompts,
    refreshPrompts,
    markPromptInactive,
    loadHomeData,
    setHomeData,
  };

  return <WellnessContext.Provider value={value}>{children}</WellnessContext.Provider>;
};