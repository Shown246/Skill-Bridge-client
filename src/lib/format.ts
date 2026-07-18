import Decimal from "decimal.js";

export const formatMoney = (value: string | number, currency = "USD") => new Intl.NumberFormat(undefined, { style: "currency", currency }).format(new Decimal(value).toNumber());
export const quotePrice = (hourlyRate: string | number, minutes: number) => new Decimal(hourlyRate).mul(minutes).div(60).toDecimalPlaces(2).toFixed(2);
export const formatDateTime = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
export const formatDate = (value: string | Date) => new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date(value));
export const browserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
export const safeReturnTo = (value: string | null, fallback = "/") => value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : fallback;
export const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
