import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gameService, type VantageRunRequest } from "../services/game.service";

export const gameKeys = {
  all: ["game"] as const,
  myData: () => [...gameKeys.all, "my-data"] as const,
  stats: () => [...gameKeys.all, "stats"] as const,
};

/**
 * Get current user's game data (GET /api/game/game-data/my-data/).
 */
export function useGameMyData() {
  return useQuery({
    queryKey: gameKeys.myData(),
    queryFn: async () => {
      const response = await gameService.getMyData();
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch game data");
      }
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Submit a Vantage run to the backend (POST /api/game/game-data/vantage/run/).
 * Call after each run ends with final score and outcome for idempotent lumen awards.
 */
export function useSubmitVantageRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VantageRunRequest) => gameService.vantageRun(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.myData() });
      queryClient.invalidateQueries({ queryKey: gameKeys.stats() });
    },
  });
}
