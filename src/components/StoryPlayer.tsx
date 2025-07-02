import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useStoryNavigation, useAvailableStories } from '../hooks/useStoryNavigation';

interface StoryPlayerProps {
    storyId?: number;
    onExit?: () => void;
}

export const StoryPlayer: React.FC<StoryPlayerProps> = ({ storyId, onExit }) => {
    const {
        currentStory,
        currentPassage,
        availableChoices,
        storyProgress,
        isLoading,
        error,
        loadStory,
        makeChoice,
        resetStory,
        startStory,
        clearError,
    } = useStoryNavigation();

    React.useEffect(() => {
        if (storyId) {
            loadStory(storyId);
        }
    }, [storyId, loadStory]);

    const handleChoice = async (choiceId: number) => {
        await makeChoice(choiceId);
    };

    const handleRestart = async () => {
        if (currentStory) {
            await resetStory(currentStory.id);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading story...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <TouchableOpacity style={styles.button} onPress={clearError}>
                    <Text style={styles.buttonText}>Try Again</Text>
                </TouchableOpacity>
                {onExit && (
                    <TouchableOpacity style={styles.button} onPress={onExit}>
                        <Text style={styles.buttonText}>Back to Stories</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    if (!currentStory || !currentPassage) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>No story loaded</Text>
                {onExit && (
                    <TouchableOpacity style={styles.button} onPress={onExit}>
                        <Text style={styles.buttonText}>Back to Stories</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    const isCompleted = storyProgress?.is_completed;

    return (
        <ScrollView style={styles.container}>
            {/* Story Header */}
            <View style={styles.header}>
                <Text style={styles.storyTitle}>{currentStory.title}</Text>
                {storyProgress && (
                    <Text style={styles.progressText}>
                        Passages Visited: {storyProgress.passages_visited.length}
                    </Text>
                )}
            </View>

            {/* Current Passage */}
            <View style={styles.passageContainer}>
                {currentPassage.speaker && (
                    <Text style={styles.speakerText}>
                        {/* You'd need to load NPC data to show speaker name */}
                        Speaker: {currentPassage.speaker}
                    </Text>
                )}
                
                <Text style={styles.passageType}>
                    {currentPassage.passage_type.charAt(0).toUpperCase() + 
                     currentPassage.passage_type.slice(1)}
                </Text>
                
                <Text style={styles.passageContent}>
                    {currentPassage.content}
                </Text>

                {currentPassage.mood && (
                    <Text style={styles.moodText}>
                        Mood: {currentPassage.mood}
                    </Text>
                )}
            </View>

            {/* Story Completion */}
            {isCompleted ? (
                <View style={styles.completionContainer}>
                    <Text style={styles.completionText}>
                        Story Completed! 
                        {storyProgress.completion_type && ` (${storyProgress.completion_type})`}
                    </Text>
                    
                    {currentStory.is_repeatable && (
                        <TouchableOpacity style={styles.button} onPress={handleRestart}>
                            <Text style={styles.buttonText}>Play Again</Text>
                        </TouchableOpacity>
                    )}
                    
                    {onExit && (
                        <TouchableOpacity style={styles.button} onPress={onExit}>
                            <Text style={styles.buttonText}>Back to Stories</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                /* Choices */
                <View style={styles.choicesContainer}>
                    <Text style={styles.choicesTitle}>What do you do?</Text>
                    
                    {availableChoices.map((choice) => (
                        <TouchableOpacity
                            key={choice.id}
                            style={[
                                styles.choiceButton,
                                choice.choice_type === 'skill_check' && styles.skillCheckChoice,
                                choice.choice_type === 'item_required' && styles.itemRequiredChoice,
                            ]}
                            onPress={() => handleChoice(choice.id)}
                        >
                            <Text style={styles.choiceText}>{choice.text}</Text>
                            {choice.choice_type !== 'normal' && (
                                <Text style={styles.choiceTypeText}>
                                    ({choice.choice_type.replace('_', ' ')})
                                </Text>
                            )}
                        </TouchableOpacity>
                    ))}

                    {availableChoices.length === 0 && (
                        <Text style={styles.noChoicesText}>
                            No choices available. This might be the end of this story branch.
                        </Text>
                    )}
                </View>
            )}

            {/* Story Controls */}
            <View style={styles.controlsContainer}>
                <TouchableOpacity style={styles.smallButton} onPress={handleRestart}>
                    <Text style={styles.smallButtonText}>Restart</Text>
                </TouchableOpacity>
                
                {onExit && (
                    <TouchableOpacity style={styles.smallButton} onPress={onExit}>
                        <Text style={styles.smallButtonText}>Exit</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
};

export const StoryCatalog: React.FC<{ onSelectStory: (storyId: number) => void }> = ({ 
    onSelectStory 
}) => {
    const { stories, completionStatus, isLoading, error, refresh } = useAvailableStories();

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading stories...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <TouchableOpacity style={styles.button} onPress={refresh}>
                    <Text style={styles.buttonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.catalogTitle}>Available Stories</Text>
            
            {stories.map((story) => {
                const status = completionStatus[story.id];
                const isCompleted = status?.isCompleted;
                const progressPercentage = status?.progressPercentage || 0;
                
                return (
                    <TouchableOpacity
                        key={story.id}
                        style={[
                            styles.storyCard,
                            isCompleted && styles.completedStoryCard
                        ]}
                        onPress={() => onSelectStory(story.id)}
                    >
                        <View style={styles.storyCardHeader}>
                            <Text style={styles.storyCardTitle}>{story.title}</Text>
                            <Text style={styles.storyCategory}>{story.category}</Text>
                        </View>
                        
                        <Text style={styles.storyDescription}>{story.description}</Text>
                        
                        <View style={styles.storyMeta}>
                            <Text style={styles.storyMetaText}>Min Level: {story.min_level}</Text>
                            
                            {isCompleted ? (
                                <Text style={styles.completedText}>
                                    ✓ Completed {status.completionType ? `(${status.completionType})` : ''}
                                </Text>
                            ) : progressPercentage > 0 ? (
                                <Text style={styles.progressText}>
                                    Progress: {progressPercentage}%
                                </Text>
                            ) : (
                                <Text style={styles.newText}>New</Text>
                            )}
                        </View>

                        {story.is_repeatable && (
                            <Text style={styles.repeatableText}>⟲ Repeatable</Text>
                        )}
                    </TouchableOpacity>
                );
            })}

            {stories.length === 0 && (
                <Text style={styles.noStoriesText}>
                    No stories available for your level.
                </Text>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    storyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    progressText: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    passageContainer: {
        margin: 20,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    speakerText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 10,
    },
    passageType: {
        fontSize: 12,
        color: '#999',
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    passageContent: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
    moodText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 10,
    },
    choicesContainer: {
        margin: 20,
    },
    choicesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    choiceButton: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    skillCheckChoice: {
        borderColor: '#ff9500',
        backgroundColor: '#fff5e6',
    },
    itemRequiredChoice: {
        borderColor: '#ff3b30',
        backgroundColor: '#fff0f0',
    },
    choiceText: {
        fontSize: 16,
        color: '#333',
    },
    choiceTypeText: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        fontStyle: 'italic',
    },
    noChoicesText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    completionContainer: {
        margin: 20,
        padding: 20,
        backgroundColor: '#e8f5e8',
        borderRadius: 10,
        alignItems: 'center',
    },
    completionText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d5a2d',
        textAlign: 'center',
        marginBottom: 15,
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        margin: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 5,
        minWidth: 100,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    smallButton: {
        backgroundColor: '#666',
        padding: 8,
        borderRadius: 6,
        minWidth: 80,
        alignItems: 'center',
    },
    smallButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#ff3b30',
        textAlign: 'center',
        marginBottom: 10,
    },
    catalogTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        margin: 20,
    },
    storyCard: {
        backgroundColor: '#fff',
        margin: 10,
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    completedStoryCard: {
        backgroundColor: '#f0f8f0',
        borderWidth: 1,
        borderColor: '#4caf50',
    },
    storyCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    storyCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    storyCategory: {
        fontSize: 12,
        color: '#007AFF',
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        textTransform: 'uppercase',
    },
    storyDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 10,
    },
    storyMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    storyMetaText: {
        fontSize: 12,
        color: '#999',
    },
    completedText: {
        fontSize: 12,
        color: '#4caf50',
        fontWeight: 'bold',
    },
    newText: {
        fontSize: 12,
        color: '#ff9500',
        fontWeight: 'bold',
    },
    repeatableText: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        fontStyle: 'italic',
    },
    noStoriesText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        margin: 20,
        fontStyle: 'italic',
    },
});
