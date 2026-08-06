"use client";

import type { CSSProperties } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleDot,
  Dumbbell,
  Eye,
  EyeOff,
  Filter,
  History,
  Home,
  ImageOff,
  LayoutDashboard,
  ListTodo,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Minus,
  Play,
  Plus,
  Repeat,
  Search,
  Settings,
  Settings2,
  Sparkles,
  TrendingDown,
  TriangleAlert,
  User,
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
  broken_image: ImageOff,
  calendar_today: Calendar,
  check: Check,
  check_circle: CheckCircle2,
  chevron_right: ChevronRight,
  close: X,
  dashboard: LayoutDashboard,
  directions_walk: Accessibility,
  encrypted: Lock,
  error: CircleAlert,
  filter_list: Filter,
  fitness_center: Dumbbell,
  history: History,
  home: Home,
  lock: Lock,
  logout: LogOut,
  mail: Mail,
  notifications: Bell,
  payments: Wallet,
  person: User,
  play_arrow: Play,
  play_circle: Play,
  priority_high: TriangleAlert,
  progress_activity: Loader2,
  radio_button_unchecked: Circle,
  remove: Minus,
  repeat: Repeat,
  search: Search,
  self_improvement: Sparkles,
  settings: Settings,
  settings_account_box: Settings2,
  stabilization: CircleDot,
  task_alt: ListTodo,
  trending_down: TrendingDown,
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
