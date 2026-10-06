import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useI18n } from "@/i18n";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

export type FieldFilterValues = {
  search: string;
  maxPrice: number | null;
  maxDistanceKm: number | null;
  minRating: number | null;
  timeSlot: string | null;
};

export const EMPTY_FILTERS: FieldFilterValues = {
  search: "",
  maxPrice: null,
  maxDistanceKm: null,
  minRating: null,
  timeSlot: null,
};

const PRICE_MAX = 10;
const DISTANCE_MAX = 8;
const RATING_STEPS = [0, 3, 3.5, 4, 4.5];

export function FieldFilters({
  values,
  onChange,
  onReset,
  timeSlotOptions,
  resultCount,
}: {
  values: FieldFilterValues;
  onChange: (next: FieldFilterValues) => void;
  onReset: () => void;
  timeSlotOptions: string[];
  resultCount: number;
}) {
  const { t, language } = useI18n();
  const [expanded, setExpanded] = useState(false);

  const activeCount = [
    values.maxPrice !== null,
    values.maxDistanceKm !== null,
    values.minRating !== null,
    values.timeSlot !== null,
  ].filter(Boolean).length;

  const update = (patch: Partial<FieldFilterValues>) =>
    onChange({ ...values, ...patch });

  return (
    <section
      className="rounded-2xl border border-border bg-card p-4 shadow-subtle"
      data-ocid="fields.filters_panel"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={values.search}
            onChange={(event) => update({ search: event.target.value })}
            placeholder={t("fields.searchPlaceholder")}
            aria-label={t("fields.searchLabel")}
            className="h-11 rounded-full ps-9"
            data-ocid="fields.search_input"
          />
        </div>

        <Button
          type="button"
          variant={expanded ? "default" : "outline"}
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="h-11 shrink-0 rounded-full"
          data-ocid="fields.filters_toggle"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          {t("fields.filters")}
          {activeCount > 0 ? (
            <Badge
              variant="secondary"
              className="ms-1 size-5 justify-center rounded-full p-0 text-[10px]"
            >
              {activeCount}
            </Badge>
          ) : null}
        </Button>
      </div>

      {expanded ? (
        <div
          className="mt-4 grid gap-5 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4"
          data-ocid="fields.filters_body"
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="filter-price">{t("fields.maxPrice")}</Label>
              <span className="text-xs font-medium text-primary">
                {values.maxPrice === null
                  ? t("fields.anyPrice")
                  : formatPrice(values.maxPrice, language)}
              </span>
            </div>
            <Slider
              id="filter-price"
              min={0}
              max={PRICE_MAX}
              step={0.5}
              value={[values.maxPrice ?? PRICE_MAX]}
              onValueChange={([next]) =>
                update({ maxPrice: next >= PRICE_MAX ? null : next })
              }
              aria-label={t("fields.maxPrice")}
              data-ocid="fields.price_slider"
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="filter-distance">{t("fields.maxDistance")}</Label>
              <span className="text-xs font-medium text-primary">
                {values.maxDistanceKm === null
                  ? t("fields.anyDistance")
                  : `${values.maxDistanceKm} ${t("fields.kmAway")}`}
              </span>
            </div>
            <Slider
              id="filter-distance"
              min={0}
              max={DISTANCE_MAX}
              step={0.5}
              value={[values.maxDistanceKm ?? DISTANCE_MAX]}
              onValueChange={([next]) =>
                update({ maxDistanceKm: next >= DISTANCE_MAX ? null : next })
              }
              aria-label={t("fields.maxDistance")}
              data-ocid="fields.distance_slider"
            />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="filter-rating">{t("fields.minRating")}</Label>
            <Select
              value={
                values.minRating === null ? "any" : String(values.minRating)
              }
              onValueChange={(next) =>
                update({ minRating: next === "any" ? null : Number(next) })
              }
            >
              <SelectTrigger
                id="filter-rating"
                className="h-10 w-full"
                data-ocid="fields.rating_select"
              >
                <SelectValue placeholder={t("fields.anyRating")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{t("fields.anyRating")}</SelectItem>
                {RATING_STEPS.slice(1).map((rating) => (
                  <SelectItem key={rating} value={String(rating)}>
                    {rating.toFixed(1)} ★
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="filter-time">{t("fields.timeSlot")}</Label>
            <Select
              value={values.timeSlot ?? "any"}
              onValueChange={(next) =>
                update({ timeSlot: next === "any" ? null : next })
              }
            >
              <SelectTrigger
                id="filter-time"
                className="h-10 w-full"
                data-ocid="fields.time_select"
              >
                <SelectValue placeholder={t("fields.anyTime")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{t("fields.anyTime")}</SelectItem>
                {timeSlotOptions.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-3">
        <p
          className="text-xs text-muted-foreground"
          data-ocid="fields.results_count"
        >
          <span className="font-display font-bold text-foreground">
            {resultCount}
          </span>{" "}
          {t("fields.results")}
        </p>
        {activeCount > 0 || values.search ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className={cn("rounded-full text-muted-foreground")}
            data-ocid="fields.reset_button"
          >
            <X className="size-3.5" aria-hidden="true" />
            {t("fields.reset")}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
