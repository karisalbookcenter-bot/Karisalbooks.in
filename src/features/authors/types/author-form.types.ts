import type { RecordStatus } from "@/types/common.types";

/**
 * Author form values — Sprint 11. Same camelCase, string-typed convention
 * `BookFormValues` (Sprint 10) established.
 */
export interface AuthorFormValues {
  name: string;
  slug: string;
  bio: string;
  photoUrl: string;
  status: RecordStatus;
}

export const DEFAULT_AUTHOR_FORM_VALUES: AuthorFormValues = {
  name: "",
  slug: "",
  bio: "",
  photoUrl: "",
  status: "active",
};
