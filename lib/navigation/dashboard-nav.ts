import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookMarked,
  BookOpen,
  CalendarDays,
  FileText,
  Kanban,
  LayoutTemplate,
  LayoutDashboard,
  Link2,
  MessageCircle,
  Puzzle,
  Share2,
  Sparkles,
  TrendingUp,
  UserSearch,
  Users,
  Workflow,
  Zap,
} from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type DashboardNavGroup = {
  id: string;
  label: string;
  items: DashboardNavItem[];
};

export const DASHBOARD_NAV_GROUPS: DashboardNavGroup[] = [
  {
    id: "werk",
    label: "Werk",
    items: [
      { href: "/dashboard", label: "Home", icon: LayoutDashboard },
      { href: "/dashboard/inbox", label: "Chat", icon: MessageCircle },
      { href: "/dashboard/quotes", label: "Offertes", icon: FileText },
      { href: "/dashboard/leads", label: "Leads", icon: UserSearch },
      { href: "/dashboard/pipeline", label: "Pipeline", icon: Kanban },
      { href: "/dashboard/appointments", label: "Afspraken", icon: CalendarDays },
    ],
  },
  {
    id: "inzicht",
    label: "Inzicht & groei",
    items: [
      { href: "/dashboard/insights", label: "Insights", icon: BarChart3 },
      { href: "/dashboard/growth", label: "Growth", icon: TrendingUp },
      { href: "/dashboard/sales", label: "Sales", icon: Zap },
    ],
  },
  {
    id: "ai",
    label: "AI & koppelingen",
    items: [
      { href: "/dashboard/ai", label: "AI-assistent", icon: Sparkles },
      { href: "/dashboard/ai-koppelingen", label: "AI-koppelingen", icon: Link2 },
      { href: "/dashboard/ai-knowledge", label: "AI-kennis", icon: BookMarked },
      { href: "/dashboard/automations", label: "Automations", icon: Workflow },
      { href: "/dashboard/playbooks", label: "Playbooks", icon: BookOpen },
      { href: "/dashboard/templates", label: "Templates", icon: LayoutTemplate },
      { href: "/dashboard/integrations", label: "Integraties", icon: Puzzle },
      { href: "/dashboard/socials", label: "Socials", icon: Share2 },
    ],
  },
  {
    id: "team",
    label: "Team",
    items: [{ href: "/dashboard/team", label: "Team", icon: Users }],
  },
];

export const DASHBOARD_NAV_FLAT: DashboardNavItem[] =
  DASHBOARD_NAV_GROUPS.flatMap((g) => g.items);
