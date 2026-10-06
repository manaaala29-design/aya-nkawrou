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
import { Textarea } from "@/components/ui/textarea";
import { useCreateTeam } from "@/hooks/useQueries";
import { useI18n } from "@/i18n";
import { PlayerLevel } from "@/types";
import { Loader2, Shield } from "lucide-react";
import { type FormEvent, useState } from "react";

const LEVELS: PlayerLevel[] = [
  PlayerLevel.beginner,
  PlayerLevel.intermediate,
  PlayerLevel.good,
  PlayerLevel.professional,
];

const COLOR_PRESETS = [
  "#16a34a",
  "#0ea5e9",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0f172a",
];

export function TeamForm({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (teamId: bigint) => void;
}) {
  const { t } = useI18n();
  const createTeam = useCreateTeam();

  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<PlayerLevel>(PlayerLevel.intermediate);
  const [logoUrl, setLogoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setColor(COLOR_PRESETS[0]);
    setDescription("");
    setLevel(PlayerLevel.intermediate);
    setLogoUrl("");
    setError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError(t("form.required"));
      return;
    }
    setError(null);
    const payload = {
      name: name.trim(),
      color,
      description: description.trim(),
      level,
      logoUrl: logoUrl.trim() ? logoUrl.trim() : undefined,
    };
    createTeam.mutate(payload, {
      onSuccess: (team) => {
        reset();
        onOpenChange(false);
        onCreated?.(team.id);
      },
      onError: () => setError(t("form.error")),
    });
  };

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
        data-ocid="team.form_modal"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Shield className="size-5 text-primary" aria-hidden="true" />
            {t("action.createTeam")}
          </DialogTitle>
          <DialogDescription>{t("team.formHint")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="team-name">{t("team.name")}</Label>
            <Input
              id="team-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("team.namePlaceholder")}
              maxLength={60}
              data-ocid="team.name_input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="team-description">{t("team.description")}</Label>
            <Textarea
              id="team-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t("team.descriptionPlaceholder")}
              rows={3}
              maxLength={240}
              data-ocid="team.description_input"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="team-level">{t("label.level")}</Label>
              <Select
                value={level}
                onValueChange={(value) => setLevel(value as PlayerLevel)}
              >
                <SelectTrigger id="team-level" data-ocid="team.level_select">
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
              <Label htmlFor="team-logo">{t("team.logo")}</Label>
              <Input
                id="team-logo"
                value={logoUrl}
                onChange={(event) => setLogoUrl(event.target.value)}
                placeholder="https://…"
                data-ocid="team.logo_input"
              />
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">{t("team.color")}</legend>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  aria-label={preset}
                  aria-pressed={color === preset}
                  className="size-9 rounded-full border-2 transition-smooth"
                  style={{
                    backgroundColor: preset,
                    borderColor:
                      color === preset
                        ? "oklch(var(--foreground))"
                        : "transparent",
                  }}
                  data-ocid={`team.color_${preset.replace("#", "")}`}
                />
              ))}
            </div>
          </fieldset>

          {error ? (
            <p
              className="text-sm font-medium text-destructive"
              data-ocid="team.form_error"
            >
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-ocid="team.cancel_button"
            >
              {t("action.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={createTeam.isPending || !name.trim()}
              data-ocid="team.submit_button"
            >
              {createTeam.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {t("action.createTeam")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
