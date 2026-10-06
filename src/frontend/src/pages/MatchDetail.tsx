import { ShareMatchCard } from "@/components/ShareMatchCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import {
  useFields,
  useInviteMatchPlayers,
  useMatch,
  useMatchShareCard,
  useTeams,
} from "@/hooks/useQueries";
import { useI18n } from "@/i18n";
import { formatDate, formatPrice } from "@/lib/format";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Loader2,
  MapPin,
  UserPlus,
  Users,
} from "lucide-react";
import { type FormEvent, useState } from "react";

export function MatchDetailPage() {
  const { t, language } = useI18n();
  const { matchId } = useParams({ from: "/matches/$matchId" });
  const { account, isAuthenticated, login } = useAuth();

  const parsedId = (() => {
    try {
      return BigInt(matchId);
    } catch {
      return null;
    }
  })();

  const matchQuery = useMatch(parsedId);
  const shareQuery = useMatchShareCard(parsedId);
  const teamsQuery = useTeams();
  const fieldsQuery = useFields();
  const invitePlayers = useInviteMatchPlayers();

  const [inviteInput, setInviteInput] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);

  const match = matchQuery.data ?? null;
  const teams = teamsQuery.data ?? [];
  const fields = fieldsQuery.data ?? [];

  const homeTeam = match
    ? teams.find((team) => team.id === match.homeTeamId)
    : undefined;
  const awayTeam = match
    ? teams.find((team) => team.id === match.awayTeamId)
    : undefined;
  const field = match
    ? fields.find((entry) => entry.id === match.fieldId)
    : undefined;

  const isCaptain =
    !!account &&
    !!homeTeam &&
    account.id.toText() === homeTeam.captain.toText();

  const handleInvite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!match || !inviteInput.trim()) return;
    setInviteError(null);
    invitePlayers.mutate(
      { matchId: match.id, players: [inviteInput.trim() as never] },
      {
        onSuccess: () => setInviteInput(""),
        onError: () => setInviteError(t("match.inviteError")),
      },
    );
  };

  if (matchQuery.isLoading) {
    return (
      <div
        className="mx-auto max-w-4xl px-4 py-6 sm:px-6"
        data-ocid="match.page"
      >
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-4 h-56 rounded-lg" />
      </div>
    );
  }

  if (!match) {
    return (
      <div
        className="mx-auto max-w-4xl px-4 py-6 sm:px-6"
        data-ocid="match.page"
      >
        <Card
          className="items-center gap-2 rounded-lg border-dashed p-10 text-center"
          data-ocid="match.not_found_state"
        >
          <span
            className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary"
            aria-hidden="true"
          >
            <CalendarDays className="size-6" />
          </span>
          <p className="font-display text-sm font-bold">
            {t("match.notFound")}
          </p>
          <Button asChild variant="outline" className="mt-2 rounded-full">
            <Link to="/matches" data-ocid="match.back_button">
              <ArrowLeft className="size-4" aria-hidden="true" />
              {t("nav.matches")}
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const isCancelled = match.status === "cancelled";

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6" data-ocid="match.page">
      <Link
        to="/matches"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground"
        data-ocid="match.back_link"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("nav.matches")}
      </Link>

      <Card className="mt-4 gap-0 overflow-hidden rounded-2xl border-border p-0 shadow-elevated">
        <div className="relative bg-gradient-primary p-6 text-primary-foreground">
          <div
            className="pitch-lines absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-2xl font-bold leading-tight">
                {homeTeam?.name ?? `#${match.homeTeamId}`}
                <span className="mx-2 opacity-80">vs</span>
                {awayTeam?.name ?? `#${match.awayTeamId}`}
              </p>
              <p className="mt-1 text-sm opacity-90">
                {field?.name ?? `#${match.fieldId}`}
              </p>
            </div>
            <Badge
              variant={isCancelled ? "destructive" : "secondary"}
              className="shrink-0"
            >
              {t(`status.${match.status}`)}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <span
              className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary"
              aria-hidden="true"
            >
              <CalendarDays className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{t("label.date")}</p>
              <p className="font-medium">{formatDate(match.date, language)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary"
              aria-hidden="true"
            >
              <Clock className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{t("label.time")}</p>
              <p className="font-medium">{match.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary"
              aria-hidden="true"
            >
              <Users className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("label.players")}
              </p>
              <p className="font-medium">
                {Number(match.playerCount)} {t("label.players")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="grid size-10 place-items-center rounded-lg bg-accent/20 text-accent-foreground"
              aria-hidden="true"
            >
              <MapPin className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("label.price")}
              </p>
              <p className="font-medium">
                {formatPrice(match.pricePerPlayerDt, language)}{" "}
                <span className="text-xs text-muted-foreground">
                  {t("label.perPlayer")}
                </span>
              </p>
            </div>
          </div>
        </div>
      </Card>

      {shareQuery.data ? (
        <section className="mt-6" data-ocid="match.share_section">
          <h2 className="mb-3 font-display text-lg font-bold">
            {t("share.title")}
          </h2>
          <ShareMatchCard card={shareQuery.data} />
        </section>
      ) : null}

      <section className="mt-6" data-ocid="match.invite_section">
        <h2 className="font-display text-lg font-bold">
          {t("match.invitedPlayers")}
        </h2>

        {isCaptain ? (
          <form onSubmit={handleInvite} className="mt-3 flex gap-2">
            <Input
              value={inviteInput}
              onChange={(event) => setInviteInput(event.target.value)}
              placeholder={t("match.invitePlaceholder")}
              aria-label={t("match.invitePlaceholder")}
              data-ocid="match.invite_input"
            />
            <Button
              type="submit"
              disabled={invitePlayers.isPending || !inviteInput.trim()}
              data-ocid="match.invite_button"
            >
              {invitePlayers.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <UserPlus className="size-4" aria-hidden="true" />
              )}
              {t("match.invite")}
            </Button>
          </form>
        ) : null}

        {inviteError ? (
          <p
            className="mt-2 text-sm font-medium text-destructive"
            data-ocid="match.invite_error"
          >
            {inviteError}
          </p>
        ) : null}

        {match.invitedPlayerIds.length === 0 ? (
          <Card
            className="mt-3 items-center gap-2 rounded-lg border-dashed p-8 text-center"
            data-ocid="match.invited_empty_state"
          >
            <p className="font-display text-sm font-bold">
              {t("match.noInvites")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("match.noInvitesHint")}
            </p>
          </Card>
        ) : (
          <ul className="mt-3 space-y-2">
            {match.invitedPlayerIds.map((playerId, index) => (
              <li
                key={playerId.toText()}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-subtle"
                data-ocid={`match.invited.${index + 1}`}
              >
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft font-display text-xs font-bold text-primary"
                  aria-hidden="true"
                >
                  {playerId.toText().slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
                  {playerId.toText()}
                </span>
              </li>
            ))}
          </ul>
        )}

        {!isAuthenticated ? (
          <Card className="mt-3 flex-row items-center justify-between gap-3 rounded-lg border-border p-4 shadow-subtle">
            <p className="text-sm text-muted-foreground">
              {t("match.loginToInvite")}
            </p>
            <Button
              type="button"
              className="shrink-0 rounded-full"
              onClick={() => login()}
              data-ocid="match.login_button"
            >
              {t("action.login")}
            </Button>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
