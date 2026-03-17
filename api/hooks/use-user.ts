import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/user.service";
import { useAuthStore } from "@/stores/auth-store";
import type { UserFullProfileResponse, UserListResponse } from "../types";

/**
 * Query Keys
 */
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string | number) => [...userKeys.details(), id] as const,
  fullProfile: (id: string | number) =>
    [...userKeys.detail(id), "full_profile"] as const,
};

/**
 * Get a user by ID
 */
export function useUser(id: string | number | null) {
  return useQuery({
    queryKey: userKeys.detail(id ?? "missing"),
    queryFn: async () => {
      if (!id) throw new Error("User ID is required");
      const response = await userService.getById(id);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch user");
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get full profile for a user by ID
 */
export function useUserFullProfile(id: string | number | null) {
  return useQuery<UserFullProfileResponse>({
    queryKey: userKeys.fullProfile(id ?? "missing"),
    queryFn: async () => {
      if (!id) throw new Error("User ID is required");
      // full_profile endpoint returns the raw profile object, not an ApiResponse wrapper
      const profile = await userService.getFullProfile(id);
      return profile;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Update the current user's username
 * PATCH /api/users/:id/
 */
export function useUpdateUsername() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);

  return useMutation({
    mutationFn: async (username: string) => {
      if (!userId) throw new Error("User ID is required");
      const res = await userService.update(userId, { username });
      // Backend may return raw user object or wrapped {success, data}
      if (res && typeof res === 'object' && 'success' in res && !res.success) {
        throw new Error(res.message || "Failed to update username");
      }
      return 'data' in res ? res.data : res;
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
        queryClient.invalidateQueries({ queryKey: userKeys.fullProfile(userId) });
      }
    },
  });
}

/**
 * Get paginated user list (GET /api/users/)
 */
export function useUserList() {
  return useQuery<UserListResponse>({
    queryKey: userKeys.lists(),
    queryFn: () => userService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
