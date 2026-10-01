"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PublicSocialLinks } from "@/features/site-settings/site-settings.types";

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
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/site-settings")
      .then(async (response) => {
        const result = (await response.json()) as { social?: PublicSocialLinks; error?: string };
        if (!response.ok) throw new Error(result.error ?? "Unable to load site settings.");
        if (result.social) setSocial(result.social);
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
        body: JSON.stringify({ social }),
      });
      const result = (await response.json()) as { social?: PublicSocialLinks; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to save site settings.");
      if (result.social) setSocial(result.social);
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save site settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold">Site settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage the public social links shown on the storefront.</p>
      </header>

      <form onSubmit={saveSettings} className="space-y-5">
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