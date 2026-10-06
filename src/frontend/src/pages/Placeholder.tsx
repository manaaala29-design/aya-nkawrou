import { Card } from "@/components/ui/card";
import { useI18n } from "@/i18n";

export function PlaceholderPage({
  titleKey,
  hintKey,
  ocid,
}: {
  titleKey: "nav.matches" | "nav.fields" | "nav.teams" | "nav.profile";
  hintKey:
    | "empty.matchesHint"
    | "empty.fieldsHint"
    | "empty.teamsHint"
    | "empty.playersHint";
  ocid: string;
}) {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6" data-ocid={ocid}>
      <h1 className="font-display text-2xl font-bold tracking-tight">
        {t(titleKey)}
      </h1>
      <Card className="mt-6 items-center gap-2 rounded-lg border-dashed p-10 text-center">
        <span
          className="grid size-12 place-items-center rounded-full bg-primary-soft text-2xl"
          aria-hidden="true"
        >
          ⚽
        </span>
        <p className="font-display text-sm font-bold">{t("empty.generic")}</p>
        <p className="max-w-sm text-xs text-muted-foreground">{t(hintKey)}</p>
      </Card>
    </div>
  );
}
