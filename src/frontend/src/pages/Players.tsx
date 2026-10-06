import { RatingStars } from "@/components/RatingStars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useSearchPlayers, useSetMyAvailability } from "@/hooks/useQueries";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { PlayerLevel, PlayerPosition } from "@/types";
import {
  CalendarCheck,
  Loader2,
  MapPin,
  Search,
  UserCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

const POSITIONS: PlayerPosition[] = [
  PlayerPosition.goalkeeper,
  PlayerPosition.defender,
  PlayerPosition.midfielder,
  PlayerPosition.winger,
  PlayerPosition.striker,
];

const LEVELS: PlayerLevel[] = [
  PlayerLevel.beginner,
  PlayerLevel.intermediate,
  PlayerLevel.good,
  PlayerLevel.professional,
];

const ALL = "all";

export function PlayersPage() {
  const { t } = useI18n();
  const { isAuthenticated, login } = useAuth();
  const setAvailability = useSetMyAvailability();

  const [position, setPosition] = useState<string>(ALL);
  const [level, setLevel] = useState<string>(ALL);
  const [city, setCity] = useState("");
  const [minRating, setMinRating] = useState("");
  const [availableToday, setAvailableToday] = useState(true);
  const [availableAt, setAvailableAt] = useState("");

  const [available, setAvailable] = useState(false);
  const [myTime, setMyTime] = useState("");

  const filter = useMemo(
    () => ({
      position: position === ALL ? undefined : (position as PlayerPosition),
      level: level === ALL ? undefined : (level as PlayerLevel),
      city: city.trim() ? city.trim() : undefined,
      minRating: minRating ? Number.parseFloat(minRating) : undefined,
      availableToday,
      availableAt: availableAt || undefined,
    }),
    [position, level, city, minRating, availableToday, availableAt],
  );

  const playersQuery = useSearchPlayers(filter);
  const players = playersQuery.data ?? [];

  const handleAvailabilityToggle = (next: boolean) => {
    setAvailable(next);
    setAvailability.mutate({
      available: next,
      availableAt: next && myTime ? myTime : undefined,
    });
  };

  return (
    <div
      className="mx-auto max-w-6xl px-4 py-6 sm:px-6"
      data-ocid="players.page"
    >
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("players.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("players.subtitle")}
        </p>
      </header>

      {/* Je veux jouer */}
      <Card
        className="mt-6 gap-4 rounded-2xl border-border bg-gradient-subtle p-5 shadow-subtle"
        data-ocid="players.availability_panel"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "grid size-11 place-items-center rounded-full transition-smooth",
                available
                  ? "bg-[oklch(var(--status-available))] text-white"
                  : "bg-muted text-muted-foreground",
              )}
              aria-hidden="true"
            >
              <UserCheck className="size-5" />
            </span>
            <div>
              <p className="font-display text-base font-bold">
                {t("players.imAvailable")}
              </p>
              <p className="text-xs text-muted-foreground">
                {available
                  ? t("players.visibleToTeams")
                  : t("players.hiddenFromTeams")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {setAvailability.isPending ? (
              <Loader2
                className="size-4 animate-spin text-muted-foreground"
                aria-hidden="true"
              />
            ) : null}
            <Switch
              checked={available}
              onCheckedChange={handleAvailabilityToggle}
              disabled={!isAuthenticated || setAvailability.isPending}
              aria-label={t("players.imAvailable")}
              data-ocid="players.availability_switch"
            />
          </div>
        </div>

        {available ? (
          <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="my-available-at">
                {t("players.availableAt")}
              </Label>
              <Input
                id="my-available-at"
                type="time"
                value={myTime}
                onChange={(event) => setMyTime(event.target.value)}
                className="w-40"
                data-ocid="players.available_at_input"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setAvailability.mutate({
                  available: true,
                  availableAt: myTime || undefined,
                })
              }
              disabled={setAvailability.isPending}
              data-ocid="players.save_availability_button"
            >
              {t("action.save")}
            </Button>
          </div>
        ) : null}

        {!isAuthenticated ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              {t("players.loginToAppear")}
            </p>
            <Button
              type="button"
              className="rounded-full"
              onClick={() => login()}
              data-ocid="players.login_button"
            >
              {t("action.login")}
            </Button>
          </div>
        ) : null}
      </Card>

      {/* Besoin d'un joueur ? */}
      <section className="mt-8" data-ocid="players.search_section">
        <h2 className="font-display text-lg font-bold">
          {t("players.needPlayer")}
        </h2>

        <Card className="mt-3 gap-4 rounded-lg border-border p-4 shadow-subtle">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="filter-position">{t("label.position")}</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger
                  id="filter-position"
                  data-ocid="players.position_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>
                    {t("players.anyPosition")}
                  </SelectItem>
                  {POSITIONS.map((entry) => (
                    <SelectItem key={entry} value={entry}>
                      {t(`position.${entry}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filter-level">{t("label.level")}</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger
                  id="filter-level"
                  data-ocid="players.level_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{t("players.anyLevel")}</SelectItem>
                  {LEVELS.map((entry) => (
                    <SelectItem key={entry} value={entry}>
                      {t(`level.${entry}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filter-city">{t("label.city")}</Label>
              <Input
                id="filter-city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder={t("players.cityPlaceholder")}
                data-ocid="players.city_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filter-rating">{t("players.minRating")}</Label>
              <Input
                id="filter-rating"
                type="number"
                min={0}
                max={5}
                step="0.5"
                value={minRating}
                onChange={(event) => setMinRating(event.target.value)}
                placeholder="0"
                data-ocid="players.rating_input"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-4 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <Switch
                id="filter-today"
                checked={availableToday}
                onCheckedChange={setAvailableToday}
                data-ocid="players.today_switch"
              />
              <Label htmlFor="filter-today">
                {t("players.availableToday")}
              </Label>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-at">{t("players.availableAt")}</Label>
              <Input
                id="filter-at"
                type="time"
                value={availableAt}
                onChange={(event) => setAvailableAt(event.target.value)}
                className="w-40"
                data-ocid="players.filter_at_input"
              />
            </div>
          </div>
        </Card>

        {playersQuery.isLoading ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => `player-skeleton-${i}`).map(
              (id) => (
                <Skeleton key={id} className="h-28 rounded-lg" />
              ),
            )}
          </div>
        ) : players.length === 0 ? (
          <Card
            className="mt-4 items-center gap-2 rounded-lg border-dashed p-10 text-center"
            data-ocid="players.empty_state"
          >
            <span
              className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary"
              aria-hidden="true"
            >
              <Search className="size-6" />
            </span>
            <p className="font-display text-sm font-bold">
              {t("empty.players")}
            </p>
            <p className="max-w-sm text-xs text-muted-foreground">
              {t("empty.playersHint")}
            </p>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {players.map((player, index) => (
              <Card
                key={player.userId.toText()}
                className="gap-3 rounded-lg border-border p-4 shadow-subtle transition-smooth hover:shadow-elevated"
                data-ocid={`players.item.${index + 1}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-soft font-display text-sm font-bold text-primary"
                    aria-hidden="true"
                  >
                    {player.username.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-bold">
                      {player.username}
                    </p>
                    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="size-3" aria-hidden="true" />
                      {player.city}
                    </p>
                  </div>
                  {player.available ? (
                    <Badge
                      className="shrink-0 gap-1 border-transparent bg-[oklch(var(--status-available))] text-white"
                      data-ocid={`players.available_badge.${index + 1}`}
                    >
                      <CalendarCheck className="size-3" aria-hidden="true" />
                      {t("status.available")}
                    </Badge>
                  ) : null}
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t(`position.${player.position}`)} ·{" "}
                    {t(`level.${player.level}`)}
                  </span>
                  <RatingStars value={player.rating} />
                </div>
                {player.availableAt ? (
                  <p className="text-xs text-muted-foreground">
                    {t("players.availableAt")}: {player.availableAt}
                  </p>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
