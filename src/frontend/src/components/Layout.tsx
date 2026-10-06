import { BottomNav } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, Menu, X } from "lucide-react";
import { type ReactNode, useState } from "react";

function AuthButton({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const { isAuthenticated, isInitializing, login, logout, account } = useAuth();

  if (isInitializing) {
    return (
      <span
        className="h-9 w-24 animate-pulse-soft rounded-full bg-muted"
        aria-hidden="true"
      />
    );
  }

  if (isAuthenticated) {
    return (
      <button
        type="button"
        onClick={logout}
        data-ocid="auth.logout_button"
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium transition-smooth hover:bg-accent hover:text-accent-foreground",
          compact && "px-2.5",
        )}
      >
        <LogOut className="size-4" aria-hidden="true" />
        {!compact && (
          <span className="max-w-24 truncate">
            {account?.username ?? t("action.logout")}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => login()}
      data-ocid="auth.login_button"
      className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-subtle transition-smooth hover:bg-primary/90"
    >
      <LogIn className="size-4" aria-hidden="true" />
      {t("action.login")}
    </button>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md shadow-subtle"
          data-ocid="header"
        >
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((value) => !value)}
              aria-expanded={mobileMenuOpen}
              aria-label={
                mobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")
              }
              className="grid size-10 place-items-center rounded-lg border border-border bg-card transition-smooth hover:bg-accent lg:hidden"
              data-ocid="header.menu_button"
            >
              {mobileMenuOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>

            <Link
              to="/"
              className="flex min-w-0 items-center gap-2.5 lg:hidden"
              data-ocid="header.logo_link"
            >
              <span
                className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-primary text-lg"
                aria-hidden="true"
              >
                ⚽
              </span>
              <span className="truncate font-display text-sm font-bold">
                {t("app.name")}
              </span>
            </Link>

            <div className="hidden min-w-0 flex-1 lg:block">
              <p className="truncate font-display text-base font-bold">
                {t("app.name")}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {t("app.tagline")}
              </p>
            </div>

            <div className="ms-auto flex items-center gap-2">
              <LanguageSwitcher />
              <AuthButton />
            </div>
          </div>

          {mobileMenuOpen ? (
            <nav
              className="border-t border-border bg-card px-4 py-3 lg:hidden"
              aria-label={t("nav.menu")}
              data-ocid="header.mobile_menu"
            >
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    to: "/",
                    label: t("nav.home"),
                    ocid: "header.home_link",
                    search: {},
                  },
                  {
                    to: "/matches",
                    label: t("nav.matches"),
                    ocid: "header.matches_link",
                    search: {},
                  },
                  {
                    to: "/fields",
                    label: t("nav.fields"),
                    ocid: "header.fields_link",
                    search: {},
                  },
                  {
                    to: "/bookings",
                    label: t("nav.bookings"),
                    ocid: "header.bookings_link",
                    search: {},
                  },
                  {
                    to: "/teams",
                    label: t("nav.teams"),
                    ocid: "header.teams_link",
                    search: {},
                  },
                  {
                    to: "/profile",
                    label: t("nav.profile"),
                    ocid: "header.profile_link",
                    search: {},
                  },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    search={item.search}
                    onClick={() => setMobileMenuOpen(false)}
                    data-ocid={item.ocid}
                    className="rounded-lg border border-border px-3 py-2.5 text-sm font-medium transition-smooth hover:bg-accent hover:text-accent-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          ) : null}
        </header>

        <main className="flex-1 pb-24 lg:pb-0" data-ocid="main">
          {children}
        </main>

        <Footer />
      </div>

      <BottomNav />
    </div>
  );
}
