import { type TranslationKey, useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  Home,
  type LucideIcon,
  MapPin,
  Plus,
  Shield,
  Ticket,
  User,
} from "lucide-react";
import { useState } from "react";

type NavItem = {
  to: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
  ocid: string;
};

const LEFT_ITEMS: NavItem[] = [
  { to: "/", labelKey: "nav.home", icon: Home, ocid: "nav.home_link" },
  {
    to: "/matches",
    labelKey: "nav.matches",
    icon: CalendarDays,
    ocid: "nav.matches_link",
  },
];

const RIGHT_ITEMS: NavItem[] = [
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

const CREATE_ACTIONS: { to: string; labelKey: TranslationKey; ocid: string }[] =
  [
    {
      to: "/matches",
      labelKey: "action.createMatch",
      ocid: "fab.create_match",
    },
    { to: "/teams", labelKey: "action.createTeam", ocid: "fab.create_team" },
    { to: "/fields", labelKey: "action.bookField", ocid: "fab.book_field" },
  ];

function NavLink({ item }: { item: NavItem }) {
  const { t } = useI18n();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const active =
    item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      data-ocid={item.ocid}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition-smooth",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
      <span className="truncate">{t(item.labelKey)}</span>
    </Link>
  );
}

export function BottomNav() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label={t("nav.closeMenu")}
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          data-ocid="fab.backdrop"
        />
      ) : null}

      {open ? (
        <div
          className="fixed bottom-24 start-1/2 z-50 w-56 -translate-x-1/2 space-y-1 rounded-2xl border border-border bg-popover p-2 shadow-elevated animate-scale-in lg:hidden"
          data-ocid="fab.menu"
        >
          {CREATE_ACTIONS.map((action) => (
            <Link
              key={action.ocid}
              to={action.to}
              search={{}}
              onClick={() => setOpen(false)}
              data-ocid={action.ocid}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-popover-foreground transition-smooth hover:bg-accent hover:text-accent-foreground"
            >
              <Plus className="size-4" aria-hidden="true" />
              {t(action.labelKey)}
            </Link>
          ))}
        </div>
      ) : null}

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md safe-bottom lg:hidden"
        aria-label={t("nav.menu")}
        data-ocid="bottom_nav"
      >
        <div className="mx-auto flex max-w-lg items-center justify-between px-2 py-1.5">
          {LEFT_ITEMS.map((item) => (
            <NavLink key={item.to} item={item} />
          ))}

          <div className="relative flex w-16 shrink-0 justify-center">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-label={t("nav.create")}
              className="-mt-6 grid size-14 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow-primary ring-4 ring-background transition-smooth active:scale-95"
              data-ocid="fab.open_button"
            >
              <Plus
                className={cn(
                  "size-6 transition-transform duration-300",
                  open && "rotate-45",
                )}
                aria-hidden="true"
              />
            </button>
          </div>

          {RIGHT_ITEMS.map((item) => (
            <NavLink key={item.to} item={item} />
          ))}
        </div>
      </nav>
    </>
  );
}
