import { MatchCard } from "@/components/Cards";
import { MatchForm } from "@/components/MatchForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useFields, useMatches, useTeams } from "@/hooks/useQueries";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { MatchStatus } from "@/types";
import { CalendarDays, Plus } from "lucide-react";
import { useMemo, useState } from "react";

const FILTERS: {
  key: string;
  labelKey:
    | "matches.all"
    | "status.scheduled"
    | "status.completed"
    | "status.cancelled";
}[] = [
  { key: "all", labelKey: "matches.all" },
  { key: MatchStatus.scheduled, labelKey: "status.scheduled" },
  { key: MatchStatus.completed, labelKey: "status.completed" },
  { key: MatchStatus.cancelled, labelKey: "status.cancelled" },
];

export function MatchesPage() {
  const { t } = useI18n();
  const { isAuthenticated, login } = useAuth();
  const matchesQuery = useMatches();
  const teamsQuery = useTeams();
  const fieldsQuery = useFields();
  const [filter, setFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);

  const matches = matchesQuery.data ?? [];
  const teams = teamsQuery.data ?? [];
  const fields = fieldsQuery.data ?? [];

  const filtered = useMemo(() => {
    const sorted = [...matches].sort((a, b) =>
      a.date === b.date
        ? a.time.localeCompare(b.time)
        : a.date.localeCompare(b.date),
    );
    if (filter === "all") return sorted;
    return sorted.filter((match) => match.status === filter);
  }, [matches, filter]);

  const teamName = (id: bigint) => teams.find((team) => team.id === id)?.name;
  const fieldName = (id: bigint) =>
    fields.find((field) => field.id === id)?.name;

  return (
    <div
      className="mx-auto max-w-6xl px-4 py-6 sm:px-6"
      data-ocid="matches.page"
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("nav.matches")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("matches.subtitle")}
          </p>
        </div>
        <Button
          type="button"
          className="rounded-full"
          onClick={() => (isAuthenticated ? setFormOpen(true) : login())}
          data-ocid="matches.create_button"
        >
          <Plus className="size-4" aria-hidden="true" />
          {t("action.createMatch")}
        </Button>
      </header>

      <div
        className="mt-6 flex flex-wrap gap-2"
        role="tablist"
        aria-label={t("matches.filterLabel")}
        data-ocid="matches.filter_tabs"
      >
        {FILTERS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            role="tab"
            aria-selected={filter === entry.key}
            onClick={() => setFilter(entry.key)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-smooth",
              filter === entry.key
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
            data-ocid={`matches.filter.${entry.key}`}
          >
            {t(entry.labelKey)}
          </button>
        ))}
      </div>

      {matchesQuery.isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => `match-skeleton-${i}`).map(
            (id) => (
              <Skeleton key={id} className="h-40 rounded-lg" />
            ),
          )}
        </div>
      ) : filtered.length === 0 ? (
        <Card
          className="mt-6 items-center gap-2 rounded-lg border-dashed p-10 text-center"
          data-ocid="matches.empty_state"
        >
          <span
            className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary"
            aria-hidden="true"
          >
            <CalendarDays className="size-6" />
          </span>
          <p className="font-display text-sm font-bold">{t("empty.matches")}</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            {t("empty.matchesHint")}
          </p>
          <Button
            type="button"
            className="mt-2 rounded-full"
            onClick={() => (isAuthenticated ? setFormOpen(true) : login())}
            data-ocid="matches.empty_create_button"
          >
            <Plus className="size-4" aria-hidden="true" />
            {t("action.createMatch")}
          </Button>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((match, index) => (
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

      <MatchForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
