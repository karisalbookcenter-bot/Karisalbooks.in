interface SaveWithUniqueSlugOptions<T> {
  baseSlug: string;
  fallbackSlug: string;
  excludeId?: string;
  exists: (slug: string, excludeId?: string) => Promise<boolean>;
  save: (slug: string) => Promise<T>;
  isSlugConflict: (error: unknown) => boolean;
}

export async function saveWithUniqueSlug<T>({
  baseSlug,
  fallbackSlug,
  excludeId,
  exists,
  save,
  isSlugConflict,
}: SaveWithUniqueSlugOptions<T>): Promise<T> {
  const base = baseSlug.trim() || fallbackSlug;

  for (let suffix = 1; ; suffix += 1) {
    const slug = suffix === 1 ? base : `${base}-${suffix}`;
    if (await exists(slug, excludeId)) continue;

    try {
      return await save(slug);
    } catch (error) {
      if (!isSlugConflict(error)) throw error;
    }
  }
}

export function isUniqueSlugViolation(error: unknown, table: string): boolean {
  if (!error || typeof error !== "object") return false;

  const databaseError = error as {
    code?: unknown;
    constraint?: unknown;
    message?: unknown;
    details?: unknown;
  };
  const slugConstraint = `${table}_slug_unique`;

  return databaseError.code === "23505" && [
    databaseError.constraint,
    databaseError.message,
    databaseError.details,
  ].some((value) => typeof value === "string" && value.includes(slugConstraint));
}