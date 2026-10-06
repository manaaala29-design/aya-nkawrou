import { Layout } from "@/components/Layout";
import { I18nProvider } from "@/i18n";
import { AdminPage } from "@/pages/Admin";
import { AuthPage } from "@/pages/Auth";
import { BookingPage } from "@/pages/Booking";
import {
  BookingConfirmationPage,
  MyBookingsPage,
} from "@/pages/BookingConfirmation";
import { FieldsPage } from "@/pages/Fields";
import { HomePage } from "@/pages/Home";
import { MatchDetailPage } from "@/pages/MatchDetail";
import { MatchesPage } from "@/pages/Matches";
import { PlayersPage } from "@/pages/Players";
import { ProfilePage } from "@/pages/Profile";
import { TeamDetailPage } from "@/pages/TeamDetail";
import { TeamsPage } from "@/pages/Teams";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const matchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/matches",
  component: MatchesPage,
});

const matchDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/matches/$matchId",
  component: MatchDetailPage,
});

const fieldsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fields",
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    search?: string;
    maxPrice?: number;
    maxDistanceKm?: number;
    minRating?: number;
    timeSlot?: string;
  } => ({
    search: typeof search.search === "string" ? search.search : undefined,
    maxPrice: typeof search.maxPrice === "number" ? search.maxPrice : undefined,
    maxDistanceKm:
      typeof search.maxDistanceKm === "number"
        ? search.maxDistanceKm
        : undefined,
    minRating:
      typeof search.minRating === "number" ? search.minRating : undefined,
    timeSlot: typeof search.timeSlot === "string" ? search.timeSlot : undefined,
  }),
  component: FieldsPage,
});

const bookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/booking/$fieldId",
  component: BookingPage,
});

const bookingConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/booking-confirmation/$bookingId",
  component: BookingConfirmationPage,
});

const bookingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bookings",
  component: MyBookingsPage,
});

const teamsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/teams",
  component: TeamsPage,
});

const teamDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/teams/$teamId",
  component: TeamDetailPage,
});

const playersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/players",
  component: PlayersPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  validateSearch: (search: Record<string, unknown>): { u?: string } => ({
    u: typeof search.u === "string" ? search.u : undefined,
  }),
  component: ProfilePage,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  matchesRoute,
  matchDetailRoute,
  fieldsRoute,
  bookingRoute,
  bookingConfirmationRoute,
  bookingsRoute,
  teamsRoute,
  teamDetailRoute,
  playersRoute,
  profileRoute,
  authRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <I18nProvider>
      <RouterProvider router={router} />
    </I18nProvider>
  );
}
