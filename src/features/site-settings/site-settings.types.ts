export interface PublicSocialLinks {
  facebook: string;
  instagram: string;
  youtube: string;
  x: string;
  whatsapp: string;
}

export interface PublicSiteSettings {
  logoUrl: string;
  description: string;
  arrivalsSliderEnabled: boolean;
  arrivalsSliderIntervalSeconds: number;
  arrivalsTitle: string;
  whatsappOrdersEnabled: boolean;
  qrPaymentEnabled: boolean;
  paymentQrUrl: string;
}

export const DEFAULT_SOCIAL_LINKS: PublicSocialLinks = {
  facebook: "",
  instagram: "",
  youtube: "",
  x: "",
  whatsapp: "",
};

export const DEFAULT_SITE_SETTINGS: PublicSiteSettings = {
  logoUrl: "",
  description: "Tamil books, independent publishers, and thoughtful publishing services.",
  arrivalsSliderEnabled: true,
  arrivalsSliderIntervalSeconds: 6,
  arrivalsTitle: "New arrivals",
  whatsappOrdersEnabled: false,
  qrPaymentEnabled: false,
  paymentQrUrl: "",
};