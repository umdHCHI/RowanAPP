import { useMemo } from "react";
export interface TemplateChoice {
    choiceId: string;
    choiceText: string;
    choiceDescription: string;
    choicePassage: string;
  }
  export function useCurrentPassage(passages: any[], currentId: string) {
    return useMemo(
      () => {
        if (!passages || !currentId) return null;
        
        // Try to find passage by passage_id first (backend structure)
        let passage = passages.find((p) => p.passage_id === currentId);
        
        // If not found, try by id (fallback)
        if (!passage) {
          passage = passages.find((p) => p.id === currentId);
        }
        
        return passage || null;
      },
      [passages, currentId]
    );
  }
  export function extractTemplateChoices(passageText: string): TemplateChoice[] {
    if (!passageText || !passageText.includes("{% if")) return [];
  
    const choiceMatches = passageText.match(
      /\{% if variables\.branch_choice == "([^"]+)" %\}([\s\S]*?)(?=\{% elif|\{% endif %})/g
    );
    if (!choiceMatches) return [];
  
    return choiceMatches
      .map((match: string) => {
        const choiceMatch = match.match(
          /\{% if variables\.branch_choice == "([^"]+)" %\}([\s\S]*?)(?=\{% elif|\{% endif %})/
        );
        if (!choiceMatch) return null;
        const choiceId = choiceMatch[1];
        const choicePassage = choiceMatch[2].trim();
  
        // You can customize these mappings as needed
        let choiceText = "";
        let choiceDescription = "";
        switch (choiceId) {
          case "confront":
            choiceText = "Stride toward the clear voice";
            choiceDescription = "Face the challenge directly with courage";
            break;
          case "avoid":
            choiceText = "Use ear-rune to dull the chorus";
            choiceDescription = "Temporarily block out the overwhelming noise";
            break;
          case "assist":
            choiceText = "Seek the Librarian's guidance";
            choiceDescription = "Find help from the Archive's keeper";
            break;
          default:
            choiceText = choiceId;
            choiceDescription = "";
        }
  
        return {
          choiceId,
          choiceText,
          choiceDescription,
          choicePassage,
        };
      })
      .filter(Boolean) as TemplateChoice[];
  }