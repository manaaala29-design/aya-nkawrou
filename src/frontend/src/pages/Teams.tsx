import { TeamForm } from "@/components/TeamForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useTeams } from "@/hooks/useQueries";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Plus, Search, Shield, Users } from "lucide-react";
import { useMemo, useState } from "react";

export function TeamsPage() {
  const { t } = useI18n();
  const { isAuthenticated, login } = useAuth();
  const teamsQuery = useTeams();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const teams = teamsQuery.data ?? [];
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return teams;
    return teams.filter(
      (team) =>
        team.name.toLowerCase().includes(query) ||
        team.description.toLowerCase().includes(query),
    );
  }, [teams, search]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6" data-ocid="teams.page">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("nav.teams")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("teams.subtitle")}
          </p>
        </div>
        <Button
          type="button"
          className="rounded-full"
          onClick={() => (isAuthenticated ? setFormOpen(true) : login())}
          data-ocid="teams.create_button"
        >
          <Plus className="size-4" aria-hidden="true" />
          {t("action.createTeam")}
        </Button>
      </header>

      <div className="relative mt-6 max-w-md">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("teams.searchPlaceholder")}
          className="ps-9"
          aria-label={t("teams.searchPlaceholder")}
          data-ocid="teams.search_input"
        />
      </div>

      {teamsQuery.isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => `team-skeleton-${i}`).map(
            (id) => (
              <Skeleton key={id} className="h-44 rounded-lg" />
            ),
          )}
        </div>
      ) : filtered.length === 0 ? (
        <Card
          className="mt-6 items-center gap-2 rounded-lg border-dashed p-10 text-center"
          data-ocid="teams.empty_state"
        >
          <span
            className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary"
            aria-hidden="true"
          >
            <Shield className="size-6" />
          </span>
          <p className="font-display text-sm font-bold">
            {search ? t("teams.noResults") : t("empty.teams")}
          </p>
          <p className="max-w-sm text-xs text-muted-foreground">
            {search ? t("teams.noResultsHint") : t("empty.teamsHint")}
          </p>
          {!search ? (
            <Button
              type="button"
              className="mt-2 rounded-full"
              onClick={() => (isAuthenticated ? setFormOpen(true) : login())}
              data-ocid="teams.empty_create_button"
            >
              <Plus className="size-4" aria-hidden="true" />
              {t("action.createTeam")}
            </Button>
          ) : null}
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((team, index) => (
            <Link
              key={team.id.toString()}
              to="/teams/$teamId"
              params={{ teamId: team.id.toString() }}
              className="block"
              data-ocid={`teams.item.${index + 1}`}
            >
              <Card className="h-full gap-3 rounded-lg border-border p-4 shadow-subtle transition-smooth hover:shadow-elevated">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl text-primary-foreground"
                    style={{
                      backgroundColor: team.color || "oklch(var(--primary))",
                    }}
                    aria-hidden="true"
                  >
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <Shield className="size-6" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-bold">
                      {team.name}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {t(`level.${team.level}`)}
                    </Badge>
                  </div>
                </div>
                <p className="line-clamp-2 min-h-8 text-xs text-muted-foreground">
                  {team.description || t("teams.noDescription")}
                </p>
                <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-3.5" aria-hidden="true" />
                    {Number(team.playerCount)} {t("label.members")}
                  </span>
                  <span className="font-medium text-info">
                    {t("teams.viewTeam")}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <TeamForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
