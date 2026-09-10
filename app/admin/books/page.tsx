import { BookManagementOverview } from "@/features/admin/components/books";

// Categories/Subcategories have no Supabase backend yet (Sprint 08/09 are
// still UI-architecture-only). Passing [] here is a documented, temporary
// gap — not a silent bug — until a future sprint gives them a real
// service the way Sprint 10/11 did for Books/Authors/Publishers. Once that
// exists, replace this with a server-side fetch, same as any other
// Server Component page in this project.
export default function AdminBooksPage() {
  return <BookManagementOverview categories={[]} subcategories={[]} />;
}
