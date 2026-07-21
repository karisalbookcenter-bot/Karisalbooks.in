import type { RecordStatus } from "@/types/common.types";

/**
 * Publisher form values — Sprint 11. Same convention as
 * `AuthorFormValues`/`BookFormValues`. No image field — `Publisher` has
 * `website_url` (a link), not a photo, so `usePublisherForm` has no
 * upload step, unlike `useAuthorForm`.
 */
export interface PublisherFormValues {
  name: string;
  slug: string;
  description: string;
  websiteUrl: string;
  status: RecordStatus;
}

export const DEFAULT_PUBLISHER_FORM_VALUES: PublisherFormValues = {
  name: "",
  slug: "",
  description: "",
  websiteUrl: "",
  status: "active",
};
