import { format, parseISO } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

export function formatDate(date: Date | string, formatStr: string = "PPP"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr);
}

export function formatTime(date: Date | string, formatStr: string = "p"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr);
}

export function formatDateTime(date: Date | string, formatStr: string = "PPp"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr);
}

export function formatInTz(
  date: Date | string,
  timezone: string,
  formatStr: string = "PPp"
): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatInTimeZone(d, timezone, formatStr);
}

export function toTz(date: Date | string, timezone: string): Date {
  const d = typeof date === "string" ? parseISO(date) : date;
  return toZonedTime(d, timezone);
}
