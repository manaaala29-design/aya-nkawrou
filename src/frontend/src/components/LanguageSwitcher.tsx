import { LANGUAGES, type Language, useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <fieldset
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-card/70 p-1",
        className,
      )}
      aria-label={t("lang.label")}
      data-ocid="language.switcher"
    >
      <Globe
        className="ms-1.5 size-3.5 text-muted-foreground"
        aria-hidden="true"
      />
      {LANGUAGES.map((entry) => {
        const active = entry.code === language;
        return (
          <button
            key={entry.code}
            type="button"
            onClick={() => setLanguage(entry.code as Language)}
            aria-pressed={active}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-smooth",
              active
                ? "bg-primary text-primary-foreground shadow-subtle"
                : "text-muted-foreground hover:text-foreground",
            )}
            data-ocid={`language.${entry.code}_button`}
          >
            {entry.label}
          </button>
        );
      })}
    </fieldset>
  );
}
