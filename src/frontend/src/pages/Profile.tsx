import { ProfileForm, type ProfileFormValues } from "@/components/ProfileForm";
import { RatingStars } from "@/components/RatingStars";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n";
import { createActor } from "@/lib/backend";
import { formatNumber, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  AccountView,
  AuthResult,
  PlayerProfile,
  TeamView,
  UpdateProfileInput,
} from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearch } from "@tanstack/react-router";
import {
  Award,
  Check,
  Loader2,
  LogIn,
  Pencil,
  Share2,
  Shield,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";

function StatTile({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof Target;
  accent?: boolean;
}) {
  return (
    <Card
      className={cn(
        "gap-1 rounded-lg border-border p-4 text-center shadow-subtle",
        accent && "bg-gradient-gold",
      )}
    >
      <Icon
        className={cn(
          "mx-auto size-4",
          accent ? "text-accent-foreground" : "text-primary",
        )}
        aria-hidden="true"
      />
      <p
        className={cn(
          "font-display text-xl font-bold",
          accent ? "text-accent-foreground" : "text-foreground",
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          "text-xs font-medium",
          accent ? "text-accent-foreground/80" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4" data-ocid="profile.loading_state">
      <Skeleton className="h-40 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => `stat-${i}`).map((id) => (
          <Skeleton key={id} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  );
}

export function ProfilePage() {
  const { t, language } = useI18n();
  const queryClient = useQueryClient();
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated, isInitializing, account } = useAuth();
  const ready = !!actor && !isFetching;

  const { u } = useSearch({ from: "/profile" });
  const sharedPrincipal = (() => {
    if (!u) return null;
    try {
      return Principal.fromText(u);
    } catch {
      return null;
    }
  })();
  const isSharedView = !!sharedPrincipal;

  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const profileQuery = useQuery<PlayerProfile | null>({
    queryKey: [
      "playerProfile",
      sharedPrincipal?.toText() ?? account?.id.toText() ?? "anon",
    ],
    queryFn: async () => {
      if (!actor) return null;
      const target = sharedPrincipal ?? account?.id;
      if (!target) return null;
      return actor.getPlayerProfile(target);
    },
    enabled: ready && (!!sharedPrincipal || !!account),
  });

  const sharedAccountQuery = useQuery<AccountView | null>({
    queryKey: ["account", sharedPrincipal?.toText() ?? "anon"],
    queryFn: async () => {
      if (!actor || !sharedPrincipal) return null;
      return actor.getAccount(sharedPrincipal);
    },
    enabled: ready && !!sharedPrincipal,
  });

  const teamsQuery = useQuery<TeamView[]>({
    queryKey: ["teams"],
    queryFn: async () => (actor ? actor.listTeams() : []),
    enabled: ready && (!!sharedPrincipal || !!account),
  });

  const updateMutation = useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      if (!actor) throw new Error(t("error.title"));
      return actor.updateProfile(input);
    },
    onSuccess: (result: AuthResult) => {
      if (result.__kind__ === "err") {
        setSaveError(result.err);
        return;
      }
      setSaveError(null);
      setEditing(false);
      void queryClient.invalidateQueries({ queryKey: ["playerProfile"] });
      void queryClient.invalidateQueries({ queryKey: ["callerAccount"] });
    },
    onError: () => setSaveError(t("error.hint")),
  });

  const handleShare = async () => {
    if (!account) return;
    const url = `${window.location.origin}/profile?u=${account.id.toText()}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!isAuthenticated && !isSharedView) {
    return (
      <div
        className="mx-auto max-w-2xl px-4 py-10 sm:px-6"
        data-ocid="profile.page"
      >
        <Card className="items-center gap-4 rounded-2xl border-border p-10 text-center shadow-subtle">
          <span
            className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary"
            aria-hidden="true"
          >
            <LogIn className="size-6" />
          </span>
          <h1 className="font-display text-xl font-bold">
            {t("profile.signInTitle")}
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            {t("profile.signInHint")}
          </p>
          <Button asChild className="rounded-full">
            <Link to="/auth" data-ocid="profile.sign_in_button">
              {t("action.login")}
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const viewAccount = isSharedView ? sharedAccountQuery.data : account;

  if (!viewAccount) {
    if (isSharedView && sharedAccountQuery.isLoading) {
      return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <ProfileSkeleton />
        </div>
      );
    }
    return (
      <div
        className="mx-auto max-w-2xl px-4 py-10 sm:px-6"
        data-ocid="profile.page"
      >
        <Card className="items-center gap-4 rounded-2xl border-border p-10 text-center shadow-subtle">
          <span
            className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary"
            aria-hidden="true"
          >
            <Shield className="size-6" />
          </span>
          <h1 className="font-display text-xl font-bold">
            {t("profile.noAccountTitle")}
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            {t("profile.noAccountHint")}
          </p>
          <Button asChild className="rounded-full">
            <Link to="/auth" data-ocid="profile.create_account_button">
              {t("auth.registerTab")}
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const profile = profileQuery.data;
  const stats = profile?.stats;
  const teams = teamsQuery.data ?? [];
  const memberTeams = teams.filter((team) =>
    profile?.teamIds.some((id) => id === team.id),
  );

  const initialValues: ProfileFormValues = {
    firstName: viewAccount.firstName,
    lastName: viewAccount.lastName,
    username: viewAccount.username,
    email: viewAccount.email,
    phone: viewAccount.phone,
    photoUrl: viewAccount.photoUrl ?? "",
    city: viewAccount.city,
    position: viewAccount.position,
    level: viewAccount.level,
  };

  const handleUpdate = (values: ProfileFormValues) => {
    setSaveError(null);
    updateMutation.mutate({
      firstName: values.firstName,
      lastName: values.lastName,
      username: values.username,
      email: values.email,
      phone: values.phone,
      photoUrl: values.photoUrl || undefined,
      city: values.city,
      position: values.position,
      level: values.level,
    });
  };

  return (
    <div
      className="mx-auto max-w-4xl px-4 py-6 sm:px-6"
      data-ocid="profile.page"
    >
      {/* Identity header */}
      <Card className="overflow-hidden rounded-2xl border-border p-0 shadow-subtle">
        <div
          className="h-24 bg-gradient-primary pitch-lines"
          aria-hidden="true"
        />
        <div className="px-5 pb-5 sm:px-7">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {viewAccount.photoUrl ? (
                <img
                  src={viewAccount.photoUrl}
                  alt={`${viewAccount.firstName} ${viewAccount.lastName}`}
                  className="size-24 shrink-0 rounded-2xl border-4 border-card object-cover shadow-elevated"
                  data-ocid="profile.avatar"
                />
              ) : (
                <span
                  className="grid size-24 shrink-0 place-items-center rounded-2xl border-4 border-card bg-primary-soft font-display text-3xl font-bold text-primary shadow-elevated"
                  aria-hidden="true"
                  data-ocid="profile.avatar"
                >
                  {initials(viewAccount.firstName, viewAccount.lastName)}
                </span>
              )}
              <div className="min-w-0 pb-1">
                <h1 className="truncate font-display text-xl font-bold tracking-tight sm:text-2xl">
                  {viewAccount.firstName} {viewAccount.lastName}
                </h1>
                <p className="truncate text-sm text-muted-foreground">
                  @{viewAccount.username}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {t(`position.${viewAccount.position}`)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    {t(`level.${viewAccount.level}`)}
                  </span>
                </div>
              </div>
            </div>

            {!isSharedView ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditing((value) => !value);
                    setSaveError(null);
                  }}
                  className="rounded-full"
                  data-ocid="profile.edit_button"
                >
                  <Pencil className="size-4" aria-hidden="true" />
                  {editing ? t("action.cancel") : t("profile.edit")}
                </Button>
                <Button
                  type="button"
                  onClick={handleShare}
                  className="rounded-full"
                  data-ocid="profile.share_button"
                >
                  {copied ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    <Share2 className="size-4" aria-hidden="true" />
                  )}
                  {copied ? t("profile.copied") : t("profile.share")}
                </Button>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Target className="size-4" aria-hidden="true" />
              {viewAccount.city}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Award className="size-4" aria-hidden="true" />
              {viewAccount.email}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <RatingStars value={stats?.rating ?? 0} />
              <span className="font-medium text-foreground">
                {(stats?.rating ?? 0).toFixed(1)}
              </span>
            </span>
          </div>
        </div>
      </Card>

      {editing ? (
        <Card
          className="mt-6 rounded-2xl border-border p-5 shadow-subtle sm:p-7"
          data-ocid="profile.edit_panel"
        >
          <h2 className="mb-5 font-display text-lg font-bold">
            {t("profile.editTitle")}
          </h2>
          <ProfileForm
            initialValues={initialValues}
            submitLabel={t("profile.save")}
            pendingLabel={t("profile.saving")}
            isPending={updateMutation.isPending}
            errorMessage={saveError}
            onSubmit={handleUpdate}
            ocidPrefix="profile_edit"
          />
        </Card>
      ) : null}

      {/* Stats */}
      <section className="mt-6" data-ocid="profile.stats_section">
        <h2 className="mb-3 font-display text-lg font-bold">
          {t("label.stats")}
        </h2>
        {profileQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => `stat-skel-${i}`).map((id) => (
              <Skeleton key={id} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile
              label={t("label.matchesPlayed")}
              value={formatNumber(stats?.matchesPlayed ?? 0, language)}
              icon={Target}
            />
            <StatTile
              label={t("label.wins")}
              value={formatNumber(stats?.wins ?? 0, language)}
              icon={Trophy}
            />
            <StatTile
              label={t("label.goals")}
              value={formatNumber(stats?.goals ?? 0, language)}
              icon={Target}
            />
            <StatTile
              label={t("label.assists")}
              value={formatNumber(stats?.assists ?? 0, language)}
              icon={Users}
            />
          </div>
        )}
      </section>

      {/* Teams */}
      <section className="mt-8" data-ocid="profile.teams_section">
        <h2 className="mb-3 font-display text-lg font-bold">
          {t("profile.myTeams")}
        </h2>
        {teamsQuery.isLoading ? (
          <Skeleton className="h-20 rounded-lg" />
        ) : memberTeams.length === 0 ? (
          <Card
            className="items-center gap-2 rounded-lg border-dashed p-8 text-center"
            data-ocid="profile.teams_empty_state"
          >
            <span
              className="grid size-12 place-items-center rounded-full bg-primary-soft text-2xl"
              aria-hidden="true"
            >
              🛡️
            </span>
            <p className="font-display text-sm font-bold">{t("empty.teams")}</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              {t("empty.teamsHint")}
            </p>
            <Button asChild variant="outline" className="mt-1 rounded-full">
              <Link to="/teams" data-ocid="profile.join_team_button">
                {t("action.joinTeam")}
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {memberTeams.map((team, index) => (
              <Card
                key={team.id.toString()}
                className="flex-row items-center gap-3 rounded-lg border-border p-4 shadow-subtle"
                data-ocid={`profile.team_card.${index + 1}`}
              >
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-xl text-primary-foreground"
                  style={{
                    backgroundColor: team.color || "oklch(var(--primary))",
                  }}
                  aria-hidden="true"
                >
                  <Shield className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-bold">
                    {team.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {Number(team.playerCount)} {t("label.members")}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Achievements */}
      <section className="mt-8" data-ocid="profile.achievements_section">
        <h2 className="mb-3 font-display text-lg font-bold">
          {t("label.achievements")}
        </h2>
        {profileQuery.isLoading ? (
          <Skeleton className="h-20 rounded-lg" />
        ) : (profile?.achievements.length ?? 0) === 0 ? (
          <Card
            className="items-center gap-2 rounded-lg border-dashed p-8 text-center"
            data-ocid="profile.achievements_empty_state"
          >
            <span
              className="grid size-12 place-items-center rounded-full bg-primary-soft text-2xl"
              aria-hidden="true"
            >
              🏆
            </span>
            <p className="font-display text-sm font-bold">
              {t("profile.noAchievements")}
            </p>
            <p className="max-w-sm text-xs text-muted-foreground">
              {t("profile.noAchievementsHint")}
            </p>
          </Card>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile?.achievements.map((achievement, index) => (
              <span
                key={achievement}
                className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent-foreground"
                data-ocid={`profile.achievement.${index + 1}`}
              >
                <Trophy className="size-3.5" aria-hidden="true" />
                {achievement}
              </span>
            ))}
          </div>
        )}
      </section>

      {updateMutation.isPending ? (
        <p
          className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground"
          data-ocid="profile.saving_state"
        >
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {t("profile.saving")}
        </p>
      ) : null}
    </div>
  );
}
