import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/i18n";
import { formatDate, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MatchView } from "@/types";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";

export function MatchCard({
  match,
  index,
  fieldName,
  homeTeamName,
  awayTeamName,
}: {
  match: MatchView;
  index: number;
  fieldName?: string;
  homeTeamName?: string;
  awayTeamName?: string;
}) {
  const { t, language } = useI18n();
  const isCancelled = match.status === "cancelled";

  return (
    <Card
      className={cn(
        "gap-3 rounded-lg border-border p-4 shadow-subtle transition-smooth hover:shadow-elevated",
        isCancelled && "opacity-60",
      )}
      data-ocid={`match.card.${index}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold">
            {homeTeamName ?? `#${match.homeTeamId}`}
            <span className="mx-1.5 text-muted-foreground">vs</span>
            {awayTeamName ?? `#${match.awayTeamId}`}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {fieldName ?? `#${match.fieldId}`}
          </p>
        </div>
        <Badge
          variant={isCancelled ? "destructive" : "secondary"}
          className="shrink-0"
        >
          {t(`status.${match.status}`)}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          {formatDate(match.date, language)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5" aria-hidden="true" />
          {match.time}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="size-3.5" aria-hidden="true" />
          {Number(match.playerCount)} {t("label.players")}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs font-medium text-muted-foreground">
          {t(`level.${match.level}`)}
        </span>
        <span className="font-display text-sm font-bold text-primary">
          {formatPrice(match.pricePerPlayerDt, language)}
          <span className="text-xs font-medium text-muted-foreground">
            {" "}
            {t("label.perPlayer")}
          </span>
        </span>
      </div>
    </Card>
  );
}

export function FieldCard({
  field,
  index,
}: {
  field: {
    id: bigint;
    name: string;
    location: string;
    priceDt: number;
    available: boolean;
    rating: number;
    distanceKm: number;
    imageUrl?: string;
  };
  index: number;
}) {
  const { t, language } = useI18n();
  return (
    <Card
      className="gap-0 overflow-hidden rounded-lg border-border p-0 shadow-subtle transition-smooth hover:shadow-elevated"
      data-ocid={`field.card.${index}`}
    >
      <div className="relative h-32 w-full overflow-hidden bg-muted">
        {field.imageUrl ? (
          <img
            src={field.imageUrl}
            alt={field.name}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <div className="pitch-lines size-full bg-gradient-subtle" />
        )}
        <Badge
          variant={field.available ? "default" : "destructive"}
          className="absolute end-2 top-2"
        >
          {field.available ? t("status.available") : t("status.reserved")}
        </Badge>
      </div>
      <div className="space-y-2 p-4">
        <p className="truncate font-display text-sm font-bold">{field.name}</p>
        <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          {field.location}
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="font-display text-sm font-bold text-primary">
            {formatPrice(field.priceDt, language)}
            <span className="text-xs font-medium text-muted-foreground">
              {" "}
              {t("label.perHour")}
            </span>
          </span>
          <span className="text-xs text-muted-foreground">
            {field.distanceKm} km
          </span>
        </div>
      </div>
    </Card>
  );
}
