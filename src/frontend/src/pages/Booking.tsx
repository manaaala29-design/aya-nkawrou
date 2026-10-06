import { PaymentForm } from "@/components/PaymentForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n";
import { createActor } from "@/lib/backend";
import { formatDate, formatPrice, toDateInputValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BookingView, FieldView, PaymentResult } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Loader2,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";

type Step = "details" | "summary" | "payment";

const DURATIONS = [60, 90, 120] as const;

function StepIndicator({ step }: { step: Step }) {
  const { t } = useI18n();
  const steps: { key: Step; label: string }[] = [
    { key: "details", label: t("booking.stepDetails") },
    { key: "summary", label: t("booking.stepSummary") },
    { key: "payment", label: t("booking.stepPayment") },
  ];
  const activeIndex = steps.findIndex((entry) => entry.key === step);

  return (
    <ol
      className="flex items-center gap-2"
      aria-label={t("booking.title")}
      data-ocid="booking.steps"
    >
      {steps.map((entry, index) => {
        const done = index < activeIndex;
        const active = index === activeIndex;
        return (
          <li key={entry.key} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-smooth",
                done && "bg-primary text-primary-foreground",
                active &&
                  "bg-primary text-primary-foreground ring-4 ring-primary/20",
                !done && !active && "bg-muted text-muted-foreground",
              )}
              aria-current={active ? "step" : undefined}
            >
              {done ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={cn(
                "hidden truncate text-xs font-medium sm:block",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {entry.label}
            </span>
            {index < steps.length - 1 ? (
              <span
                className={cn("h-px flex-1", done ? "bg-primary" : "bg-border")}
                aria-hidden="true"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export function BookingPage() {
  const { t, language } = useI18n();
  const { fieldId } = useParams({ from: "/booking/$fieldId" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, isInitializing, login } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const ready = !!actor && !isFetching;

  const [step, setStep] = useState<Step>("details");
  const [date, setDate] = useState(() => toDateInputValue(new Date()));
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState<number>(60);
  const [playerCount, setPlayerCount] = useState(10);
  const [teamName, setTeamName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<BookingView | null>(
    null,
  );

  const fieldQuery = useQuery<FieldView | null>({
    queryKey: ["field", fieldId],
    queryFn: async () => (actor ? actor.getField(BigInt(fieldId)) : null),
    enabled: ready,
  });

  const field = fieldQuery.data ?? null;

  const createMutation = useMutation<BookingView, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createBooking({
        fieldId: BigInt(fieldId),
        date,
        time,
        durationMinutes: BigInt(duration),
        playerCount: BigInt(playerCount),
        teamName: teamName.trim(),
      });
    },
    onSuccess: (booking) => {
      setCreatedBooking(booking);
      setStep("payment");
    },
    onError: () => setFormError(t("booking.createError")),
  });

  const durationLabel = useMemo(() => {
    if (duration === 60) return t("booking.duration60");
    if (duration === 90) return t("booking.duration90");
    return t("booking.duration120");
  }, [duration, t]);

  const handleDetailsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!time) {
      setFormError(t("booking.selectSlot"));
      return;
    }
    if (teamName.trim().length < 2) {
      setFormError(t("booking.required"));
      return;
    }
    if (playerCount < 2 || playerCount > 22) {
      setFormError(t("booking.playersRange"));
      return;
    }
    setStep("summary");
  };

  const handleConfirm = () => {
    setFormError(null);
    createMutation.mutate();
  };

  const handlePaymentSuccess = (result: PaymentResult) => {
    if (result.__kind__ === "ok") {
      void queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      void navigate({
        to: "/booking-confirmation/$bookingId",
        params: { bookingId: result.ok.id.toString() },
        search: {},
      });
    } else {
      setFormError(result.err);
    }
  };

  if (fieldQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-96 rounded-2xl" />
      </div>
    );
  }

  if (!field) {
    return (
      <div
        className="mx-auto max-w-3xl px-4 py-10 text-center sm:px-6"
        data-ocid="booking.not_found_state"
      >
        <Card className="items-center gap-3 rounded-2xl border-dashed p-10">
          <p className="font-display text-base font-bold">
            {t("booking.notFound")}
          </p>
          <Button asChild variant="outline" className="rounded-full">
            <Link
              to="/fields"
              search={{}}
              data-ocid="booking.back_to_fields_button"
            >
              {t("booking.backToFields")}
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated && !isInitializing) {
    return (
      <div
        className="mx-auto max-w-3xl px-4 py-10 sm:px-6"
        data-ocid="booking.login_required_state"
      >
        <Card className="items-center gap-3 rounded-2xl border-border p-10 text-center shadow-subtle">
          <span
            className="grid size-12 place-items-center rounded-full bg-primary-soft text-2xl"
            aria-hidden="true"
          >
            🔒
          </span>
          <p className="font-display text-base font-bold">
            {t("booking.loginRequired")}
          </p>
          <Button
            type="button"
            onClick={() => login()}
            className="rounded-full"
            data-ocid="booking.login_button"
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
      data-ocid="booking.page"
    >
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="mb-4 -ms-2 rounded-full text-muted-foreground"
      >
        <Link to="/fields" search={{}} data-ocid="booking.back_button">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t("booking.backToFields")}
        </Link>
      </Button>

      <header className="mb-5">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {t("booking.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{field.name}</p>
      </header>

      <div className="mb-6">
        <StepIndicator step={step} />
      </div>

      <Card className="gap-5 rounded-2xl border-border p-5 shadow-subtle sm:p-6">
        {step === "details" ? (
          <form onSubmit={handleDetailsSubmit} className="space-y-5" noValidate>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-3">
              <span
                className="grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-primary text-lg"
                aria-hidden="true"
              >
                ⚽
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold">
                  {field.name}
                </p>
                <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {field.location}
                </p>
              </div>
              <span className="ms-auto shrink-0 font-display text-sm font-bold text-primary">
                {formatPrice(field.priceDt, language)}
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking-date">{t("booking.date")}</Label>
              <Input
                id="booking-date"
                type="date"
                value={date}
                min={toDateInputValue(new Date())}
                onChange={(event) => setDate(event.target.value)}
                className="h-11"
                data-ocid="booking.date_input"
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="mb-2 text-sm font-medium">
                {t("booking.time")}
              </legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {field.timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    aria-pressed={time === slot}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 font-mono text-sm font-medium transition-smooth",
                      time === slot
                        ? "border-primary bg-primary text-primary-foreground shadow-subtle"
                        : "border-border bg-card hover:border-primary/50 hover:bg-accent",
                    )}
                    data-ocid={`booking.time_slot.${slot.replace(":", "")}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="mb-2 text-sm font-medium">
                {t("booking.duration")}
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {DURATIONS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDuration(value)}
                    aria-pressed={duration === value}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-sm font-medium transition-smooth",
                      duration === value
                        ? "border-primary bg-primary text-primary-foreground shadow-subtle"
                        : "border-border bg-card hover:border-primary/50 hover:bg-accent",
                    )}
                    data-ocid={`booking.duration.${value}`}
                  >
                    {value === 60
                      ? t("booking.duration60")
                      : value === 90
                        ? t("booking.duration90")
                        : t("booking.duration120")}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="booking-players">{t("booking.players")}</Label>
                <Input
                  id="booking-players"
                  type="number"
                  min={2}
                  max={22}
                  value={playerCount}
                  onChange={(event) =>
                    setPlayerCount(Number(event.target.value))
                  }
                  className="h-11"
                  data-ocid="booking.players_input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking-team">{t("booking.teamName")}</Label>
                <Input
                  id="booking-team"
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  placeholder={t("booking.teamNamePlaceholder")}
                  className="h-11"
                  data-ocid="booking.team_name_input"
                />
              </div>
            </div>

            {formError ? (
              <p
                className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
                data-ocid="booking.form_error"
              >
                {formError}
              </p>
            ) : null}

            <Button
              type="submit"
              className="h-12 w-full rounded-full text-base font-semibold"
              data-ocid="booking.continue_button"
            >
              {t("booking.continue")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </form>
        ) : null}

        {step === "summary" ? (
          <div className="space-y-5">
            <h2 className="font-display text-lg font-bold">
              {t("booking.summaryTitle")}
            </h2>

            <dl className="divide-y divide-border rounded-xl border border-border">
              {[
                {
                  label: t("booking.field"),
                  value: field.name,
                  icon: MapPin,
                },
                {
                  label: t("booking.date"),
                  value: formatDate(date, language),
                  icon: CalendarDays,
                },
                { label: t("booking.time"), value: time, icon: Clock },
                {
                  label: t("booking.duration"),
                  value: durationLabel,
                  icon: Clock,
                },
                {
                  label: t("booking.players"),
                  value: String(playerCount),
                  icon: Users,
                },
                {
                  label: t("booking.teamName"),
                  value: teamName,
                  icon: Users,
                },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className="size-4" aria-hidden="true" />
                      {row.label}
                    </dt>
                    <dd className="truncate text-sm font-semibold">
                      {row.value}
                    </dd>
                  </div>
                );
              })}
            </dl>

            <div className="flex items-center justify-between rounded-xl bg-gradient-primary px-4 py-3 text-primary-foreground">
              <span className="text-sm font-medium">{t("booking.total")}</span>
              <span className="font-display text-xl font-bold">
                {formatPrice(field.priceDt, language)}
              </span>
            </div>

            {formError ? (
              <p
                className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
                data-ocid="booking.form_error"
              >
                {formError}
              </p>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("details")}
                disabled={createMutation.isPending}
                className="h-12 flex-1 rounded-full"
                data-ocid="booking.back_to_details_button"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                {t("booking.back")}
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={createMutation.isPending}
                className="h-12 flex-1 rounded-full text-base font-semibold"
                data-ocid="booking.pay_now_button"
              >
                {createMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="size-4" aria-hidden="true" />
                )}
                {t("booking.payNow")}
              </Button>
            </div>
          </div>
        ) : null}

        {step === "payment" && createdBooking ? (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full">
                {t("booking.stepPayment")}
              </Badge>
              <span className="text-xs text-muted-foreground">
                #{createdBooking.id.toString()}
              </span>
            </div>
            <PaymentForm
              bookingId={createdBooking.id}
              amountDt={createdBooking.priceDt}
              onSuccess={handlePaymentSuccess}
            />
          </div>
        ) : null}
      </Card>
    </div>
  );
}
