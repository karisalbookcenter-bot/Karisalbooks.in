export function getWhatsAppPhoneNumber(value: string): string | null {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host !== "wa.me" && host !== "api.whatsapp.com") return null;

    const phone = host === "wa.me"
      ? url.pathname.split("/").filter(Boolean)[0] ?? ""
      : url.searchParams.get("phone") ?? "";
    const digits = phone.replace(/\D/g, "");
    return /^\d{8,15}$/.test(digits) ? digits : null;
  } catch {
    return null;
  }
}
