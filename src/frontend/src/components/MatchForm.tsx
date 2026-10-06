import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateMatch, useFields, useTeams } from "@/hooks/useQueries";
import { useI18n } from "@/i18n";
import { toDateInputValue } from "@/lib/format";
import { PlayerLevel } from "@/types";
import { CalendarPlus, Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";

const LEVELS: PlayerLevel[] = [
  PlayerLevel.beginner,
  PlayerLevel.intermediate,
  PlayerLevel.good,
  PlayerLevel.professional,
];

export function MatchForm({
  open,
  onOpenChange,
  onCreated,
  defaultHomeTeamId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (matchId: bigint) => void;
  defaultHomeTeamId?: bigint;
}) {
  const { t } = useI18n();
  const teamsQuery = useTeams();
  const fieldsQuery = useFields();
  const createMatch = useCreateMatch();

  const teams = teamsQuery.data ?? [];
  const fields = fieldsQuery.data ?? [];

  const [homeTeamId, setHomeTeamId] = useState<string>(
    defaultHomeTeamId?.toString() ?? "",
  );
  const [awayTeamId, setAwayTeamId] = useState("");
  const [fieldId, setFieldId] = useState("");
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [time, setTime] = useState("18:30");
  const [playerCount, setPlayerCount] = useState("10");
  const [level, setLevel] = useState<PlayerLevel>(PlayerLevel.intermediate);
  const [price, setPrice] = useState("10");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setHomeTeamId(defaultHomeTeamId?.toString() ?? "");
    setAwayTeamId("");
    setFieldId("");
    setDate(toDateInputValue(new Date()));
    setTime("18:30");
    setPlayerCount("10");
    setLevel(PlayerLevel.intermediate);
    setPrice("10");
    setError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!homeTeamId || !awayTeamId || !fieldId) {
      setError(t("form.required"));
      return;
    }
    if (homeTeamId === awayTeamId) {
      setError(t("match.sameTeamError"));
      return;
    }
    const count = Number.parseInt(playerCount, 10);
    const priceValue = Number.parseFloat(price);
    if (!Number.isFinite(count) || count <= 0 || !Number.isFinite(priceValue)) {
      setError(t("form.required"));
      return;
    }
    setError(null);
    createMatch.mutate(
      {
        homeTeamId: BigInt(homeTeamId),
        awayTeamId: BigInt(awayTeamId),
        fieldId: BigInt(fieldId),
        date,
        time,
        playerCount: BigInt(count),
        level,
        pricePerPlayerDt: priceValue,
      },
      {
        onSuccess: (match) => {
          reset();
          onOpenChange(false);
          onCreated?.(match.id);
        },
        onError: () => setError(t("form.error")),
      },
    );
  };

  const noTeams = !teamsQuery.isLoading && teams.length < 2;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto"
        data-ocid="match.form_modal"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <CalendarPlus className="size-5 text-primary" aria-hidden="true" />
            {t("action.createMatch")}
          </DialogTitle>
          <DialogDescription>{t("match.formHint")}</DialogDescription>
        </DialogHeader>

        {noTeams ? (
          <p
            className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground"
            data-ocid="match.form_no_teams"
          >
            {t("match.needTwoTeams")}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="match-home">{t("match.homeTeam")}</Label>
                <Select value={homeTeamId} onValueChange={setHomeTeamId}>
                  <SelectTrigger id="match-home" data-ocid="match.home_select">
                    <SelectValue placeholder={t("match.selectTeam")} />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem
                        key={team.id.toString()}
                        value={team.id.toString()}
                      >
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="match-away">{t("match.awayTeam")}</Label>
                <Select value={awayTeamId} onValueChange={setAwayTeamId}>
                  <SelectTrigger id="match-away" data-ocid="match.away_select">
                    <SelectValue placeholder={t("match.selectTeam")} />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem
                        key={team.id.toString()}
                        value={team.id.toString()}
                      >
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="match-field">{t("label.field")}</Label>
              <Select value={fieldId} onValueChange={setFieldId}>
                <SelectTrigger id="match-field" data-ocid="match.field_select">
                  <SelectValue placeholder={t("match.selectField")} />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem
                      key={field.id.toString()}
                      value={field.id.toString()}
                    >
                      {field.name} — {field.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="match-date">{t("label.date")}</Label>
                <Input
                  id="match-date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  data-ocid="match.date_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="match-time">{t("label.time")}</Label>
                <Input
                  id="match-time"
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  data-ocid="match.time_input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="match-players">{t("label.players")}</Label>
                <Input
                  id="match-players"
                  type="number"
                  min={2}
                  max={30}
                  value={playerCount}
                  onChange={(event) => setPlayerCount(event.target.value)}
                  data-ocid="match.players_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="match-level">{t("label.level")}</Label>
                <Select
                  value={level}
                  onValueChange={(value) => setLevel(value as PlayerLevel)}
                >
                  <SelectTrigger
                    id="match-level"
                    data-ocid="match.level_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((entry) => (
                      <SelectItem key={entry} value={entry}>
                        {t(`level.${entry}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="match-price">{t("match.pricePerPlayer")}</Label>
                <Input
                  id="match-price"
                  type="number"
                  min={0}
                  step="0.5"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  data-ocid="match.price_input"
                />
              </div>
            </div>

            {error ? (
              <p
                className="text-sm font-medium text-destructive"
                data-ocid="match.form_error"
              >
                {error}
              </p>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-ocid="match.cancel_button"
              >
                {t("action.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createMatch.isPending}
                data-ocid="match.submit_button"
              >
                {createMatch.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                {t("action.createMatch")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
