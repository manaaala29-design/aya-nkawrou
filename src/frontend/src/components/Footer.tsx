import { useI18n } from "@/i18n";
import { Rocket } from "lucide-react";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-border bg-card" data-ocid="footer">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2">
        <section
          className="rounded-2xl border border-border bg-gradient-subtle p-5"
          data-ocid="footer.subscription_section"
        >
          <h2 className="font-display text-lg font-bold">
            {t("footer.subscriptionTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("footer.subscriptionText")}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="font-display text-2xl font-bold text-primary">
              6 DT
              <span className="text-sm font-medium text-muted-foreground">
                {" "}
                / mois
              </span>
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-2 text-sm font-semibold text-accent-foreground shadow-subtle transition-smooth hover:opacity-95"
              data-ocid="footer.subscribe_button"
            >
              <Rocket className="size-4" aria-hidden="true" />
              {t("action.subscribe")}
            </button>
          </div>
        </section>

        <div className="flex flex-col justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span
              className="grid size-9 place-items-center rounded-xl bg-gradient-primary text-lg"
              aria-hidden="true"
            >
              ⚽
            </span>
            <div>
              <p className="font-display text-sm font-bold">{t("app.name")}</p>
              <p className="text-xs text-muted-foreground">
                {t("app.tagline")}
              </p>
            </div>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">{t("footer.credits")}</p>
            <p>
              © {year} {t("app.name")}. {t("footer.rights")}
            </p>
            <p>
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window === "undefined" ? "" : window.location.hostname,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="text-info underline-offset-4 hover:underline"
                data-ocid="footer.caffeine_link"
              >
                {t("footer.builtWith")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
