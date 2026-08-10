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
  Briefcase,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleDot,
  Clock,
  Copy,
  Dumbbell,
  Eye,
  EyeOff,
  Film,
  Filter,
  Folder,
  Gamepad2,
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
  MapPin,
  Minus,
  Pause,
  PawPrint,
  Pencil,
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
  Stethoscope,
  Tag,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  User,
  Users,
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
  calendar: Calendar,
  calendar_today: Calendar,
  car: Car,
  check: Check,
  check_circle: CheckCircle2,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  clock: Clock,
  close: X,
  content_copy: Copy,
  copy: Copy,
  dashboard: LayoutDashboard,
  directions_walk: Accessibility,
  edit: Pencil,
  encrypted: Lock,
  error: CircleAlert,
  filter_list: Filter,
  folder: Folder,
  film: Film,
  fitness_center: Dumbbell,
  games: Gamepad2,
  gift: Gift,
  groups: Users,
  graduation_cap: GraduationCap,
  heart_pulse: HeartPulse,
  history: History,
  home: Home,
  info: Info,
  label: Tag,
  location: MapPin,
  lock: Lock,
  logout: LogOut,
  mail: Mail,
  map_pin: MapPin,
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
  schedule: Clock,
  search: Search,
  self_improvement: Sparkles,
  settings: Settings,
  settings_account_box: Settings2,
  shopping_bag: ShoppingBag,
  stabilization: CircleDot,
  stethoscope: Stethoscope,
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
  work: Briefcase,
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
