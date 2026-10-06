import { BookingsStatusChart, RevenueChart } from "@/components/AdminCharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n";
import { createActor } from "@/lib/backend";
import {
  formatDate,
  formatDateTime,
  formatNumber,
  formatPrice,
  initials,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  AccountView,
  AdminOverview,
  BookingView,
  FieldView,
  MatchView,
  TeamView,
} from "@/types";
import { BookingStatus, UserRole } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Ban,
  CalendarDays,
  CircleDollarSign,
  MapPin,
  Shield,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_BADGE: Record<BookingStatus, string> = {
  [BookingStatus.paid]:
    "border-transparent bg-[oklch(var(--status-available-soft))] text-[oklch(var(--status-available))]",
  [BookingStatus.pending]:
    "border-transparent bg-[oklch(var(--warning)/0.18)] text-[oklch(var(--warning))]",
  [BookingStatus.cancelled]:
    "border-transparent bg-[oklch(var(--status-reserved-soft))] text-[oklch(var(--status-reserved))]",
};

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  ocid,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  accent: string;
  ocid: string;
}) {
  return (
    <Card
      className="gap-2 rounded-lg border-border p-4 shadow-subtle"
      data-ocid={ocid}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span
          className={cn("grid size-8 place-items-center rounded-lg", accent)}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="font-display text-2xl font-bold tabular-nums">{value}</p>
    </Card>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  const ids = Array.from({ length: rows }, (_, i) => `admin-skeleton-${i}`);
  return (
    <div className="space-y-2 p-4">
      {ids.map((id) => (
        <Skeleton key={id} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  );
}

function EmptyRow({ message, ocid }: { message: string; ocid: string }) {
  return (
    <TableRow data-ocid={ocid}>
      <TableCell
        colSpan={99}
        className="py-10 text-center text-sm text-muted-foreground"
      >
        {message}
      </TableCell>
    </TableRow>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <Card
      className="items-center gap-3 rounded-lg border-dashed p-10 text-center"
      data-ocid="admin.error_state"
    >
      <p className="font-display text-sm font-bold">{t("error.title")}</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        {t("error.hint")}
      </p>
      <Button
        type="button"
        variant="outline"
        className="rounded-full"
        onClick={onRetry}
        data-ocid="admin.retry_button"
      >
        {t("action.retry")}
      </Button>
    </Card>
  );
}

function AccessDenied() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6" data-ocid="admin.page">
      <Card
        className="items-center gap-3 rounded-2xl border-dashed p-12 text-center"
        data-ocid="admin.access_denied"
      >
        <span
          className="grid size-14 place-items-center rounded-full bg-[oklch(var(--status-reserved-soft))] text-[oklch(var(--status-reserved))]"
          aria-hidden="true"
        >
          <Shield className="size-7" />
        </span>
        <h1 className="font-display text-xl font-bold">
          {t("admin.accessDeniedTitle")}
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {t("admin.accessDeniedHint")}
        </p>
        <Button asChild className="mt-1 rounded-full">
          <Link to="/" data-ocid="admin.back_home_button">
            {t("nav.home")}
          </Link>
        </Button>
      </Card>
    </div>
  );
}

function UsersPanel() {
  const { t, language } = useI18n();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const accountsQuery = useQuery<AccountView[]>({
    queryKey: ["admin", "accounts"],
    queryFn: async () => (actor ? actor.listAccounts() : []),
    enabled: !!actor && !isFetching,
  });

  const banMutation = useMutation({
    mutationFn: async ({
      user,
      banned,
    }: {
      user: AccountView["id"];
      banned: boolean;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.setAccountBanned(user, banned);
    },
    onSuccess: (ok, variables) => {
      if (!ok) {
        toast.error(t("admin.actionFailed"));
        return;
      }
      toast.success(
        variables.banned ? t("admin.userBanned") : t("admin.userUnbanned"),
      );
      void queryClient.invalidateQueries({ queryKey: ["admin", "accounts"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: () => toast.error(t("admin.actionFailed")),
  });

  const accounts = accountsQuery.data ?? [];

  return (
    <Card
      className="gap-0 overflow-hidden rounded-lg border-border p-0 shadow-subtle"
      data-ocid="admin.users_panel"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <h2 className="font-display text-base font-bold tracking-tight">
          {t("admin.usersTitle")}
        </h2>
        <Badge variant="secondary" className="rounded-full">
          {formatNumber(accounts.length, language)}
        </Badge>
      </div>

      {accountsQuery.isLoading ? (
        <TableSkeleton />
      ) : accountsQuery.isError ? (
        <div className="p-4">
          <ErrorState onRetry={() => void accountsQuery.refetch()} />
        </div>
      ) : (
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead>{t("admin.colUser")}</TableHead>
              <TableHead className="hidden md:table-cell">
                {t("label.city")}
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                {t("label.position")}
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                {t("admin.colRole")}
              </TableHead>
              <TableHead>{t("admin.colStatus")}</TableHead>
              <TableHead className="text-end">
                {t("admin.colActions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.length === 0 ? (
              <EmptyRow
                message={t("admin.noUsers")}
                ocid="admin.users_empty_state"
              />
            ) : (
              accounts.map((account, index) => (
                <TableRow
                  key={account.id.toText()}
                  data-ocid={`admin.user_row.${index + 1}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span
                        className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft font-display text-xs font-bold text-primary"
                        aria-hidden="true"
                      >
                        {initials(account.firstName, account.lastName)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {account.firstName} {account.lastName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          @{account.username}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {account.city}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {t(`position.${account.position}`)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant={
                        account.role === UserRole.admin
                          ? "default"
                          : "secondary"
                      }
                      className="rounded-full"
                    >
                      {t(`role.${account.role}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "rounded-full",
                        account.banned
                          ? "border-transparent bg-[oklch(var(--status-reserved-soft))] text-[oklch(var(--status-reserved))]"
                          : "border-transparent bg-[oklch(var(--status-available-soft))] text-[oklch(var(--status-available))]",
                      )}
                    >
                      {account.banned ? t("admin.banned") : t("admin.active")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    <Button
                      type="button"
                      size="sm"
                      variant={account.banned ? "outline" : "destructive"}
                      className="rounded-full"
                      disabled={banMutation.isPending}
                      onClick={() =>
                        banMutation.mutate({
                          user: account.id,
                          banned: !account.banned,
                        })
                      }
                      data-ocid={`admin.ban_button.${index + 1}`}
                    >
                      {account.banned ? (
                        <UserCheck className="size-3.5" aria-hidden="true" />
                      ) : (
                        <Ban className="size-3.5" aria-hidden="true" />
                      )}
                      {account.banned ? t("admin.unban") : t("admin.ban")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

function BookingsPanel() {
  const { t, language } = useI18n();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery<BookingView[]>({
    queryKey: ["admin", "bookings"],
    queryFn: async () => (actor ? actor.listAllBookings() : []),
    enabled: !!actor && !isFetching,
  });

  const cancelMutation = useMutation({
    mutationFn: async (bookingId: BookingView["id"]) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.cancelBooking(bookingId);
    },
    onSuccess: (ok) => {
      if (!ok) {
        toast.error(t("admin.actionFailed"));
        return;
      }
      toast.success(t("admin.bookingCancelled"));
      void queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: () => toast.error(t("admin.actionFailed")),
  });

  const bookings = bookingsQuery.data ?? [];

  return (
    <Card
      className="gap-0 overflow-hidden rounded-lg border-border p-0 shadow-subtle"
      data-ocid="admin.bookings_panel"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <h2 className="font-display text-base font-bold tracking-tight">
          {t("admin.bookingsTitle")}
        </h2>
        <Badge variant="secondary" className="rounded-full">
          {formatNumber(bookings.length, language)}
        </Badge>
      </div>

      {bookingsQuery.isLoading ? (
        <TableSkeleton />
      ) : bookingsQuery.isError ? (
        <div className="p-4">
          <ErrorState onRetry={() => void bookingsQuery.refetch()} />
        </div>
      ) : (
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead>{t("label.team")}</TableHead>
              <TableHead className="hidden sm:table-cell">
                {t("label.date")}
              </TableHead>
              <TableHead className="hidden md:table-cell">
                {t("label.time")}
              </TableHead>
              <TableHead className="text-end">{t("label.price")}</TableHead>
              <TableHead>{t("admin.colStatus")}</TableHead>
              <TableHead className="text-end">
                {t("admin.colActions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <EmptyRow
                message={t("admin.noBookings")}
                ocid="admin.bookings_empty_state"
              />
            ) : (
              bookings.map((booking, index) => (
                <TableRow
                  key={booking.id.toString()}
                  data-ocid={`admin.booking_row.${index + 1}`}
                >
                  <TableCell className="font-medium">
                    {booking.teamName}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {formatDate(booking.date, language)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {booking.time}
                  </TableCell>
                  <TableCell className="text-end font-mono tabular-nums">
                    {formatPrice(booking.priceDt, language)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "rounded-full",
                        STATUS_BADGE[booking.status],
                      )}
                    >
                      {t(`status.${booking.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      disabled={
                        cancelMutation.isPending ||
                        booking.status === BookingStatus.cancelled
                      }
                      onClick={() => cancelMutation.mutate(booking.id)}
                      data-ocid={`admin.cancel_booking_button.${index + 1}`}
                    >
                      {t("admin.cancelBooking")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

function FieldsPanel() {
  const { t, language } = useI18n();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const fieldsQuery = useQuery<FieldView[]>({
    queryKey: ["admin", "fields"],
    queryFn: async () => (actor ? actor.listFields({}) : []),
    enabled: !!actor && !isFetching,
  });

  const availabilityMutation = useMutation({
    mutationFn: async ({
      id,
      available,
    }: {
      id: FieldView["id"];
      available: boolean;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.setFieldAvailability(id, available);
    },
    onSuccess: (ok) => {
      if (!ok) {
        toast.error(t("admin.actionFailed"));
        return;
      }
      toast.success(t("admin.fieldUpdated"));
      void queryClient.invalidateQueries({ queryKey: ["admin", "fields"] });
      void queryClient.invalidateQueries({ queryKey: ["fields"] });
    },
    onError: () => toast.error(t("admin.actionFailed")),
  });

  const fields = fieldsQuery.data ?? [];

  return (
    <Card
      className="gap-0 overflow-hidden rounded-lg border-border p-0 shadow-subtle"
      data-ocid="admin.fields_panel"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <h2 className="font-display text-base font-bold tracking-tight">
          {t("admin.fieldsTitle")}
        </h2>
        <Badge variant="secondary" className="rounded-full">
          {formatNumber(fields.length, language)}
        </Badge>
      </div>

      {fieldsQuery.isLoading ? (
        <TableSkeleton />
      ) : fieldsQuery.isError ? (
        <div className="p-4">
          <ErrorState onRetry={() => void fieldsQuery.refetch()} />
        </div>
      ) : (
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead>{t("nav.fields")}</TableHead>
              <TableHead className="hidden md:table-cell">
                {t("label.city")}
              </TableHead>
              <TableHead className="text-end">{t("label.price")}</TableHead>
              <TableHead>{t("admin.colStatus")}</TableHead>
              <TableHead className="text-end">
                {t("admin.colActions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.length === 0 ? (
              <EmptyRow
                message={t("empty.fields")}
                ocid="admin.fields_empty_state"
              />
            ) : (
              fields.map((field, index) => (
                <TableRow
                  key={field.id.toString()}
                  data-ocid={`admin.field_row.${index + 1}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="font-medium">{field.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {field.location}
                  </TableCell>
                  <TableCell className="text-end font-mono tabular-nums">
                    {formatPrice(field.priceDt, language)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "rounded-full",
                        field.available
                          ? "border-transparent bg-[oklch(var(--status-available-soft))] text-[oklch(var(--status-available))]"
                          : "border-transparent bg-[oklch(var(--status-reserved-soft))] text-[oklch(var(--status-reserved))]",
                      )}
                    >
                      {field.available
                        ? t("status.available")
                        : t("status.reserved")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      disabled={availabilityMutation.isPending}
                      onClick={() =>
                        availabilityMutation.mutate({
                          id: field.id,
                          available: !field.available,
                        })
                      }
                      data-ocid={`admin.field_toggle.${index + 1}`}
                    >
                      {field.available
                        ? t("admin.markUnavailable")
                        : t("admin.markAvailable")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

function TeamsPanel() {
  const { t, language } = useI18n();
  const { actor, isFetching } = useActor(createActor);

  const teamsQuery = useQuery<TeamView[]>({
    queryKey: ["admin", "teams"],
    queryFn: async () => (actor ? actor.listTeams() : []),
    enabled: !!actor && !isFetching,
  });

  const teams = teamsQuery.data ?? [];

  return (
    <Card
      className="gap-0 overflow-hidden rounded-lg border-border p-0 shadow-subtle"
      data-ocid="admin.teams_panel"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <h2 className="font-display text-base font-bold tracking-tight">
          {t("admin.teamsTitle")}
        </h2>
        <Badge variant="secondary" className="rounded-full">
          {formatNumber(teams.length, language)}
        </Badge>
      </div>

      {teamsQuery.isLoading ? (
        <TableSkeleton />
      ) : teamsQuery.isError ? (
        <div className="p-4">
          <ErrorState onRetry={() => void teamsQuery.refetch()} />
        </div>
      ) : (
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead>{t("nav.teams")}</TableHead>
              <TableHead className="hidden md:table-cell">
                {t("label.level")}
              </TableHead>
              <TableHead className="text-end">{t("label.members")}</TableHead>
              <TableHead className="hidden sm:table-cell">
                {t("admin.colCreated")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.length === 0 ? (
              <EmptyRow
                message={t("empty.teams")}
                ocid="admin.teams_empty_state"
              />
            ) : (
              teams.map((team, index) => (
                <TableRow
                  key={team.id.toString()}
                  data-ocid={`admin.team_row.${index + 1}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="grid size-8 shrink-0 place-items-center rounded-lg text-primary-foreground"
                        style={{
                          backgroundColor:
                            team.color || "oklch(var(--primary))",
                        }}
                        aria-hidden="true"
                      >
                        <Shield className="size-4" />
                      </span>
                      <span className="font-medium">{team.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {t(`level.${team.level}`)}
                  </TableCell>
                  <TableCell className="text-end font-mono tabular-nums">
                    {formatNumber(team.playerCount, language)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {formatDateTime(team.createdAt, language)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

function MatchesPanel() {
  const { t, language } = useI18n();
  const { actor, isFetching } = useActor(createActor);

  const matchesQuery = useQuery<MatchView[]>({
    queryKey: ["admin", "matches"],
    queryFn: async () => (actor ? actor.listMatches() : []),
    enabled: !!actor && !isFetching,
  });

  const matches = matchesQuery.data ?? [];

  return (
    <Card
      className="gap-0 overflow-hidden rounded-lg border-border p-0 shadow-subtle"
      data-ocid="admin.matches_panel"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <h2 className="font-display text-base font-bold tracking-tight">
          {t("admin.matchesTitle")}
        </h2>
        <Badge variant="secondary" className="rounded-full">
          {formatNumber(matches.length, language)}
        </Badge>
      </div>

      {matchesQuery.isLoading ? (
        <TableSkeleton />
      ) : matchesQuery.isError ? (
        <div className="p-4">
          <ErrorState onRetry={() => void matchesQuery.refetch()} />
        </div>
      ) : (
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead>{t("label.date")}</TableHead>
              <TableHead className="hidden sm:table-cell">
                {t("label.time")}
              </TableHead>
              <TableHead className="hidden md:table-cell">
                {t("label.level")}
              </TableHead>
              <TableHead className="text-end">{t("label.players")}</TableHead>
              <TableHead>{t("admin.colStatus")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.length === 0 ? (
              <EmptyRow
                message={t("empty.matches")}
                ocid="admin.matches_empty_state"
              />
            ) : (
              matches.map((match, index) => (
                <TableRow
                  key={match.id.toString()}
                  data-ocid={`admin.match_row.${index + 1}`}
                >
                  <TableCell className="font-medium">
                    {formatDate(match.date, language)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {match.time}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {t(`level.${match.level}`)}
                  </TableCell>
                  <TableCell className="text-end font-mono tabular-nums">
                    {formatNumber(match.playerCount, language)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-full">
                      {t(`status.${match.status}`)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

export function AdminPage() {
  const { t, language } = useI18n();
  const { isAuthenticated, isInitializing, account } = useAuth();
  const { actor, isFetching } = useActor(createActor);

  const isAdmin = account?.role === UserRole.admin;

  const overviewQuery = useQuery<AdminOverview>({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.getAdminOverview();
    },
    enabled: !!actor && !isFetching && isAdmin,
  });

  if (isInitializing) {
    return (
      <div
        className="mx-auto max-w-6xl px-4 py-6 sm:px-6"
        data-ocid="admin.page"
      >
        <Skeleton className="h-8 w-56 rounded-lg" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => `admin-stat-${i}`).map((id) => (
            <Skeleton key={id} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <AccessDenied />;
  }

  const overview = overviewQuery.data;
  const stats = overview?.stats;

  const statCards = [
    {
      label: t("admin.statUsers"),
      value: formatNumber(stats?.totalUsers ?? 0, language),
      icon: Users,
      accent: "bg-primary-soft text-primary",
      ocid: "admin.stat_users",
    },
    {
      label: t("admin.statBookings"),
      value: formatNumber(stats?.totalBookings ?? 0, language),
      icon: CalendarDays,
      accent: "bg-[oklch(var(--info)/0.15)] text-[oklch(var(--info))]",
      ocid: "admin.stat_bookings",
    },
    {
      label: t("admin.statRevenue"),
      value: formatPrice(stats?.totalRevenueDt ?? 0, language),
      icon: CircleDollarSign,
      accent: "bg-[oklch(var(--accent)/0.2)] text-[oklch(var(--accent))]",
      ocid: "admin.stat_revenue",
    },
    {
      label: t("admin.statMatches"),
      value: formatNumber(stats?.totalMatches ?? 0, language),
      icon: TrendingUp,
      accent: "bg-[oklch(var(--chart-5)/0.18)] text-[oklch(var(--chart-5))]",
      ocid: "admin.stat_matches",
    },
    {
      label: t("admin.statTeams"),
      value: formatNumber(stats?.totalTeams ?? 0, language),
      icon: Shield,
      accent: "bg-[oklch(var(--chart-4)/0.18)] text-[oklch(var(--chart-4))]",
      ocid: "admin.stat_teams",
    },
    {
      label: t("admin.statPlayers"),
      value: formatNumber(stats?.totalPlayers ?? 0, language),
      icon: UserCheck,
      accent: "bg-[oklch(var(--chart-2)/0.18)] text-[oklch(var(--chart-2))]",
      ocid: "admin.stat_players",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6" data-ocid="admin.page">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="grid size-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow-primary"
              aria-hidden="true"
            >
              <ShieldCheck className="size-5" />
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {t("admin.title")}
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("admin.subtitle")}
          </p>
        </div>
        <Badge className="rounded-full border-transparent bg-[oklch(var(--accent)/0.2)] text-[oklch(var(--accent))]">
          {t("admin.badge")}
        </Badge>
      </header>

      {overviewQuery.isError ? (
        <div className="mt-6">
          <ErrorState onRetry={() => void overviewQuery.refetch()} />
        </div>
      ) : (
        <>
          <section
            className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
            data-ocid="admin.stats_section"
          >
            {overviewQuery.isLoading
              ? Array.from({ length: 6 }, (_, i) => `admin-stat-${i}`).map(
                  (id) => <Skeleton key={id} className="h-24 rounded-lg" />,
                )
              : statCards.map((card) => (
                  <StatCard
                    key={card.ocid}
                    label={card.label}
                    value={card.value}
                    icon={card.icon}
                    accent={card.accent}
                    ocid={card.ocid}
                  />
                ))}
          </section>

          <section
            className="mt-6 grid gap-4 lg:grid-cols-2"
            data-ocid="admin.charts_section"
          >
            {overviewQuery.isLoading ? (
              <>
                <Skeleton className="h-72 rounded-lg" />
                <Skeleton className="h-72 rounded-lg" />
              </>
            ) : (
              <>
                <RevenueChart data={overview?.revenueByMonth ?? []} />
                <BookingsStatusChart data={overview?.bookingsByStatus ?? []} />
              </>
            )}
          </section>
        </>
      )}

      <section className="mt-8" data-ocid="admin.management_section">
        <Tabs defaultValue="users">
          <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
            <TabsTrigger value="users" data-ocid="admin.users_tab">
              {t("admin.tabUsers")}
            </TabsTrigger>
            <TabsTrigger value="bookings" data-ocid="admin.bookings_tab">
              {t("admin.tabBookings")}
            </TabsTrigger>
            <TabsTrigger value="fields" data-ocid="admin.fields_tab">
              {t("admin.tabFields")}
            </TabsTrigger>
            <TabsTrigger value="teams" data-ocid="admin.teams_tab">
              {t("admin.tabTeams")}
            </TabsTrigger>
            <TabsTrigger value="matches" data-ocid="admin.matches_tab">
              {t("admin.tabMatches")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            <UsersPanel />
          </TabsContent>
          <TabsContent value="bookings" className="mt-4">
            <BookingsPanel />
          </TabsContent>
          <TabsContent value="fields" className="mt-4">
            <FieldsPanel />
          </TabsContent>
          <TabsContent value="teams" className="mt-4">
            <TeamsPanel />
          </TabsContent>
          <TabsContent value="matches" className="mt-4">
            <MatchesPanel />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
