import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export function RatingStars({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const rounded = Math.round(value);
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${value.toFixed(1)} / 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "size-3.5",
            star <= rounded
              ? "fill-accent text-accent"
              : "text-muted-foreground/40",
          )}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
