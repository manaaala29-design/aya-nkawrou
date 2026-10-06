import { useAuth } from "@/hooks/use-auth";
import { type TranslationKey, useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  Home,
  type LucideIcon,
  MapPin,
  Plus,
  Shield,
  ShieldCheck,
  Ticket,
  User,
} from "lucide-react";

type NavItem = {
  to: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
  ocid: string;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/", labelKey: "nav.home", icon: Home, ocid: "nav.home_link" },
  {
    to: "/matches",
    labelKey: "nav.matches",
    icon: CalendarDays,
    ocid: "nav.matches_link",
  },
  {
    to: "/fields",
    labelKey: "nav.fields",
    icon: MapPin,
    ocid: "nav.fields_link",
  },
  {
    to: "/bookings",
    labelKey: "nav.bookings",
    icon: Ticket,
    ocid: "nav.bookings_link",
  },
  { to: "/teams", labelKey: "nav.teams", icon: Shield, ocid: "nav.teams_link" },
  {
    to: "/profile",
    labelKey: "nav.profile",
    icon: User,
    ocid: "nav.profile_link",
  },
];

export function Sidebar() {
  const { t } = useI18n();
  const { account } = useAuth();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const navItems: NavItem[] =
    account?.role === UserRole.admin
      ? [
          ...NAV_ITEMS,
          {
            to: "/admin",
            labelKey: "admin.title",
            icon: ShieldCheck,
            ocid: "nav.admin_link",
          },
        ]
      : NAV_ITEMS;

  return (
    <aside
      className="hidden w-64 shrink-0 flex-col border-e border-border bg-sidebar text-sidebar-foreground lg:flex"
      data-ocid="sidebar"
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <span
          className="grid size-9 place-items-center rounded-xl bg-gradient-primary text-lg shadow-glow-primary"
          aria-hidden="true"
        >
          ⚽
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold tracking-tight">
            {t("app.name")}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {t("home.heroBadge")}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label={t("nav.menu")}>
        {navItems.map((item) => {
          const active =
            item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              data-ocid={item.ocid}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <Icon className="size-4.5" aria-hidden="true" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <Link
          to="/matches"
          search={{}}
          data-ocid="sidebar.create_button"
          className="flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow-primary transition-smooth hover:opacity-95"
        >
          <Plus className="size-4" aria-hidden="true" />
          {t("action.createMatch")}
        </Link>
      </div>
    </aside>
  );
}
