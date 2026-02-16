import { useEffect } from "react";
import { useGameMyData } from "./use-game";
import { useGameStore } from "@/stores/game-store";

/**
 * Sync lumens from game data progression snapshot
 */
export function useExperienceLumens() {
  const { data: gameData, isLoading, error } = useGameMyData();
  const setLumen = useGameStore((state) => state.setLumen);

  useEffect(() => {
    if (!gameData) return;
    const lumensTotal = gameData.progression_snapshot?.lumens_total;
    if (typeof lumensTotal === "number") {
      setLumen({ lumens: lumensTotal });
    }
  }, [gameData, setLumen]);

  return {
    isLoading,
    error: error || null,
  };
}
