import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StoryCatalog, StoryPlayer } from '../components/StoryPlayer';

export const StoryScreen: React.FC = () => {
    const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);

    const handleSelectStory = (storyId: number) => {
        setSelectedStoryId(storyId);
    };

    const handleExitStory = () => {
        setSelectedStoryId(null);
    };

    return (
        <View style={styles.container}>
            {selectedStoryId ? (
                <StoryPlayer 
                    storyId={selectedStoryId} 
                    onExit={handleExitStory}
                />
            ) : (
                <StoryCatalog onSelectStory={handleSelectStory} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
});
