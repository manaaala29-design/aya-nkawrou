import { FieldCard, MatchCard } from "@/components/Cards";
import { RatingStars } from "@/components/RatingStars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n";
import { createActor } from "@/lib/backend";
import { formatNumber, isSameDay, isUpcoming } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AvailablePlayer, FieldView, MatchView, TeamView } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Plus,
  Shield,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";

function SectionHeader({
  title,
  actionTo,
  actionLabel,
}: {
  title: string;
  actionTo?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <h2 className="font-display text-lg font-bold tracking-tight sm:text-xl">
        {title}
      </h2>
      {actionTo && actionLabel ? (
        <Link
          to={actionTo}
          className="inline-flex items-center gap-1 text-sm font-medium text-info transition-smooth hover:gap-2"
          data-ocid={`section.view_all.${actionTo.replace("/", "") || "home"}`}
        >
          {actionLabel}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

function CardSkeletonRow() {
  const ids = Array.from({ length: 3 }, (_, i) => `skeleton-${i}`);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ids.map((id) => (
        <Skeleton key={id} className="h-40 rounded-lg" />
      ))}
    </div>
  );
}

function EmptyState({
  title,
  hint,
  ocid,
}: {
  title: string;
  hint: string;
  ocid: string;
}) {
  return (
    <Card
      className="items-center gap-2 rounded-lg border-dashed p-8 text-center"
      data-ocid={ocid}
    >
      <span
        className="grid size-12 place-items-center rounded-full bg-primary-soft text-2xl"
        aria-hidden="true"
      >
        ⚽
      </span>
      <p className="font-display text-sm font-bold">{title}</p>
      <p className="max-w-sm text-xs text-muted-foreground">{hint}</p>
    </Card>
  );
}

export function HomePage() {
  const { t, language } = useI18n();
  const { actor, isFetching } = useActor(createActor);
  const ready = !!actor && !isFetching;

  const matchesQuery = useQuery<MatchView[]>({
    queryKey: ["matches"],
    queryFn: async () => (actor ? actor.listMatches() : []),
    enabled: ready,
  });
  const fieldsQuery = useQuery<FieldView[]>({
    queryKey: ["fields", "home"],
    queryFn: async () => (actor ? actor.listFields({}) : []),
    enabled: ready,
  });
  const teamsQuery = useQuery<TeamView[]>({
    queryKey: ["teams"],
    queryFn: async () => (actor ? actor.listTeams() : []),
    enabled: ready,
  });
  const playersQuery = useQuery<AvailablePlayer[]>({
    queryKey: ["players", "available"],
    queryFn: async () =>
      actor ? actor.searchPlayers({ availableToday: true }) : [],
    enabled: ready,
  });

  const now = new Date();
  const matches = matchesQuery.data ?? [];
  const fields = fieldsQuery.data ?? [];
  const teams = teamsQuery.data ?? [];
  const players = playersQuery.data ?? [];

  const todayMatches = matches.filter((m) => isSameDay(m.date, now));
  const upcomingMatches = matches
    .filter((m) => isUpcoming(m.date, now))
    .slice(0, 6);
  const latestMatches = [...matches]
    .sort((a, b) => Number(b.createdAt - a.createdAt))
    .slice(0, 3);
  const topTeams = [...teams]
    .sort((a, b) => Number(b.playerCount - a.playerCount))
    .slice(0, 4);
  const availableFields = fields.filter((f) => f.available).slice(0, 6);

  const teamName = (id: bigint) => teams.find((team) => team.id === id)?.name;
  const fieldName = (id: bigint) =>
    fields.find((field) => field.id === id)?.name;

  const quickActions = [
    {
      to: "/matches",
      label: t("action.bookMatch"),
      icon: CalendarDays,
      ocid: "home.book_match_button",
      primary: true,
      search: {},
    },
    {
      to: "/fields",
      label: t("action.bookField"),
      icon: MapPin,
      ocid: "home.book_field_button",
      primary: false,
      search: {},
    },
    {
      to: "/teams",
      label: t("action.joinTeam"),
      icon: Users,
      ocid: "home.join_team_button",
      primary: false,
      search: {},
    },
    {
      to: "/teams",
      label: t("action.createTeam"),
      icon: Plus,
      ocid: "home.create_team_button",
      primary: false,
      search: {},
    },
  ];

  const stats = [
    { label: t("home.statsPlayers"), value: players.length },
    { label: t("home.statsTeams"), value: teams.length },
    { label: t("home.statsFields"), value: fields.length },
    { label: t("home.statsMatches"), value: matches.length },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6" data-ocid="home.page">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-2xl border border-border bg-gradient-primary p-6 text-primary-foreground shadow-elevated sm:p-8"
        data-ocid="home.hero_section"
      >
        <img
          src="/assets/generated/hero-pitch.dim_1600x900.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover opacity-30"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40"
          aria-hidden="true"
        />
        <div
          className="pitch-lines absolute inset-0 opacity-40"
          aria-hidden="true"
        />
        <div className="relative max-w-2xl">
          <Badge className="mb-3 border-transparent bg-primary-foreground/15 text-primary-foreground">
            <Sparkles className="size-3" aria-hidden="true" />
            {t("home.heroBadge")}
          </Badge>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {t("app.name")}
          </h1>
          <p className="mt-2 text-base font-medium opacity-95" dir="rtl">
            {t("app.tagline")}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.ocid}
                  to={action.to}
                  search={action.search}
                  data-ocid={action.ocid}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-smooth active:scale-[0.98]",
                    action.primary
                      ? "bg-primary-foreground text-primary shadow-subtle hover:opacity-95"
                      : "border border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section
        className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
        data-ocid="home.stats_section"
      >
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="gap-1 rounded-lg border-border p-4 text-center shadow-subtle"
          >
            <p className="font-display text-2xl font-bold text-primary">
              {formatNumber(stat.value, language)}
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              {stat.label}
            </p>
          </Card>
        ))}
      </section>

      {/* Today's matches */}
      <section className="mt-10" data-ocid="home.today_section">
        <SectionHeader
          title={t("home.todayMatches")}
          actionTo="/matches"
          actionLabel={t("action.viewAll")}
        />
        {matchesQuery.isLoading ? (
          <CardSkeletonRow />
        ) : todayMatches.length === 0 ? (
          <EmptyState
            title={t("empty.matches")}
            hint={t("empty.matchesHint")}
            ocid="home.today_empty_state"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {todayMatches.map((match, index) => (
              <MatchCard
                key={match.id.toString()}
                match={match}
                index={index + 1}
                fieldName={fieldName(match.fieldId)}
                homeTeamName={teamName(match.homeTeamId)}
                awayTeamName={teamName(match.awayTeamId)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Available fields */}
      <section className="mt-10" data-ocid="home.fields_section">
        <SectionHeader
          title={t("home.availableFields")}
          actionTo="/fields"
          actionLabel={t("action.viewAll")}
        />
        {fieldsQuery.isLoading ? (
          <CardSkeletonRow />
        ) : availableFields.length === 0 ? (
          <EmptyState
            title={t("empty.fields")}
            hint={t("empty.fieldsHint")}
            ocid="home.fields_empty_state"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableFields.map((field, index) => (
              <FieldCard
                key={field.id.toString()}
                field={field}
                index={index + 1}
              />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming matches */}
      <section className="mt-10" data-ocid="home.upcoming_section">
        <SectionHeader
          title={t("home.upcomingMatches")}
          actionTo="/matches"
          actionLabel={t("action.viewAll")}
        />
        {matchesQuery.isLoading ? (
          <CardSkeletonRow />
        ) : upcomingMatches.length === 0 ? (
          <EmptyState
            title={t("empty.matches")}
            hint={t("empty.matchesHint")}
            ocid="home.upcoming_empty_state"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingMatches.map((match, index) => (
              <MatchCard
                key={match.id.toString()}
                match={match}
                index={index + 1}
                fieldName={fieldName(match.fieldId)}
                homeTeamName={teamName(match.homeTeamId)}
                awayTeamName={teamName(match.awayTeamId)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Top teams */}
      <section className="mt-10" data-ocid="home.teams_section">
        <SectionHeader
          title={t("home.topTeams")}
          actionTo="/teams"
          actionLabel={t("action.viewAll")}
        />
        {teamsQuery.isLoading ? (
          <CardSkeletonRow />
        ) : topTeams.length === 0 ? (
          <EmptyState
            title={t("empty.teams")}
            hint={t("empty.teamsHint")}
            ocid="home.teams_empty_state"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topTeams.map((team, index) => (
              <Card
                key={team.id.toString()}
                className="gap-3 rounded-lg border-border p-4 shadow-subtle transition-smooth hover:shadow-elevated"
                data-ocid={`home.team_card.${index + 1}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-xl text-lg font-bold text-primary-foreground"
                    style={{
                      backgroundColor: team.color || "oklch(var(--primary))",
                    }}
                    aria-hidden="true"
                  >
                    <Shield className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold">
                      {team.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t(`level.${team.level}`)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-3.5" aria-hidden="true" />
                    {Number(team.playerCount)} {t("label.members")}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Players looking for a team */}
      <section className="mt-10" data-ocid="home.players_section">
        <SectionHeader title={t("home.playersLooking")} />
        {playersQuery.isLoading ? (
          <CardSkeletonRow />
        ) : players.length === 0 ? (
          <EmptyState
            title={t("empty.players")}
            hint={t("empty.playersHint")}
            ocid="home.players_empty_state"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {players.slice(0, 6).map((player, index) => (
              <Card
                key={player.userId.toText()}
                className="flex-row items-center gap-3 rounded-lg border-border p-4 shadow-subtle"
                data-ocid={`home.player_card.${index + 1}`}
              >
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft font-display text-sm font-bold text-primary"
                  aria-hidden="true"
                >
                  {player.username.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-bold">
                    {player.username}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t(`position.${player.position}`)} · {player.city}
                  </p>
                </div>
                <RatingStars value={player.rating} />
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Latest matches */}
      <section className="mt-10" data-ocid="home.latest_section">
        <SectionHeader title={t("home.latestMatches")} />
        {matchesQuery.isLoading ? (
          <CardSkeletonRow />
        ) : latestMatches.length === 0 ? (
          <EmptyState
            title={t("empty.matches")}
            hint={t("empty.matchesHint")}
            ocid="home.latest_empty_state"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestMatches.map((match, index) => (
              <MatchCard
                key={match.id.toString()}
                match={match}
                index={index + 1}
                fieldName={fieldName(match.fieldId)}
                homeTeamName={teamName(match.homeTeamId)}
                awayTeamName={teamName(match.awayTeamId)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Join CTA */}
      <section className="mt-10" data-ocid="home.cta_section">
        <Card className="flex-col items-center gap-3 rounded-2xl border-border bg-gradient-subtle p-8 text-center shadow-subtle">
          <span
            className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground"
            aria-hidden="true"
          >
            <UserPlus className="size-6" />
          </span>
          <h2 className="font-display text-xl font-bold">
            {t("action.joinTeam")}
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {t("empty.playersHint")}
          </p>
          <Button asChild className="mt-1 rounded-full">
            <Link to="/teams" data-ocid="home.cta_join_button">
              {t("action.joinTeam")}
            </Link>
          </Button>
        </Card>
      </section>
    </div>
  );
}
