import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { NO_DISCOUNT_CATEGORY_NAME } from "@/lib/helpers/book-pricing.helpers";
import {
  DEFAULT_SITE_SETTINGS,
  type PublicSiteSettings,
} from "@/features/site-settings/site-settings.types";
import type { Book } from "@/types/book.types";
import type { Category } from "@/types/category.types";

const PUBLIC_VISIBLE_STATUS = "active";
const HOMEPAGE_BOOK_LIMIT = 12;

export interface HomepageCampaignOffer {
  id: string;
  title: string;
  discountPercentage: number;
  endDate: string;
  posterUrl: string;
}

export interface HomepageData {
  recentBooks: Book[];
  highlightedBooks: Book[];
  makkalBooks: Book[];
  campaignOffer: HomepageCampaignOffer | null;
  categories: Category[];
  authorNamesById: Record<string, string>;
  publisherNamesById: Record<string, string>;
  site: PublicSiteSettings;
  categoryError: string | null;
  makkalBooksError: string | null;
}

function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Public Supabase environment variables are not configured.");
  }

  return createSupabaseClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

function logRejectedResult(label: string, result: PromiseSettledResult<unknown>) {
  if (result.status === "rejected") {
    console.error(`Unable to load homepage ${label}:`, result.reason);
  }
}

function isMissingPrebookingSchema(error: { code?: string; message?: string }) {
  return error.code === "42703" && Boolean(error.message?.includes("prebooking_"));
}

async function listPublicBooks(
  supabase: ReturnType<typeof createPublicClient>,
  categoryId?: string,
): Promise<Book[]> {
  const buildQuery = (filterPrebookings: boolean) => {
    let query = supabase
      .from("books")
      .select("*")
      .eq("status", PUBLIC_VISIBLE_STATUS);

    if (categoryId) query = query.eq("category_id", categoryId);
    if (filterPrebookings) {
      query = query.or(
        `prebooking_enabled.eq.false,prebooking_end_at.lte.${new Date().toISOString()}`,
      );
    }

    return query;
  };

  let result = await buildQuery(true)
    .order("created_at", { ascending: false })
    .range(0, HOMEPAGE_BOOK_LIMIT - 1);

  if (result.error && isMissingPrebookingSchema(result.error)) {
    result = await buildQuery(false)
      .order("created_at", { ascending: false })
      .range(0, HOMEPAGE_BOOK_LIMIT - 1);
  }

  if (result.error) throw result.error;
  return (result.data ?? []) as Book[];
}

function addCategoryNames(books: Book[], categories: Category[]) {
  const categoryNames = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  return books.map((book) => ({
    ...book,
    category_name: categoryNames.get(book.category_id),
  }));
}

