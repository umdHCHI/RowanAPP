import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { characterService } from "../services/character.service";
import { useCurrentUserFullProfile } from "./use-auth";
import { userKeys } from "./use-user";
import type {
  CharacterCreateRequest,
  CharacterUpdateRequest,
  CharacterResponse,
} from "../types";

/**
 * Query Keys (singleton per logged-in user)
 */
export const characterKeys = {
  all: ["character"] as const,
  mine: () => [...characterKeys.all, "mine"] as const,
};

export function useMyCharacter() {
  return useQuery<CharacterResponse>({
    queryKey: characterKeys.mine(),
    queryFn: async () => {
      const res = await characterService.getMine();
      if (!res.success)
        throw new Error(res.message || "Failed to fetch character");
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CharacterCreateRequest) => {
      try {
        const res = await characterService.create(data);
        if (!res.success)
          throw new Error(res.message || "Failed to create character");
        return res.data;
      } catch (err: any) {
        const msg = err?.errors?.detail || err?.message || "";
        const status = err?.status;

        if (
          status === 400 &&
          String(msg).includes("Character already exists")
        ) {
          const mine = await characterService.getMine();
          if (!mine.success)
            throw new Error(
              mine.message || "Character exists but failed to fetch",
            );
          return mine.data;
        }

        throw err;
      }
    },
    onSuccess: (character) => {
      queryClient.setQueryData(characterKeys.mine(), character);
    },
  });
}

/**
 * Update cosmetic fields only
 * PATCH /api/characters/characters/update_customization/
 */

export function useUpdateCharacterCustomization() {
  const queryClient = useQueryClient();
  const { data: character } = useMyCharacter();
  const userId = (character?.id ?? 0);
  return useMutation({
    mutationFn: async (data: CharacterUpdateRequest) => {
      const res = await characterService.updateCustomization(data);
      const hasSuccessField =
        !!res &&
        typeof res === "object" &&
        Object.prototype.hasOwnProperty.call(res as object, "success");
      const hasDataField =
        !!res &&
        typeof res === "object" &&
        Object.prototype.hasOwnProperty.call(res as object, "data");

      if (hasSuccessField && !res.success) {
        throw new Error(res.message || "Failed to update character");
      }

      if (hasDataField && res?.data) return res.data;

      const mine = await characterService.getMine();
      if (!mine.success)
        throw new Error(mine.message || "Updated character but failed to fetch");
      return mine.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.fullProfile(userId) })
  }});
}

/**
 * Gain “lumens” (backend increments experience)
 */
export function useGainLumens() {
  const queryClient = useQueryClient();
  const { data: fullProfile } = useCurrentUserFullProfile();

  return useMutation({
    mutationFn: async (amount: number = 1) => {
      const res = await characterService.gainLumens(amount);
      if (!res.success)
        throw new Error(res.message || "Failed to gain lumens");
      return res.data;
    },
    onSuccess: (updatedCharacter) => {
      queryClient.setQueryData<CharacterResponse>(
        characterKeys.mine(),
        updatedCharacter,
      );

      // IMPORTANT: userKeys.fullProfile REQUIRES AN ID
      const userId = fullProfile?.id;
      if (userId) {
      queryClient.invalidateQueries({
          queryKey: userKeys.fullProfile(userId),
        });
      }
    },
  });
}
