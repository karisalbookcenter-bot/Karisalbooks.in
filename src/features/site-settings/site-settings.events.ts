import type { PublicSiteSettings, PublicSocialLinks } from "./site-settings.types";

export const SITE_SETTINGS_UPDATED_EVENT = "karisal:site-settings-updated";

export interface SiteSettingsUpdate {
  site: PublicSiteSettings;
  social: PublicSocialLinks;
}

export function notifySiteSettingsUpdated(detail: SiteSettingsUpdate) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<SiteSettingsUpdate>(SITE_SETTINGS_UPDATED_EVENT, {
        detail,
      }),
    );
  }
}

export function subscribeToSiteSettingsUpdates(
  onUpdate: (detail: SiteSettingsUpdate) => void,
) {
  const handleUpdate = (event: Event) => {
    if (event instanceof CustomEvent) {
      onUpdate((event as CustomEvent<SiteSettingsUpdate>).detail);
    }
  };

  window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, handleUpdate);
  return () => window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, handleUpdate);
}
