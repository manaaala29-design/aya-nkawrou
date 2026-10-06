import type { Language } from "@/i18n/translations";

const LOCALES: Record<Language, string> = {
  fr: "fr-FR",
  ar: "ar-TN",
  en: "en-GB",
};

/** Motoko `Time.now()` values are nanosecond bigints. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string, language: Language): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(LOCALES[language], {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(timestamp: bigint, language: Language): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return new Intl.DateTimeFormat(LOCALES[language], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatPrice(value: number, language: Language): string {
  return `${new Intl.NumberFormat(LOCALES[language], {
    maximumFractionDigits: 1,
  }).format(value)} DT`;
}

export function formatNumber(
  value: number | bigint,
  language: Language,
): string {
  return new Intl.NumberFormat(LOCALES[language]).format(Number(value));
}

export function formatDistance(km: number, language: Language): string {
  return `${new Intl.NumberFormat(LOCALES[language], {
    maximumFractionDigits: 1,
  }).format(km)} km`;
}

/** Local calendar day as `YYYY-MM-DD`, matching backend date strings. */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSameDay(value: string, reference: Date): boolean {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

export function isUpcoming(value: string, reference: Date): boolean {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() >= reference.getTime();
}

export function initials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || "?";
}
