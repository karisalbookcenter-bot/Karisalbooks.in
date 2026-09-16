import type { PublicNameRecord } from "./services/author-publisher.storefront";

export function buildNameMap(items: PublicNameRecord[]): Record<string, string> {
  return Object.fromEntries(items.map((item) => [item.id, item.name]));
}
