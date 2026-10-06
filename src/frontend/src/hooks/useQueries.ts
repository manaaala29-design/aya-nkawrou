import { createActor } from "@/lib/backend";
import type {
  AvailabilityInput,
  AvailablePlayer,
  CreateMatchInput,
  CreateTeamInput,
  FieldView,
  MatchView,
  PlayerSearchFilter,
  ShareCard,
  TeamView,
} from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useTeams() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<TeamView[]>({
    queryKey: ["teams"],
    queryFn: async () => (actor ? actor.listTeams() : []),
    enabled: !!actor && !isFetching,
  });
}

export function useTeam(teamId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<TeamView | null>({
    queryKey: ["team", teamId?.toString() ?? "none"],
    queryFn: async () =>
      actor && teamId !== null ? actor.getTeam(teamId) : null,
    enabled: !!actor && !isFetching && teamId !== null,
  });
}

export function useCreateTeam() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTeamInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createTeam(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useAddTeamPlayer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      teamId,
      player,
    }: {
      teamId: bigint;
      player: Parameters<NonNullable<typeof actor>["addTeamPlayer"]>[1];
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.addTeamPlayer(teamId, player);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["teams"] });
      void queryClient.invalidateQueries({
        queryKey: ["team", variables.teamId.toString()],
      });
    },
  });
}

export function useRemoveTeamPlayer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      teamId,
      player,
    }: {
      teamId: bigint;
      player: Parameters<NonNullable<typeof actor>["removeTeamPlayer"]>[1];
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.removeTeamPlayer(teamId, player);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["teams"] });
      void queryClient.invalidateQueries({
        queryKey: ["team", variables.teamId.toString()],
      });
    },
  });
}

export function useSetTeamCaptain() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      teamId,
      newCaptain,
    }: {
      teamId: bigint;
      newCaptain: Parameters<NonNullable<typeof actor>["setTeamCaptain"]>[1];
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.setTeamCaptain(teamId, newCaptain);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["teams"] });
      void queryClient.invalidateQueries({
        queryKey: ["team", variables.teamId.toString()],
      });
    },
  });
}

export function useSearchPlayers(filter: PlayerSearchFilter) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AvailablePlayer[]>({
    queryKey: ["players", filter],
    queryFn: async () => (actor ? actor.searchPlayers(filter) : []),
    enabled: !!actor && !isFetching,
  });
}

export function useSetMyAvailability() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AvailabilityInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.setMyAvailability(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}

export function useMatches() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<MatchView[]>({
    queryKey: ["matches"],
    queryFn: async () => (actor ? actor.listMatches() : []),
    enabled: !!actor && !isFetching,
  });
}

export function useMatch(matchId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<MatchView | null>({
    queryKey: ["match", matchId?.toString() ?? "none"],
    queryFn: async () =>
      actor && matchId !== null ? actor.getMatch(matchId) : null,
    enabled: !!actor && !isFetching && matchId !== null,
  });
}

export function useCreateMatch() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateMatchInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createMatch(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useInviteMatchPlayers() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matchId,
      players,
    }: {
      matchId: bigint;
      players: Parameters<NonNullable<typeof actor>["inviteMatchPlayers"]>[1];
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.inviteMatchPlayers(matchId, players);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["matches"] });
      void queryClient.invalidateQueries({
        queryKey: ["match", variables.matchId.toString()],
      });
    },
  });
}

export function useMatchShareCard(matchId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ShareCard | null>({
    queryKey: ["matchShareCard", matchId?.toString() ?? "none"],
    queryFn: async () =>
      actor && matchId !== null ? actor.getMatchShareCard(matchId) : null,
    enabled: !!actor && !isFetching && matchId !== null,
  });
}

export function useFields() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<FieldView[]>({
    queryKey: ["fields", "all"],
    queryFn: async () => (actor ? actor.listFields({}) : []),
    enabled: !!actor && !isFetching,
  });
}
