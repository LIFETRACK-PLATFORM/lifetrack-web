"use client";

import type { CSSProperties } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bell,
  BookOpen,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleDot,
  Dumbbell,
  Eye,
  EyeOff,
  Film,
  Filter,
  Gift,
  GraduationCap,
  HeartPulse,
  History,
  Home,
  ImageOff,
  Info,
  LayoutDashboard,
  ListTodo,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Minus,
  Pause,
  PawPrint,
  Plane,
  Play,
  Plus,
  Receipt,
  Repeat,
  Search,
  Settings,
  Settings2,
  ShoppingBag,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  User,
  Utensils,
  Video,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

/** Legacy Material Symbols names → lucide (Nightframe). */
const ICON_MAP = {
  accessibility_new: Accessibility,
  add: Plus,
  arrow_back: ArrowLeft,
  arrow_forward: ArrowRight,
  book_open: BookOpen,
  broken_image: ImageOff,
  calendar_today: Calendar,
  car: Car,
  check: Check,
  check_circle: CheckCircle2,
  chevron_right: ChevronRight,
  close: X,
  dashboard: LayoutDashboard,
  directions_walk: Accessibility,
  encrypted: Lock,
  error: CircleAlert,
  filter_list: Filter,
  film: Film,
  fitness_center: Dumbbell,
  gift: Gift,
  graduation_cap: GraduationCap,
  heart_pulse: HeartPulse,
  history: History,
  home: Home,
  info: Info,
  lock: Lock,
  logout: LogOut,
  mail: Mail,
  notifications: Bell,
  pause_circle: Pause,
  paw_print: PawPrint,
  payments: Wallet,
  person: User,
  plane: Plane,
  play_arrow: Play,
  play_circle: Play,
  priority_high: TriangleAlert,
  progress_activity: Loader2,
  radio_button_unchecked: Circle,
  receipt: Receipt,
  remove: Minus,
  repeat: Repeat,
  search: Search,
  self_improvement: Sparkles,
  settings: Settings,
  settings_account_box: Settings2,
  shopping_bag: ShoppingBag,
  stabilization: CircleDot,
  task_alt: ListTodo,
  target: Target,
  trash: Trash2,
  trending_down: TrendingDown,
  trending_up: TrendingUp,
  utensils: Utensils,
  verified: BadgeCheck,
  videocam: Video,
  visibility: Eye,
  visibility_off: EyeOff,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICON_MAP;

type IconProps = {
  name: IconName | string;
  className?: string;
  /** Kept for API compat; lucide uses stroke, not fill. */
  filled?: boolean;
  style?: CSSProperties;
  size?: number;
  strokeWidth?: number;
} & Omit<LucideProps, "ref" | "size" | "strokeWidth" | "className" | "style">;

export function Icon({
  name,
  className = "",
  filled: _filled = false,
  style,
  size,
  strokeWidth = 1.75,
  ...props
}: IconProps) {
  const LucideComp = ICON_MAP[name as IconName] ?? Circle;
  return (
    <LucideComp
      aria-hidden
      className={cn(size == null && "size-[1em]", className)}
      size={size}
      strokeWidth={strokeWidth}
      style={style}
      {...props}
    />
  );
}

export { ICON_MAP };
