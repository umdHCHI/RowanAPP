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
        (existing) => {
          if (!existing) return updatedCharacter;
          return {
            ...existing,
            ...updatedCharacter,
            character_config:
              updatedCharacter.character_config ?? existing.character_config,
            selected_base_model:
              updatedCharacter.selected_base_model ?? existing.selected_base_model,
            selected_background_color:
              updatedCharacter.selected_background_color ?? existing.selected_background_color,
            selected_background_type:
              updatedCharacter.selected_background_type ?? existing.selected_background_type,
            selected_hair_color:
              updatedCharacter.selected_hair_color ?? existing.selected_hair_color,
            selected_hair_style:
              updatedCharacter.selected_hair_style ?? existing.selected_hair_style,
            selected_shirt_color:
              updatedCharacter.selected_shirt_color ?? existing.selected_shirt_color,
            selected_shirt_type:
              updatedCharacter.selected_shirt_type ?? existing.selected_shirt_type,
            selected_eye_color:
              updatedCharacter.selected_eye_color ?? existing.selected_eye_color,
            selected_eye_type:
              updatedCharacter.selected_eye_type ?? existing.selected_eye_type,
            selected_eyebrow_color:
              updatedCharacter.selected_eyebrow_color ?? existing.selected_eyebrow_color,
            selected_eyebrow_style:
              updatedCharacter.selected_eyebrow_style ?? existing.selected_eyebrow_style,
            selected_mouth_type:
              updatedCharacter.selected_mouth_type ?? existing.selected_mouth_type,
          };
        },
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
