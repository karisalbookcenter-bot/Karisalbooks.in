"use client";

import { useEffect, useState } from "react";
import {
  Facebook,
  Instagram,
  MessageCircle,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";

import type { PublicSocialLinks } from "@/features/site-settings/site-settings.types";
import { subscribeToSiteSettingsUpdates } from "@/features/site-settings/site-settings.events";

const DEFAULT_LINKS: PublicSocialLinks = {
  facebook: "",
  instagram: "",
  youtube: "",
  x: "",
  whatsapp: "",
};

const PLATFORM_LABELS: {
  key: keyof PublicSocialLinks;
  label: string;
  icon: LucideIcon;
  className: string;
}[] = [
  {
    key: "instagram",
    label: "Instagram",
    icon: Instagram,
    className: "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-400",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: Facebook,
    className: "bg-[#1877F2]",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: Youtube,
    className: "bg-[#FF0000]",
  },
  {
    key: "x",
    label: "X",
    icon: Twitter,
    className: "bg-[#171717]",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    className: "bg-[#25D366]",
  },
];

function normalizeWhatsAppLink(href: string) {
  return href.replace(
    /^https?:\/\/wa\.me\/+(\+?\d+)/i,
    (_, phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`
  );
}

export function SocialLinks() {
  const [links, setLinks] = useState(DEFAULT_LINKS);

  useEffect(() => {
    let active = true;
    const loadLinks = () => fetch("/api/site-settings", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const result = (await response.json()) as { social?: Partial<PublicSocialLinks> };
        if (active && result.social) setLinks({ ...DEFAULT_LINKS, ...result.social });
      })
      .catch(() => undefined);

    void loadLinks();
    const unsubscribe = subscribeToSiteSettingsUpdates(({ social }) => {
      setLinks({ ...DEFAULT_LINKS, ...social });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const activeLinks = PLATFORM_LABELS.filter(({ key }) => Boolean(links[key]));
  if (!activeLinks.length) return null;

  return (
    <nav aria-label="Social media" className="flex flex-wrap items-center gap-2">
      {activeLinks.map(({ key, label, icon: Icon, className }) => (
        <a
          key={key}
          href={key === "whatsapp" ? normalizeWhatsAppLink(links[key]) : links[key]}
          target="_blank"
          rel="noreferrer"
          aria-label={`Visit Karisal Books on ${label}`}
          title={label}
          className={`grid h-10 w-10 place-items-center rounded-full text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${className}`}
        >
          <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
        </a>
      ))}
    </nav>
  );
}