import type { Book } from "@/types/book.types";
import type { Category } from "@/types/category.types";
import type { Subcategory } from "@/types/subcategory.types";
import type { Author } from "@/types/author.types";
import type { Publisher } from "@/types/publisher.types";
import type { RecordStatus, SortDirection } from "@/types/common.types";

export interface BookFilterState {
  search: string;
  statuses: RecordStatus[];
  categoryId: string | null;
  authorId: string | null;
  sortBy: string;
  sortDirection: SortDirection;
  page: number;
  pageSize: number;
}

export interface BookTableProps {
  books: Book[];
  categories: Category[];
  authors: Author[];
  publishers: Publisher[];
  loading?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  sortBy?: string;
  sortDirection?: SortDirection;
  onSortChange?: (sortBy: string) => void;
}

export interface BookCardProps {
  book: Book;
  categoryName?: string;
  authorName?: string;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
}

export interface BookFormLayoutProps {
  mode: "create" | "edit";
  initialBook?: Book;
  categories: Category[];
  subcategories: Subcategory[];
  authors: Author[];
  publishers: Publisher[];
  onSuccess?: (book: Book) => void;
  onCancel?: () => void;
}

export interface BookFiltersProps {
  categories: Category[];
  authors: Author[];
  value: Pick<BookFilterState, "statuses" | "categoryId" | "authorId">;
  onChange: (value: Pick<BookFilterState, "statuses" | "categoryId" | "authorId">) => void;
}

export interface BookToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  view: "table" | "card";
  onViewChange: (view: "table" | "card") => void;
  onAddBook?: () => void;
  filtersSlot?: React.ReactNode;
}
