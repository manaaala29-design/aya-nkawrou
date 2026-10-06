import { createActor } from "@/lib/backend";
import type { AccountView } from "@/types";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const { identity, isAuthenticated, isInitializing, login, clear } =
    useInternetIdentity();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const accountQuery = useQuery<AccountView | null>({
    queryKey: ["callerAccount", identity?.getPrincipal().toText() ?? "anon"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerAccount();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });

  const logout = () => {
    clear();
    queryClient.clear();
  };

  return {
    identity,
    isAuthenticated,
    isInitializing,
    login,
    logout,
    account: accountQuery.data ?? null,
    isAccountLoading: accountQuery.isLoading,
    accountError: accountQuery.error,
    refetchAccount: accountQuery.refetch,
  };
}