async function loadPublicSiteSettings(): Promise<PublicSiteSettings> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "site_logo_url, site_description, homepage_slider_enabled, homepage_slider_interval_seconds, homepage_arrivals_title, whatsapp_orders_enabled, qr_payment_enabled, payment_qr_url",
      )
      .eq("id", "public")
      .maybeSingle();

    if (error) throw error;
    if (!data) return DEFAULT_SITE_SETTINGS;

    return {
      logoUrl: data.site_logo_url ?? DEFAULT_SITE_SETTINGS.logoUrl,
      description: data.site_description ?? DEFAULT_SITE_SETTINGS.description,
      arrivalsSliderEnabled:
        data.homepage_slider_enabled ??
        DEFAULT_SITE_SETTINGS.arrivalsSliderEnabled,
      arrivalsSliderIntervalSeconds:
        data.homepage_slider_interval_seconds ??
        DEFAULT_SITE_SETTINGS.arrivalsSliderIntervalSeconds,
      arrivalsTitle:
        data.homepage_arrivals_title ?? DEFAULT_SITE_SETTINGS.arrivalsTitle,
      whatsappOrdersEnabled:
        data.whatsapp_orders_enabled ??
        DEFAULT_SITE_SETTINGS.whatsappOrdersEnabled,
      qrPaymentEnabled:
        data.qr_payment_enabled ?? DEFAULT_SITE_SETTINGS.qrPaymentEnabled,
      paymentQrUrl:
        data.payment_qr_url ?? DEFAULT_SITE_SETTINGS.paymentQrUrl,
    };
  } catch (error) {
    console.error("Unable to load homepage site settings:", error);
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function getHomepageData(): Promise<HomepageData> {
  const supabase = createPublicClient();
  const today = new Date().toISOString().slice(0, 10);

  const [queryResults, site] = await Promise.all([
    Promise.allSettled([
      listPublicBooks(supabase),
      supabase
        .from("books")
        .select("*")
        .eq("status", PUBLIC_VISIBLE_STATUS)
        .eq("is_highlighted", true)
        .order("highlight_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (error) throw error;
          return (data ?? []) as Book[];
        }),
      supabase
        .from("authors")
        .select("id, name")
        .then(({ data, error }) => {
          if (error) throw error;
          return data ?? [];
        }),
      supabase
        .from("publishers")
        .select("id, name")
        .then(({ data, error }) => {
          if (error) throw error;
          return data ?? [];
        }),
      supabase
        .from("categories")
        .select("*")
        .eq("status", PUBLIC_VISIBLE_STATUS)
        .order("name", { ascending: true })
        .then(({ data, error }) => {
          if (error) throw error;
          return (data ?? []) as Category[];
        }),
      supabase
        .from("offers")
        .select("*")
        .eq("status", "active")
        .lte("start_date", today)
        .gte("end_date", today)
        .order("end_date", { ascending: true })
        .limit(6)
        .then(({ data, error }) => {
          if (error) throw error;
          return data ?? [];
        }),
    ]),
    loadPublicSiteSettings(),
  ]);

  const [
    recentBooksResult,
    highlightedBooksResult,
    authorsResult,
    publishersResult,
    categoriesListResult,
    offersResult,
  ] = queryResults;

  logRejectedResult("books", recentBooksResult);
  logRejectedResult("featured books", highlightedBooksResult);
  logRejectedResult("authors", authorsResult);
  logRejectedResult("publishers", publishersResult);
  logRejectedResult("categories", categoriesListResult);
  logRejectedResult("campaign offer", offersResult);

  const categories =
    categoriesListResult.status === "fulfilled"
      ? categoriesListResult.value
      : [];
  const recentBooks =
    recentBooksResult.status === "fulfilled" ? recentBooksResult.value : [];
  const highlightedBooks =
    highlightedBooksResult.status === "fulfilled"
      ? addCategoryNames(highlightedBooksResult.value, categories)
      : [];
  const authors =
    authorsResult.status === "fulfilled" ? authorsResult.value : [];
  const publishers =
    publishersResult.status === "fulfilled" ? publishersResult.value : [];
  const offers =
    offersResult.status === "fulfilled" ? offersResult.value : [];
  const campaign = offers.find(
    (item) =>
      typeof item.campaign_poster_url === "string" &&
      item.campaign_poster_url.trim().length > 0 &&
      Number.isFinite(Number(item.discount_percentage)),
  );

  const makkalCategory = categories.find(
    (category) => category.name.trim() === NO_DISCOUNT_CATEGORY_NAME,
  );
  let makkalBooks: Book[] = [];
  let makkalBooksError: string | null = null;

  if (makkalCategory) {
    try {
      makkalBooks = addCategoryNames(
        await listPublicBooks(supabase, makkalCategory.id),
        categories,
      );
    } catch (error) {
      console.error("Unable to load Makkal Pathippu books:", error);
      makkalBooksError = "Unable to load books in this collection.";
    }
  }

  return {
    recentBooks: addCategoryNames(recentBooks, categories),
    highlightedBooks,
    makkalBooks,
    campaignOffer: campaign
      ? {
          id: campaign.id,
          title: campaign.title,
          discountPercentage: Number(campaign.discount_percentage),
          endDate: campaign.end_date,
          posterUrl: campaign.campaign_poster_url,
        }
      : null,
    categories,
    authorNamesById: Object.fromEntries(
      authors.map((author) => [author.id, author.name]),
    ),
    publisherNamesById: Object.fromEntries(
      publishers.map((publisher) => [publisher.id, publisher.name]),
    ),
    site,
    categoryError:
      categoriesListResult.status === "rejected"
        ? "Unable to load categories."
        : null,
    makkalBooksError,
  };
}
