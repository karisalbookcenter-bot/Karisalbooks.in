import { NextResponse } from "next/server";

import { authConfig } from "@/config/auth";
import { isAtLeastRole } from "@/constants/roles.constants";
import { getServerAuthUser } from "@/features/auth/services/session.service";
import { createAdminClient } from "@/lib/supabase/admin";

interface MetaResult {
  id?: string;
  post_id?: string;
  error?: { message?: string };
}

async function postToMeta(
  endpoint: string,
  fields: Record<string, string>,
): Promise<MetaResult> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields),
    cache: "no-store",
  });

  const result = (await response.json()) as MetaResult;
  if (!response.ok || result.error) {
    throw new Error(result.error?.message ?? "Meta rejected the post.");
  }

  return result;
}

export async function POST(request: Request) {
  try {
    const user = await getServerAuthUser();
    if (!user || !isAtLeastRole(user.role, authConfig.minimumAdminRole)) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as { bookId?: string };
    if (!body.bookId?.trim()) {
      return NextResponse.json(
        { error: "A book ID is required." },
        { status: 400 },
      );
    }

    const token = process.env.META_ACCESS_TOKEN;
    const pageId = process.env.META_PAGE_ID;
    const instagramAccountId = process.env.META_INSTAGRAM_ACCOUNT_ID;
    if (!token || !pageId || !instagramAccountId) {
      return NextResponse.json(
        {
          error:
            "Automatic social posting is not configured. Set META_ACCESS_TOKEN, META_PAGE_ID, and META_INSTAGRAM_ACCOUNT_ID.",
        },
        { status: 503 },
      );
    }

    const supabase = createAdminClient();
    const { data: book, error } = await supabase
      .from("books")
      .select("title, slug, description, cover_image_url, status")
      .eq("id", body.bookId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!book) {
      return NextResponse.json(
        { error: "The saved book could not be found." },
        { status: 404 },
      );
    }
    if (book.status !== "active" || !book.cover_image_url) {
      return NextResponse.json(
        { error: "Only active books with a cover image can be posted." },
        { status: 400 },
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
    if (!siteUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_SITE_URL is required for social post links." },
        { status: 503 },
      );
    }

    const version = process.env.META_GRAPH_API_VERSION ?? "v22.0";
    const caption = [
      book.title,
      book.description?.trim(),
      `${siteUrl}/books/${book.slug}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const [facebook, instagram] = await Promise.allSettled([
      postToMeta(`https://graph.facebook.com/${version}/${pageId}/photos`, {
        url: book.cover_image_url,
        caption,
        access_token: token,
      }),
      (async () => {
        const container = await postToMeta(
          `https://graph.facebook.com/${version}/${instagramAccountId}/media`,
          {
            image_url: book.cover_image_url,
            caption,
            access_token: token,
          },
        );
        if (!container.id) {
          throw new Error("Instagram did not return a media container ID.");
        }

        return postToMeta(
          `https://graph.facebook.com/${version}/${instagramAccountId}/media_publish`,
          {
            creation_id: container.id,
            access_token: token,
          },
        );
      })(),
    ]);

    const result = {
      facebook:
        facebook.status === "fulfilled"
          ? { published: true }
          : {
              published: false,
              error: facebook.reason instanceof Error
                ? facebook.reason.message
                : "Facebook post failed.",
            },
      instagram:
        instagram.status === "fulfilled"
          ? { published: true }
          : {
              published: false,
              error: instagram.reason instanceof Error
                ? instagram.reason.message
                : "Instagram post failed.",
            },
    };

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to publish this book to social media.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
