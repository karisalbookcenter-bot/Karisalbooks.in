import { BookManagementOverview } from "@/features/admin/components/books";

// Sprint 16: categories/subcategories now have a real backend
// (categoryService/subcategoryService) and BookManagementOverview fetches
// them itself, the same way it already does for authors/publishers — no
// props needed here anymore. Sprint 15's `categories={[]} subcategories={[]}`
// placeholder is gone.
export default function AdminBooksPage() {
  return <BookManagementOverview />;
}
