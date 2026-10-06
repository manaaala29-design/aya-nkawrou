import { MatchForm } from "@/components/MatchForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import {
  useAddTeamPlayer,
  useRemoveTeamPlayer,
  useSetTeamCaptain,
  useTeam,
} from "@/hooks/useQueries";
import { useI18n } from "@/i18n";
import { formatDate, timestampToDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarPlus,
  Crown,
  Loader2,
  Shield,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { type FormEvent, useState } from "react";

export function TeamDetailPage() {
  const { t, language } = useI18n();
  const { teamId } = useParams({ from: "/teams/$teamId" });
  const { account, isAuthenticated, login } = useAuth();

  const parsedId = (() => {
    try {
      return BigInt(teamId);
    } catch {
      return null;
    }
  })();

  const teamQuery = useTeam(parsedId);
  const addPlayer = useAddTeamPlayer();
  const removePlayer = useRemoveTeamPlayer();
  const setCaptain = useSetTeamCaptain();

  const [playerInput, setPlayerInput] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [matchFormOpen, setMatchFormOpen] = useState(false);

  const team = teamQuery.data ?? null;
  const isCaptain =
    !!account && !!team && account.id.toText() === team.captain.toText();

  const handleAddPlayer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!team || !playerInput.trim()) return;
    setActionError(null);
    const principalText = playerInput.trim();
    addPlayer.mutate(
      { teamId: team.id, player: principalText as never },
      {
        onSuccess: () => setPlayerInput(""),
        onError: () => setActionError(t("team.actionError")),
      },
    );
  };

  if (teamQuery.isLoading) {
    return (
      <div
        className="mx-auto max-w-4xl px-4 py-6 sm:px-6"
        data-ocid="team.page"
      >
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-4 h-48 rounded-lg" />
      </div>
    );
  }

  if (!team) {
    return (
      <div
        className="mx-auto max-w-4xl px-4 py-6 sm:px-6"
        data-ocid="team.page"
      >
        <Card
          className="items-center gap-2 rounded-lg border-dashed p-10 text-center"
          data-ocid="team.not_found_state"
        >
          <span
            className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary"
            aria-hidden="true"
          >
            <Shield className="size-6" />
          </span>
          <p className="font-display text-sm font-bold">{t("team.notFound")}</p>
          <Button asChild variant="outline" className="mt-2 rounded-full">
            <Link to="/teams" data-ocid="team.back_button">
              <ArrowLeft className="size-4" aria-hidden="true" />
              {t("nav.teams")}
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6" data-ocid="team.page">
      <Link
        to="/teams"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground"
        data-ocid="team.back_link"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("nav.teams")}
      </Link>

      <Card className="mt-4 gap-0 overflow-hidden rounded-2xl border-border p-0 shadow-elevated">
        <div
          className="h-24 w-full"
          style={{ backgroundColor: team.color || "oklch(var(--primary))" }}
          aria-hidden="true"
        />
        <div className="p-5">
          <div className="flex flex-wrap items-start gap-4">
            <span
              className="-mt-12 grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-card text-primary-foreground shadow-elevated"
              style={{ backgroundColor: team.color || "oklch(var(--primary))" }}
              aria-hidden="true"
            >
              {team.logoUrl ? (
                <img
                  src={team.logoUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <Shield className="size-9" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {team.name}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{t(`level.${team.level}`)}</Badge>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="size-3.5" aria-hidden="true" />
                  {Number(team.playerCount)} {t("label.members")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("team.createdOn")}{" "}
                  {formatDate(
                    new Date(Number(team.createdAt / 1_000_000n)).toISOString(),
                    language,
                  )}
                </span>
              </div>
            </div>
            {isCaptain ? (
              <Button
                type="button"
                className="rounded-full"
                onClick={() => setMatchFormOpen(true)}
                data-ocid="team.create_match_button"
              >
                <CalendarPlus className="size-4" aria-hidden="true" />
                {t("action.createMatch")}
              </Button>
            ) : null}
          </div>

          {team.description ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {team.description}
            </p>
          ) : null}
        </div>
      </Card>

      <section className="mt-6" data-ocid="team.members_section">
        <h2 className="font-display text-lg font-bold">{t("team.members")}</h2>

        {isCaptain ? (
          <form onSubmit={handleAddPlayer} className="mt-3 flex gap-2">
            <Input
              value={playerInput}
              onChange={(event) => setPlayerInput(event.target.value)}
              placeholder={t("team.addPlayerPlaceholder")}
              aria-label={t("team.addPlayerPlaceholder")}
              data-ocid="team.player_input"
            />
            <Button
              type="submit"
              disabled={addPlayer.isPending || !playerInput.trim()}
              data-ocid="team.add_player_button"
            >
              {addPlayer.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <UserPlus className="size-4" aria-hidden="true" />
              )}
              {t("team.addPlayer")}
            </Button>
          </form>
        ) : null}

        {actionError ? (
          <p
            className="mt-2 text-sm font-medium text-destructive"
            data-ocid="team.action_error"
          >
            {actionError}
          </p>
        ) : null}

        {team.memberIds.length === 0 ? (
          <Card
            className="mt-3 items-center gap-2 rounded-lg border-dashed p-8 text-center"
            data-ocid="team.members_empty_state"
          >
            <p className="font-display text-sm font-bold">
              {t("team.noMembers")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("team.noMembersHint")}
            </p>
          </Card>
        ) : (
          <ul className="mt-3 space-y-2">
            {team.memberIds.map((memberId, index) => {
              const memberText = memberId.toText();
              const isMemberCaptain = memberText === team.captain.toText();
              return (
                <li
                  key={memberText}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-subtle"
                  data-ocid={`team.member.${index + 1}`}
                >
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft font-display text-xs font-bold text-primary"
                    aria-hidden="true"
                  >
                    {memberText.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
                    {memberText}
                  </span>
                  {isMemberCaptain ? (
                    <Badge className="shrink-0 gap-1">
                      <Crown className="size-3" aria-hidden="true" />
                      {t("label.captain")}
                    </Badge>
                  ) : null}
                  {isCaptain && !isMemberCaptain ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setCaptain.mutate({
                            teamId: team.id,
                            newCaptain: memberId,
                          })
                        }
                        disabled={setCaptain.isPending}
                        data-ocid={`team.set_captain_button.${index + 1}`}
                      >
                        <Crown className="size-3.5" aria-hidden="true" />
                        {t("team.makeCaptain")}
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={t("team.removePlayer")}
                        onClick={() =>
                          removePlayer.mutate({
                            teamId: team.id,
                            player: memberId,
                          })
                        }
                        disabled={removePlayer.isPending}
                        data-ocid={`team.remove_player_button.${index + 1}`}
                      >
                        <UserMinus className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-6" data-ocid="team.stats_section">
        <h2 className="font-display text-lg font-bold">{t("label.stats")}</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="gap-1 rounded-lg border-border p-4 text-center shadow-subtle">
            <p className="font-display text-2xl font-bold text-primary">
              {Number(team.playerCount)}
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              {t("label.members")}
            </p>
          </Card>
          {[t("label.matchesPlayed"), t("label.wins"), t("label.goals")].map(
            (label) => (
              <Card
                key={label}
                className="gap-1 rounded-lg border-dashed border-border p-4 text-center shadow-subtle"
              >
                <p className="font-display text-sm font-semibold text-muted-foreground">
                  {t("label.statsNotAvailable")}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {label}
                </p>
              </Card>
            ),
          )}
        </div>
      </section>

      {!isAuthenticated ? (
        <Card className="mt-6 flex-row items-center justify-between gap-3 rounded-lg border-border p-4 shadow-subtle">
          <p className="text-sm text-muted-foreground">
            {t("team.loginToManage")}
          </p>
          <Button
            type="button"
            className="shrink-0 rounded-full"
            onClick={() => login()}
            data-ocid="team.login_button"
          >
            {t("action.login")}
          </Button>
        </Card>
      ) : null}

      <MatchForm
        open={matchFormOpen}
        onOpenChange={setMatchFormOpen}
        defaultHomeTeamId={team.id}
      />
    </div>
  );
}
