import { QrCode } from "@/components/QrCode";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n";
import { createActor } from "@/lib/backend";
import { formatDate, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BookingStatus, BookingView, FieldView } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Hash,
  MapPin,
  QrCode as QrIcon,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import { toast } from "sonner";

function statusKey(status: BookingStatus) {
  if (status === "paid") return "confirm.statusPaid" as const;
  if (status === "cancelled") return "confirm.statusCancelled" as const;
  return "confirm.statusPending" as const;
}

function durationLabel(
  minutes: bigint,
  t: (
    key: "booking.duration60" | "booking.duration90" | "booking.duration120",
  ) => string,
) {
  const value = Number(minutes);
  if (value === 60) return t("booking.duration60");
  if (value === 90) return t("booking.duration90");
  return t("booking.duration120");
}

export function BookingConfirmationPage() {
  const { t, language } = useI18n();
  const { bookingId } = useParams({ from: "/booking-confirmation/$bookingId" });
  const { actor, isFetching } = useActor(createActor);
  const ready = !!actor && !isFetching;

  const bookingQuery = useQuery<BookingView | null>({
    queryKey: ["booking", bookingId],
    queryFn: async () => (actor ? actor.getBooking(BigInt(bookingId)) : null),
    enabled: ready,
  });

  const booking = bookingQuery.data ?? null;

  const fieldQuery = useQuery<FieldView | null>({
    queryKey: ["field", booking?.fieldId.toString() ?? "none"],
    queryFn: async () =>
      actor && booking ? actor.getField(booking.fieldId) : null,
    enabled: ready && !!booking,
  });

  const field = fieldQuery.data ?? null;

  if (bookingQuery.isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="mt-4 h-72 rounded-2xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div
        className="mx-auto max-w-2xl px-4 py-10 text-center sm:px-6"
        data-ocid="confirmation.not_found_state"
      >
        <Card className="items-center gap-3 rounded-2xl border-dashed p-10">
          <p className="font-display text-base font-bold">
            {t("confirm.notFound")}
          </p>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/fields" search={{}} data-ocid="confirmation.back_button">
              {t("booking.backToFields")}
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const isPaid = booking.status === "paid";
  const qrPayload = [
    "AYA NKAWROU?",
    `RES:${booking.id.toString()}`,
    `FIELD:${field?.name ?? booking.fieldId.toString()}`,
    `DATE:${booking.date}`,
    `TIME:${booking.time}`,
    `TEAM:${booking.teamName}`,
    booking.paymentReference ? `REF:${booking.paymentReference}` : "",
  ]
    .filter(Boolean)
    .join("|");

  const rows = [
    {
      label: t("confirm.field"),
      value: field?.name ?? `#${booking.fieldId}`,
      icon: MapPin,
    },
    {
      label: t("confirm.date"),
      value: formatDate(booking.date, language),
      icon: CalendarDays,
    },
    { label: t("confirm.time"), value: booking.time, icon: Clock },
    {
      label: t("confirm.duration"),
      value: durationLabel(booking.durationMinutes, t),
      icon: Clock,
    },
    { label: t("confirm.team"), value: booking.teamName, icon: Users },
    {
      label: t("confirm.players"),
      value: String(Number(booking.playerCount)),
      icon: Users,
    },
  ];

  return (
    <div
      className="mx-auto max-w-2xl px-4 py-6 sm:px-6"
      data-ocid="confirmation.page"
    >
      <Card
        className={cn(
          "items-center gap-3 rounded-2xl border-border p-6 text-center shadow-elevated",
          isPaid ? "bg-gradient-subtle" : "",
        )}
        data-ocid="confirmation.success_state"
      >
        <span
          className={cn(
            "grid size-16 place-items-center rounded-full text-primary-foreground shadow-glow-primary",
            isPaid ? "bg-gradient-primary" : "bg-warning",
          )}
          aria-hidden="true"
        >
          <CheckCircle2 className="size-8" />
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {isPaid ? t("confirm.title") : t("confirm.statusPending")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("confirm.subtitle")}</p>
        <Badge
          variant={isPaid ? "default" : "secondary"}
          className="rounded-full"
          data-ocid="confirmation.status_badge"
        >
          {t(statusKey(booking.status))}
        </Badge>
      </Card>

      <Card
        className="mt-5 gap-4 rounded-2xl border-border p-5 shadow-subtle"
        data-ocid="confirmation.details_card"
      >
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/50 px-4 py-3">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Hash className="size-4" aria-hidden="true" />
            {t("confirm.bookingNumber")}
          </span>
          <span
            className="font-mono text-lg font-bold text-primary"
            data-ocid="confirmation.booking_number"
          >
            #{booking.id.toString()}
          </span>
        </div>

        <dl className="divide-y divide-border">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                  {row.label}
                </dt>
                <dd className="truncate text-sm font-semibold">{row.value}</dd>
              </div>
            );
          })}
        </dl>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm font-medium text-muted-foreground">
            {t("confirm.amountPaid")}
          </span>
          <span className="font-display text-xl font-bold text-primary">
            {formatPrice(booking.priceDt, language)}
          </span>
        </div>

        {booking.paymentReference ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            {t("confirm.reference")}:{" "}
            <span className="font-mono">{booking.paymentReference}</span>
          </p>
        ) : null}
      </Card>

      <Card
        className="mt-5 items-center gap-3 rounded-2xl border-border p-6 text-center shadow-subtle"
        data-ocid="confirmation.qr_card"
      >
        <span className="flex items-center gap-2 font-display text-sm font-bold">
          <QrIcon className="size-4 text-primary" aria-hidden="true" />
          {t("confirm.bookingNumber")}
        </span>
        <div className="rounded-2xl border border-border bg-white p-3 shadow-subtle">
          <QrCode
            value={qrPayload}
            size={196}
            label={`${t("confirm.bookingNumber")} #${booking.id.toString()}`}
          />
        </div>
        <p className="max-w-xs text-xs text-muted-foreground">
          {t("confirm.qrHint")}
        </p>
      </Card>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button asChild variant="outline" className="h-12 flex-1 rounded-full">
          <Link
            to="/bookings"
            search={{}}
            data-ocid="confirmation.view_bookings_button"
          >
            <Ticket className="size-4" aria-hidden="true" />
            {t("confirm.viewBookings")}
          </Link>
        </Button>
        <Button asChild className="h-12 flex-1 rounded-full">
          <Link
            to="/fields"
            search={{}}
            data-ocid="confirmation.book_another_button"
          >
            {t("confirm.bookAnother")}
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function MyBookingsPage() {
  const { t, language } = useI18n();
  const { isAuthenticated, isInitializing, login } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const ready = !!actor && !isFetching;

  const bookingsQuery = useQuery<BookingView[]>({
    queryKey: ["myBookings"],
    queryFn: async () => (actor ? actor.listMyBookings() : []),
    enabled: ready && isAuthenticated,
  });

  const fieldsQuery = useQuery<FieldView[]>({
    queryKey: ["fields", "all"],
    queryFn: async () => (actor ? actor.listFields({}) : []),
    enabled: ready,
  });

  const cancelMutation = useMutation<boolean, Error, bigint>({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.cancelBooking(bookingId);
    },
    onSuccess: (ok) => {
      if (ok) {
        toast.success(t("bookings.cancelled"));
        void queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      } else {
        toast.error(t("bookings.cancelError"));
      }
    },
    onError: () => toast.error(t("bookings.cancelError")),
  });

  const bookings = [...(bookingsQuery.data ?? [])].sort((a, b) =>
    Number(b.createdAt - a.createdAt),
  );
  const fields = fieldsQuery.data ?? [];
  const fieldName = (id: bigint) =>
    fields.find((field) => field.id === id)?.name ?? `#${id}`;

  if (!isAuthenticated && !isInitializing) {
    return (
      <div
        className="mx-auto max-w-3xl px-4 py-10 sm:px-6"
        data-ocid="bookings.login_required_state"
      >
        <Card className="items-center gap-3 rounded-2xl border-border p-10 text-center shadow-subtle">
          <span
            className="grid size-12 place-items-center rounded-full bg-primary-soft text-2xl"
            aria-hidden="true"
          >
            🎟️
          </span>
          <p className="font-display text-base font-bold">
            {t("bookings.loginRequired")}
          </p>
          <Button
            type="button"
            onClick={() => login()}
            className="rounded-full"
            data-ocid="bookings.login_button"
          >
            {t("action.login")}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="mx-auto max-w-3xl px-4 py-6 sm:px-6"
      data-ocid="bookings.page"
    >
      <header className="mb-5">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {t("bookings.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("bookings.subtitle")}
        </p>
      </header>

      {bookingsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => `booking-skeleton-${i}`).map(
            (id) => (
              <Skeleton key={id} className="h-28 rounded-2xl" />
            ),
          )}
        </div>
      ) : bookings.length === 0 ? (
        <Card
          className="items-center gap-2 rounded-2xl border-dashed p-10 text-center"
          data-ocid="bookings.empty_state"
        >
          <span
            className="grid size-12 place-items-center rounded-full bg-primary-soft text-2xl"
            aria-hidden="true"
          >
            🎟️
          </span>
          <p className="font-display text-sm font-bold">
            {t("bookings.empty")}
          </p>
          <p className="max-w-sm text-xs text-muted-foreground">
            {t("bookings.emptyHint")}
          </p>
          <Button asChild className="mt-1 rounded-full">
            <Link to="/fields" search={{}} data-ocid="bookings.browse_button">
              {t("action.bookField")}
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3" data-ocid="bookings.list">
          {bookings.map((booking, index) => (
            <Card
              key={booking.id.toString()}
              className="gap-3 rounded-2xl border-border p-4 shadow-subtle"
              data-ocid={`bookings.item.${index + 1}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold">
                    {fieldName(booking.fieldId)}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      {formatDate(booking.date, language)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" aria-hidden="true" />
                      {booking.time}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="size-3.5" aria-hidden="true" />
                      {booking.teamName}
                    </span>
                  </p>
                </div>
                <Badge
                  variant={
                    booking.status === "paid"
                      ? "default"
                      : booking.status === "cancelled"
                        ? "destructive"
                        : "secondary"
                  }
                  className="shrink-0 rounded-full"
                >
                  {t(statusKey(booking.status))}
                </Badge>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="font-display text-sm font-bold text-primary">
                  {formatPrice(booking.priceDt, language)}
                </span>
                <div className="flex items-center gap-2">
                  {booking.status !== "cancelled" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelMutation.mutate(booking.id)}
                      disabled={cancelMutation.isPending}
                      className="rounded-full text-muted-foreground"
                      data-ocid={`bookings.cancel_button.${index + 1}`}
                    >
                      {t("bookings.cancel")}
                    </Button>
                  ) : null}
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                  >
                    <Link
                      to="/booking-confirmation/$bookingId"
                      params={{ bookingId: booking.id.toString() }}
                      search={{}}
                      data-ocid={`bookings.view_button.${index + 1}`}
                    >
                      {t("bookings.view")}
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
