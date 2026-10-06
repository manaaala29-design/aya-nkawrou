import {
  type FieldFilterValues,
  FieldFilters,
} from "@/components/FieldFilters";
import { RatingStars } from "@/components/RatingStars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n";
import { createActor } from "@/lib/backend";
import { formatDistance, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FieldView } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  Clock,
  Compass,
  Crosshair,
  Loader2,
  MapPin,
  Navigation,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";

type GeoState = "idle" | "loading" | "granted" | "denied" | "unsupported";

function FieldSkeleton() {
  const ids = Array.from({ length: 6 }, (_, i) => `field-skeleton-${i}`);
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {ids.map((id) => (
        <Skeleton key={id} className="h-72 rounded-2xl" />
      ))}
    </div>
  );
}

function StaticMap({
  fields,
  userPosition,
}: {
  fields: FieldView[];
  userPosition: { lat: number; lng: number } | null;
}) {
  const { t } = useI18n();
  const maxDistance = Math.max(...fields.map((f) => f.distanceKm), 1);

  return (
    <Card
      className="gap-3 overflow-hidden rounded-2xl border-border p-4 shadow-subtle"
      data-ocid="fields.map_panel"
    >
      <div className="flex items-center gap-2">
        <Compass className="size-4 text-primary" aria-hidden="true" />
        <h2 className="font-display text-sm font-bold">
          {t("fields.mapTitle")}
        </h2>
      </div>
      <div
        className="pitch-lines relative h-56 overflow-hidden rounded-xl border border-border bg-gradient-subtle"
        data-ocid="fields.map_canvas"
      >
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(oklch(var(--border) / 0.5) 1px, transparent 1px), linear-gradient(90deg, oklch(var(--border) / 0.5) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        {userPosition ? (
          <span
            className="absolute start-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
            title={t("fields.youAreHere")}
          >
            <span className="relative grid size-4 place-items-center">
              <span className="absolute size-8 animate-ping rounded-full bg-info/30" />
              <span className="size-3 rounded-full border-2 border-background bg-info" />
            </span>
          </span>
        ) : null}
        {fields.map((field, index) => {
          const angle = (index / Math.max(fields.length, 1)) * Math.PI * 2;
          const radius = 18 + (field.distanceKm / maxDistance) * 30;
          const left = 50 + Math.cos(angle) * radius;
          const top = 50 + Math.sin(angle) * radius;
          return (
            <span
              key={field.id.toString()}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${left}%`, top: `${top}%` }}
              title={`${field.name} · ${field.distanceKm} km`}
            >
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full border-2 border-background text-[10px] font-bold text-primary-foreground shadow-subtle",
                  field.available ? "bg-primary" : "bg-destructive",
                )}
                data-ocid={`fields.map_marker.${index + 1}`}
              >
                {index + 1}
              </span>
            </span>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{t("fields.mapHint")}</p>
    </Card>
  );
}

export function FieldsPage() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const search = useSearch({ from: "/fields" });
  const { actor, isFetching } = useActor(createActor);
  const ready = !!actor && !isFetching;

  const [geoState, setGeoState] = useState<GeoState>("idle");
  const [userPosition, setUserPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const fieldsQuery = useQuery<FieldView[]>({
    queryKey: ["fields", "all"],
    queryFn: async () => (actor ? actor.listFields({}) : []),
    enabled: ready,
  });

  const fields = fieldsQuery.data ?? [];

  const filters: FieldFilterValues = useMemo(
    () => ({
      search: search.search ?? "",
      maxPrice: search.maxPrice ?? null,
      maxDistanceKm: search.maxDistanceKm ?? null,
      minRating: search.minRating ?? null,
      timeSlot: search.timeSlot ?? null,
    }),
    [
      search.search,
      search.maxPrice,
      search.maxDistanceKm,
      search.minRating,
      search.timeSlot,
    ],
  );

  const timeSlotOptions = useMemo(() => {
    const set = new Set<string>();
    for (const field of fields) {
      for (const slot of field.timeSlots) set.add(slot);
    }
    return [...set].sort();
  }, [fields]);

  const updateFilters = (next: FieldFilterValues) => {
    void navigate({
      to: "/fields",
      search: {
        search: next.search || undefined,
        maxPrice: next.maxPrice ?? undefined,
        maxDistanceKm: next.maxDistanceKm ?? undefined,
        minRating: next.minRating ?? undefined,
        timeSlot: next.timeSlot ?? undefined,
      },
      replace: true,
    });
  };

  const resetFilters = () => {
    void navigate({ to: "/fields", search: {}, replace: true });
  };

  const requestLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("unsupported");
      return;
    }
    setGeoState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoState("granted");
      },
      () => setGeoState("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  };

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const result = fields.filter((field) => {
      if (
        query &&
        !field.name.toLowerCase().includes(query) &&
        !field.location.toLowerCase().includes(query)
      ) {
        return false;
      }
      if (filters.maxPrice !== null && field.priceDt > filters.maxPrice) {
        return false;
      }
      if (
        filters.maxDistanceKm !== null &&
        field.distanceKm > filters.maxDistanceKm
      ) {
        return false;
      }
      if (filters.minRating !== null && field.rating < filters.minRating) {
        return false;
      }
      if (
        filters.timeSlot !== null &&
        !field.timeSlots.includes(filters.timeSlot)
      ) {
        return false;
      }
      return true;
    });
    if (geoState === "granted") {
      return [...result].sort((a, b) => a.distanceKm - b.distanceKm);
    }
    return result;
  }, [fields, filters, geoState]);

  const mapFields = useMemo(
    () => [...filtered].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 7),
    [filtered],
  );

  return (
    <div
      className="mx-auto max-w-6xl px-4 py-6 sm:px-6"
      data-ocid="fields.page"
    >
      <header className="mb-5">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("fields.title")}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {t("fields.subtitle")}
        </p>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={geoState === "granted" ? "default" : "outline"}
          onClick={requestLocation}
          disabled={geoState === "loading"}
          className="rounded-full"
          data-ocid="fields.near_me_button"
        >
          {geoState === "loading" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Crosshair className="size-4" aria-hidden="true" />
          )}
          {t("fields.nearMe")}
        </Button>
        {geoState === "granted" ? (
          <Badge
            variant="secondary"
            className="rounded-full"
            data-ocid="fields.near_me_active"
          >
            <Navigation className="size-3" aria-hidden="true" />
            {t("fields.nearMeActive")}
          </Badge>
        ) : null}
      </div>

      {geoState === "denied" ? (
        <p
          className="mb-4 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs font-medium text-warning-foreground"
          data-ocid="fields.geo_denied"
        >
          {t("fields.nearMeDenied")}
        </p>
      ) : null}
      {geoState === "unsupported" ? (
        <p
          className="mb-4 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs font-medium text-warning-foreground"
          data-ocid="fields.geo_unsupported"
        >
          {t("fields.nearMeUnsupported")}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-5">
          <FieldFilters
            values={filters}
            onChange={updateFilters}
            onReset={resetFilters}
            timeSlotOptions={timeSlotOptions}
            resultCount={filtered.length}
          />

          {fieldsQuery.isLoading ? (
            <FieldSkeleton />
          ) : fieldsQuery.isError ? (
            <Card
              className="items-center gap-3 rounded-2xl border-destructive/40 p-8 text-center"
              data-ocid="fields.error_state"
            >
              <p className="font-display text-sm font-bold">
                {t("error.title")}
              </p>
              <p className="text-xs text-muted-foreground">{t("error.hint")}</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void fieldsQuery.refetch()}
                className="rounded-full"
                data-ocid="fields.retry_button"
              >
                {t("action.retry")}
              </Button>
            </Card>
          ) : filtered.length === 0 ? (
            <Card
              className="items-center gap-2 rounded-2xl border-dashed p-10 text-center"
              data-ocid="fields.empty_state"
            >
              <span
                className="grid size-12 place-items-center rounded-full bg-primary-soft text-2xl"
                aria-hidden="true"
              >
                ⚽
              </span>
              <p className="font-display text-sm font-bold">
                {t("empty.fields")}
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                {t("empty.fieldsHint")}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
                className="mt-1 rounded-full"
                data-ocid="fields.empty_reset_button"
              >
                {t("fields.reset")}
              </Button>
            </Card>
          ) : (
            <div
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
              data-ocid="fields.list"
            >
              {filtered.map((field, index) => (
                <Card
                  key={field.id.toString()}
                  className="group gap-0 overflow-hidden rounded-2xl border-border p-0 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
                  data-ocid={`fields.card.${index + 1}`}
                >
                  <div className="relative h-36 w-full overflow-hidden bg-muted">
                    {field.imageUrl ? (
                      <img
                        src={field.imageUrl}
                        alt={field.name}
                        loading="lazy"
                        className="size-full object-cover transition-smooth group-hover:scale-105"
                      />
                    ) : (
                      <div className="pitch-lines size-full bg-gradient-primary opacity-90" />
                    )}
                    <Badge
                      variant={field.available ? "default" : "destructive"}
                      className="absolute end-2 top-2 rounded-full"
                      data-ocid={`fields.status.${index + 1}`}
                    >
                      {field.available
                        ? t("status.available")
                        : t("status.reserved")}
                    </Badge>
                    <span className="absolute start-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-xs font-semibold backdrop-blur-sm">
                      <Star
                        className="size-3 fill-accent text-accent"
                        aria-hidden="true"
                      />
                      {field.rating.toFixed(1)}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-base font-bold">
                        {field.name}
                      </h2>
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                        <MapPin
                          className="size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        {field.location}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <RatingStars value={field.rating} />
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Navigation className="size-3.5" aria-hidden="true" />
                        {formatDistance(field.distanceKm, language)}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Clock className="size-3.5" aria-hidden="true" />
                        {t("fields.slots")}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {field.timeSlots.length === 0 ? (
                          <span className="text-xs text-muted-foreground">
                            {t("fields.noSlots")}
                          </span>
                        ) : (
                          field.timeSlots.map((slot) => (
                            <span
                              key={slot}
                              className="rounded-md border border-border bg-secondary px-2 py-0.5 font-mono text-[11px] font-medium"
                            >
                              {slot}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                      <span className="font-display text-base font-bold text-primary">
                        {formatPrice(field.priceDt, language)}
                        <span className="text-xs font-medium text-muted-foreground">
                          {" "}
                          {t("label.perHour")}
                        </span>
                      </span>
                      {field.available ? (
                        <Button
                          asChild
                          size="sm"
                          className="rounded-full"
                          data-ocid={`fields.book_button.${index + 1}`}
                        >
                          <Link
                            to="/booking/$fieldId"
                            params={{ fieldId: field.id.toString() }}
                            search={{}}
                          >
                            {t("fields.book")}
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled
                          className="rounded-full"
                          data-ocid={`fields.unavailable_button.${index + 1}`}
                        >
                          {t("fields.unavailable")}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <StaticMap fields={mapFields} userPosition={userPosition} />
        </aside>
      </div>
    </div>
  );
}
