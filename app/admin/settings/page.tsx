"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_SITE_SETTINGS,
  type PublicSiteSettings,
  type PublicSocialLinks,
} from "@/features/site-settings/site-settings.types";

const FIELDS: { key: keyof PublicSocialLinks; label: string; placeholder: string }[] = [
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/…" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/…" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@…" },
  { key: "x", label: "X", placeholder: "https://x.com/…" },
  { key: "whatsapp", label: "WhatsApp contact", placeholder: "https://wa.me/91…" },
];

export default function AdminSettingsPage() {
  const [social, setSocial] = useState<PublicSocialLinks>({
    facebook: "",
    instagram: "",
    youtube: "",
    x: "",
    whatsapp: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [site, setSite] = useState<PublicSiteSettings>(DEFAULT_SITE_SETTINGS);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/site-settings")
      .then(async (response) => {
        const result = (await response.json()) as { social?: PublicSocialLinks; site?: PublicSiteSettings; error?: string };
        if (!response.ok) throw new Error(result.error ?? "Unable to load site settings.");
        if (result.social) setSocial(result.social);
        if (result.site) setSite(result.site);
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load site settings.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const response = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ social, site }),
      });
      const result = (await response.json()) as { social?: PublicSocialLinks; site?: PublicSiteSettings; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to save site settings.");
      if (result.social) setSocial(result.social);
      if (result.site) setSite(result.site);
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save site settings.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadLogo(file: File | undefined) {
    if (!file) return;
    setError("");
    setUploadingLogo(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/admin/site-assets", { method: "POST", body: form });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error ?? "Unable to upload the logo.");
      setSite((current) => ({ ...current, logoUrl: result.url! }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload the logo.");
    } finally {
      setUploadingLogo(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold">Site settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage the public social links shown on the storefront.</p>
      </header>

      <form onSubmit={saveSettings} className="space-y-5">
        <section className="space-y-3 border-b border-border pb-5">
          <h2 className="text-base font-semibold">Storefront identity</h2>
          <label className="block space-y-1.5 text-sm font-medium">
            Logo (JPG, PNG, or WEBP, up to 5 MB)
            <Input type="file" accept="image/jpeg,image/png,image/webp" disabled={loading || saving || uploadingLogo} onChange={(event) => void uploadLogo(event.target.files?.[0])} />
          </label>
          {uploadingLogo && <p className="text-xs text-muted-foreground">Uploading logo…</p>}
          {site.logoUrl && <div className="relative h-16 w-48"><Image src={site.logoUrl} alt="Current storefront logo" fill sizes="192px" className="object-contain" /></div>}
          <label className="block space-y-1.5 text-sm font-medium">
            Homepage description
            <textarea maxLength={500} rows={3} value={site.description} onChange={(event) => setSite((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-md border bg-background px-3 py-2 text-sm font-normal" />
          </label>
        </section>

        <section className="grid gap-4 border-b border-border pb-5 sm:grid-cols-2">
          <div className="space-y-3 sm:col-span-2">
            <h2 className="text-base font-semibold">Homepage new arrivals</h2>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={site.arrivalsSliderEnabled} onChange={(event) => setSite((current) => ({ ...current, arrivalsSliderEnabled: event.target.checked }))} className="h-4 w-4 accent-primary" />
              Show new arrivals as an automatic slider
            </label>
          </div>
          <label className="space-y-1.5 text-sm font-medium">
            Section title
            <Input value={site.arrivalsTitle} maxLength={100} onChange={(event) => setSite((current) => ({ ...current, arrivalsTitle: event.target.value }))} />
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            Slide interval (seconds)
            <Input type="number" min={3} max={20} value={site.arrivalsSliderIntervalSeconds} onChange={(event) => setSite((current) => ({ ...current, arrivalsSliderIntervalSeconds: Number(event.target.value) }))} />
          </label>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-semibold">Social media links</h2>
        {FIELDS.map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={`site-social-${key}`}>{label}</Label>
            <Input
              id={`site-social-${key}`}
              type="url"
              inputMode="url"
              placeholder={placeholder}
              value={social[key]}
              disabled={loading || saving}
              onChange={(event) => setSocial((current) => ({ ...current, [key]: event.target.value }))}
            />
          </div>
        ))}
        </section>

        <p className="border-l-2 border-primary pl-3 text-sm leading-6 text-muted-foreground">
          WhatsApp, email, Razorpay and Supabase credentials are private integrations. Configure their API tokens in the server/Vercel environment; do not enter secrets here.
        </p>

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {saved && <p role="status" className="text-sm text-primary">Settings saved.</p>}

        <div className="flex justify-end border-t pt-4">
          <Button type="submit" disabled={loading || saving}>
            {saving ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}