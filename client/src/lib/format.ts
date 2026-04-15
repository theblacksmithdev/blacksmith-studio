import { formatDistanceToNow } from "date-fns";

export function formatDate(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function truncate(text: string, maxLength = 80): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
