import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Users,
  Building2,
  GraduationCap,
  Printer,
  ShoppingCart,
  UserCircle,
  Tag,
  BadgePercent,
  CalendarClock,
  Truck,
  BarChart3,
  Settings,
  Home,
  Mail,
  Info,
  Bell,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  User,
  Circle,
  Inbox,
  type LucideIcon,
} from "lucide-react";

/**
 * Centralized icon registry — Sprint 06.
 *
 * Every place in the app that needs an icon (sidebar nav, public nav from
 * Day 4, empty states, dropdowns) refers to an icon by a stable string key
 * — the same `icon: string | null` field already defined on
 * `NavigationItemRecord` back in Day 4 — rather than importing
 * `lucide-react` components directly all over the codebase. That means:
 *
 *  - Swapping icon libraries later is a one-file change.
 *  - A future CMS-driven nav editor can offer a dropdown of icon *names*
 *    (strings) without shipping actual component references through an API.
 *  - Every consumer resolves an unknown/missing key to the same fallback
 *    instead of each screen inventing its own default.
 */
export const ICONS = {
  // Sidebar navigation icons
  dashboard: LayoutDashboard,
  "book-open": BookOpen,
  "folder-tree": FolderTree,
  users: Users,
  "building-2": Building2,
  "graduation-cap": GraduationCap,
  printer: Printer,
  "shopping-cart": ShoppingCart,
  "user-circle": UserCircle,
  tag: Tag,
  "badge-percent": BadgePercent,
  "calendar-clock": CalendarClock,
  truck: Truck,
  "bar-chart": BarChart3,
  settings: Settings,

  // Public nav icons (Day 4 config already stores these string keys)
  home: Home,
  mail: Mail,
  info: Info,

  // Chrome / shell icons
  bell: Bell,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  "chevron-left": ChevronLeft,
  menu: Menu,
  close: X,
  "log-out": LogOut,
  user: User,
  inbox: Inbox,

  // Fallback used whenever a string key doesn't match one above
  circle: Circle,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

/**
 * Resolves an icon name (e.g. from a `NavigationItemRecord.icon` field) to
 * its component, falling back to a neutral default instead of throwing or
 * rendering nothing when a name is unrecognized or null.
 */
export function getIcon(name: string | null | undefined): LucideIcon {
  if (name && name in ICONS) {
    return ICONS[name as IconName];
  }
  return ICONS.circle;
}
