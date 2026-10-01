"use client";

import { useEffect, useState } from "react";

import type { PublicSocialLinks } from "@/features/site-settings/site-settings.types";

const DEFAULT_LINKS: PublicSocialLinks = {
  facebook: "",
  instagram: "",
  youtube: "",
  x: "",
  whatsapp: "",
};

const PLATFORM_LABELS: { key: keyof PublicSocialLinks; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "youtube", label: "YouTube" },
  { key: "x", label: "X" },
  { key: "whatsapp", label: "WhatsApp" },
];

export function SocialLinks() {
  const [links, setLinks] = useState(DEFAULT_LINKS);

  useEffect(() => {
    fetch("/api/site-settings")
      .then(async (response) => {
        if (!response.ok) return;
        const result = (await response.json()) as { social?: Partial<PublicSocialLinks> };
        if (result.social) setLinks({ ...DEFAULT_LINKS, ...result.social });
      })
      .catch(() => undefined);
  }, []);

  const activeLinks = PLATFORM_LABELS.filter(({ key }) => Boolean(links[key]));
  if (!activeLinks.length) return null;

  return (
    <nav aria-label="Social media" className="flex flex-wrap items-center gap-2">
      {activeLinks.map(({ key, label }) => (
        <a
          key={key}
          href={links[key]}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-9 items-center rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-secondary"
        >
          {label}
        </a>
      ))}
    </nav>
  );
}