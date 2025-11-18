// Manages UI state like modals, tabs, and navigation

import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Story } from '../../types';

export interface UIContextType {
  activeTab: string;
  researchCondition: 'character' | 'survey' | 'unknown';
  isCodexVisible: boolean;
  isThoughtDefenderVisible: boolean;
  isMapVisible: boolean;
  isStoryVisible: boolean;
  isStoryCatalogVisible: boolean;
  currentMapRoomId: string;
  selectedStory: Story | null;
  memoryStories: Story[];

  setActiveTab: (tab: string) => void;
  setResearchCondition: (condition: 'character' | 'survey' | 'unknown') => void;
  setIsCodexVisible: (visible: boolean) => void;
  setIsThoughtDefenderVisible: (visible: boolean) => void;
  setIsMapVisible: (visible: boolean) => void;
  setIsStoryVisible: (visible: boolean) => void;
  setIsStoryCatalogVisible: (visible: boolean) => void;
  setCurrentMapRoomId: (roomId: string) => void;
  setSelectedStory: (story: Story | null) => void;
  setMemoryStories: (stories: Story[]) => void;
  openStory: (story: Story) => void;
  closeStory: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
};

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('entrance');
  const [researchCondition, setResearchCondition] = useState<'character' | 'survey' | 'unknown'>('unknown');
  const [isCodexVisible, setIsCodexVisible] = useState(false);
  const [isThoughtDefenderVisible, setIsThoughtDefenderVisible] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isStoryVisible, setIsStoryVisible] = useState(false);
  const [isStoryCatalogVisible, setIsStoryCatalogVisible] = useState(false);
  const [currentMapRoomId, setCurrentMapRoomId] = useState('');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [memoryStories, setMemoryStories] = useState<Story[]>([]);

  const openStory = (story: Story) => {
    setSelectedStory(story);
    setIsStoryVisible(true);
  };

  const closeStory = () => {
    setIsStoryVisible(false);
    setSelectedStory(null);
  };

  const value: UIContextType = {
    activeTab,
    researchCondition,
    isCodexVisible,
    isThoughtDefenderVisible,
    isMapVisible,
    isStoryVisible,
    isStoryCatalogVisible,
    currentMapRoomId,
    selectedStory,
    memoryStories,
    setActiveTab,
    setResearchCondition,
    setIsCodexVisible,
    setIsThoughtDefenderVisible,
    setIsMapVisible,
    setIsStoryVisible,
    setIsStoryCatalogVisible,
    setCurrentMapRoomId,
    setSelectedStory,
    setMemoryStories,
    openStory,
    closeStory,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};