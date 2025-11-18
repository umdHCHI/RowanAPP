import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from '../../../imports';
import { TUTORIAL_STEPS } from '../constants/tutorialSteps';

interface TutorialModalProps {
  showTutorial: boolean;
  currentTutorialStep: number;
  nextTutorialStep: () => void;
  previousTutorialStep: () => void;
  skipTutorial: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  showTutorial,
  currentTutorialStep,
  nextTutorialStep,
  previousTutorialStep,
  skipTutorial
}) => {
  if (!showTutorial) return null;

  const currentStep = TUTORIAL_STEPS[currentTutorialStep];
  const isFirstStep = currentTutorialStep === 0;
  const isLastStep = currentTutorialStep === TUTORIAL_STEPS.length - 1;

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
      }} />

      <View style={{
        position: 'absolute',
        top: '15%',
        left: 12,
        right: 12,
        backgroundColor: 'rgba(10, 11, 15, 0.95)',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#4ee6e6',
        padding: 16,
        zIndex: 1001,
        shadowColor: '#4ee6e6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 20,
        maxHeight: '70%',
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginBottom: 12,
        }}>
          {TUTORIAL_STEPS.map((_, index) => (
            <View
              key={index}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: index === currentTutorialStep ? '#4ee6e6' : 'rgba(78, 230, 230, 0.3)',
                marginHorizontal: 3,
              }}
            />
          ))}
        </View>

        <Text style={{
          color: '#4ee6e6',
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 12,
          textShadowColor: 'rgba(78, 230, 230, 0.5)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4,
        }}>
          {currentStep.title}
        </Text>

        <Text style={{
          color: '#ffffff',
          fontSize: 14,
          lineHeight: 20,
          textAlign: 'center',
          marginBottom: 12,
          textShadowColor: 'rgba(0, 0, 0, 0.5)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        }}>
          {currentStep.message}
        </Text>

        {currentStep.tip && (
          <View style={{
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            borderWidth: 1,
            borderColor: 'rgba(212, 175, 55, 0.3)',
            borderRadius: 10,
            padding: 10,
            marginBottom: 16,
          }}>
            <Text style={{
              color: '#d4af37',
              fontSize: 12,
              fontStyle: 'italic',
              textAlign: 'center',
              textShadowColor: 'rgba(212, 175, 55, 0.3)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}>
              💡 {currentStep.tip}
            </Text>
          </View>
        )}

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
        }}>
          <TouchableOpacity
            onPress={skipTutorial}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
              backgroundColor: 'transparent',
              flex: 1,
            }}
            activeOpacity={0.7}
          >
            <Text style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 12,
              fontWeight: '500',
              textAlign: 'center',
            }}>
              Skip
            </Text>
          </TouchableOpacity>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            flex: 2,
          }}>
            {!isFirstStep && (
              <TouchableOpacity
                onPress={previousTutorialStep}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  backgroundColor: 'rgba(78, 230, 230, 0.2)',
                  borderWidth: 1,
                  borderColor: '#4ee6e6',
                  flex: 1,
                }}
                activeOpacity={0.7}
              >
                <Text style={{
                  color: '#4ee6e6',
                  fontSize: 12,
                  fontWeight: '600',
                  textAlign: 'center',
                }}>
                  ← Prev
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={nextTutorialStep}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 20,
                backgroundColor: '#4ee6e6',
                shadowColor: '#4ee6e6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
                flex: 1,
              }}
              activeOpacity={0.8}
            >
              <Text style={{
                color: '#0a0b0f',
                fontSize: 12,
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
                {isLastStep ? 'Start!' : 'Next →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};