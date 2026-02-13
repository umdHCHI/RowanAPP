import { useEffect } from "react";
import { useCurrentUserFullProfile } from "./use-auth";
import { useGameStore } from "@/stores/game-store";
import { mapProfileToLumen } from "@/utils/profile-mapper";

/**
 * Sync experience -> lumens from the full profile
 */
export function useExperienceLumens() {
  const { data: profile, isLoading, error } = useCurrentUserFullProfile();
  const setLumen = useGameStore((state: any) => state.setLumen);

  useEffect(() => {
    if (!profile) return;
    const mappedLumen = mapProfileToLumen(profile);
    if (mappedLumen) {
      setLumen(mappedLumen);
    }
  }, [profile, setLumen]);

  return {
    isLoading,
    error: error || null,
  };
}
