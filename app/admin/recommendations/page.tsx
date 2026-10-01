"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, BookOpenCheck, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { listRecommendationBooks, listRecommendationShelves, saveRecommendationShelf, deleteRecommendationShelf, type RecommendationShelf, type RecommendationShelfInput } from "@/features/recommendations/recommendation.service";
import { formatCurrency } from "@/lib/helpers/format.helpers";

interface RecommendationBookOption {
  id: string;
  title: string;
  price: number;
  category_id: string;
  categoryName: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

const EMPTY_FORM: RecommendationShelfInput = {
  title: "",
  description: "",
  varietyTag: "",
  categoryId: "",
  status: "active",
  bookIds: [],
};

export default function AdminRecommendationsPage() {
  const [shelves, setShelves] = useState<RecommendationShelf[]>([]);
  const [books, setBooks] = useState<RecommendationBookOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [form, setForm] = useState<RecommendationShelfInput>(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [shelfRows, bookData] = await Promise.all([
        listRecommendationShelves(),
        listRecommendationBooks(),
      ]);
      setShelves(shelfRows);
      setBooks(bookData.books as RecommendationBookOption[]);
      setCategories(bookData.categories);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load recommendation data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const visibleBooks = useMemo(() => books.filter((book) =>
    `${book.title} ${book.categoryName}`.toLowerCase().includes(search.trim().toLowerCase())
  ), [books, search]);

  function editShelf(shelf: RecommendationShelf) {
    setForm({
      id: shelf.id,
      title: shelf.title,
      description: shelf.description ?? "",
      varietyTag: shelf.variety_tag ?? "",
      categoryId: shelf.category_id ?? "",
      status: shelf.status === "active" ? "active" : "inactive",
      bookIds: shelf.books.map((book) => book.id),
    });
    setNotice("");
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setSearch("");
  }

  function toggleBook(id: string) {
    setForm((current) => ({
      ...current,
      bookIds: current.bookIds.includes(id)
        ? current.bookIds.filter((bookId) => bookId !== id)
        : [...current.bookIds, id],
    }));
  }

  function moveBook(id: string, direction: -1 | 1) {
    setForm((current) => {
      const from = current.bookIds.indexOf(id);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= current.bookIds.length) return current;
      const bookIds = [...current.bookIds];
      [bookIds[from], bookIds[to]] = [bookIds[to], bookIds[from]];
      return { ...current, bookIds };
    });
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await saveRecommendationShelf(form);
      resetForm();
      await load();
      setNotice("Recommendation shelf saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save this shelf.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(shelf: RecommendationShelf) {
    if (!window.confirm(`Delete “${shelf.title}”?`)) return;
    try {
      await deleteRecommendationShelf(shelf.id);
      setShelves((current) => current.filter((item) => item.id !== shelf.id));
      if (form.id === shelf.id) resetForm();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete this shelf.");
    }
  }

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4">
        <p className="text-xs font-semibold uppercase text-primary">Reader discovery</p>
        <h1 className="mt-1 text-2xl font-semibold">Recommendations</h1>
        <p className="mt-1 text-sm text-muted-foreground">Curate shelves from books already in your catalog.</p>
      </header>

      {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
      {notice && <p role="status" className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-primary">{notice}</p>}

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-labelledby="existing-shelves" className="min-w-0">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <h2 id="existing-shelves" className="font-semibold">Published shelves</h2>
            <span className="text-xs text-muted-foreground">{shelves.length} total</span>
          </div>
          {loading ? <p className="py-8 text-sm text-muted-foreground">Loading shelves…</p> : shelves.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">No shelves yet. Create your first reader collection.</p>
          ) : (
            <div className="divide-y divide-border">
              {shelves.map((shelf) => (
                <article key={shelf.id} className="py-4 first:pt-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{shelf.title}</h3>
                        <span className={`rounded-sm px-2 py-1 text-[10px] font-semibold uppercase ${shelf.status === "active" ? "bg-emerald-50 text-emerald-800" : "bg-muted text-muted-foreground"}`}>{shelf.status}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{shelf.variety_tag || "No variety tag"} · {shelf.books.length} books</p>
                      {shelf.description && <p className="mt-2 text-sm text-muted-foreground">{shelf.description}</p>}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {shelf.books.slice(0, 5).map((book) => <span key={book.id} className="rounded-sm border border-border px-2 py-1 text-xs">{book.title}</span>)}
                        {shelf.books.length > 5 && <span className="px-1 py-1 text-xs text-muted-foreground">+{shelf.books.length - 5} more</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button type="button" aria-label={`Edit ${shelf.title}`} onClick={() => editShelf(shelf)} className="grid h-10 w-10 place-items-center rounded-md border border-border hover:bg-secondary"><Pencil size={16} /></button>
                      <button type="button" aria-label={`Delete ${shelf.title}`} onClick={() => void handleDelete(shelf)} className="grid h-10 w-10 place-items-center rounded-md border border-border text-destructive hover:bg-destructive/5"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <form onSubmit={handleSave} className="space-y-4 border-t border-border pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{form.id ? "Edit shelf" : "Create a shelf"}</h2>
            {form.id && <button type="button" onClick={resetForm} className="text-xs font-medium text-primary hover:underline">Cancel edit</button>}
          </div>
          <label className="block text-xs font-semibold text-foreground">
            Shelf title
            <input required maxLength={80} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="For new Tamil readers" className="mt-1 min-h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-normal" />
          </label>
          <label className="block text-xs font-semibold text-foreground">
            Short description
            <textarea rows={2} maxLength={240} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="A friendly place to start reading." className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-normal" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-foreground">
              Variety tag
              <input maxLength={40} value={form.varietyTag} onChange={(event) => setForm((current) => ({ ...current, varietyTag: event.target.value }))} placeholder="Short reads" className="mt-1 min-h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-normal" />
            </label>
            <label className="block text-xs font-semibold text-foreground">
              Category
              <select value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))} className="mt-1 min-h-10 w-full rounded-md border border-border bg-background px-2 text-sm font-normal">
                <option value="">Any category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
          </div>
          <label className="flex min-h-10 items-center gap-2 text-sm">
            <input type="checkbox" checked={form.status === "active"} onChange={(event) => setForm((current) => ({ ...current, status: event.target.checked ? "active" : "inactive" }))} className="h-4 w-4 accent-primary" />
            Show this shelf to readers
          </label>
          <div className="border-t border-border pt-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Choose books</h3>
              <span className="text-xs text-muted-foreground">{form.bookIds.length} selected</span>
            </div>
            <label className="relative block">
              <Search size={15} className="absolute left-3 top-3 text-muted-foreground" aria-hidden="true" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title or category" className="min-h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm" />
            </label>
            <div className="mt-2 max-h-72 overflow-y-auto divide-y divide-border rounded-md border border-border">
              {visibleBooks.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No books match.</p> : visibleBooks.map((book) => (
                <label key={book.id} className="flex cursor-pointer items-center gap-3 p-3 hover:bg-secondary/50">
                  <input type="checkbox" checked={form.bookIds.includes(book.id)} onChange={() => toggleBook(book.id)} className="h-4 w-4 shrink-0 accent-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block line-clamp-2 text-sm font-medium">{book.title}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{book.categoryName}</span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums">{formatCurrency(book.price)}</span>
                </label>
              ))}
            </div>
            {form.bookIds.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Shelf order</h4>
                <ol className="divide-y divide-border rounded-md border border-border">
                  {form.bookIds.map((id, index) => {
                    const book = books.find((item) => item.id === id);
                    if (!book) return null;
                    return (
                      <li key={id} className="flex items-center gap-2 p-2">
                        <span className="w-5 shrink-0 text-center text-xs tabular-nums text-muted-foreground">{index + 1}</span>
                        <span className="min-w-0 flex-1 line-clamp-2 text-xs font-medium">{book.title}</span>
                        <button type="button" aria-label={`Move ${book.title} up`} disabled={index === 0} onClick={() => moveBook(id, -1)} className="grid h-9 w-9 place-items-center rounded border border-border disabled:opacity-30"><ArrowUp size={15} /></button>
                        <button type="button" aria-label={`Move ${book.title} down`} disabled={index === form.bookIds.length - 1} onClick={() => moveBook(id, 1)} className="grid h-9 w-9 place-items-center rounded border border-border disabled:opacity-30"><ArrowDown size={15} /></button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </div>
          <button type="submit" disabled={saving || form.bookIds.length === 0} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {form.id ? <BookOpenCheck size={16} /> : <Plus size={16} />}
            {saving ? "Saving…" : form.id ? "Save changes" : "Create recommendation shelf"}
          </button>
        </form>
      </div>
    </div>
  );
}