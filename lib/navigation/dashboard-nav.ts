import type { LucideIcon } from "lucide-react";
import {
  Bot,
  CalendarDays,
  FileText,
  Kanban,
  LayoutDashboard,
  Link2,
  Mail,
  MessageCircle,
  Settings2,
  Share2,
  UserSearch,
  Users,
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
    id: "ai",
    label: "AI & antwoorden",
    items: [
      { href: "/dashboard/chatbot", label: "Je chatbot", icon: Bot },
      { href: "/dashboard/ai-koppelingen", label: "Kanalen", icon: Link2 },
      { href: "/dashboard/socials", label: "Socials", icon: Share2 },
    ],
  },
  {
    id: "werk",
    label: "Werk",
    items: [
      { href: "/dashboard", label: "Home", icon: LayoutDashboard },
      { href: "/dashboard/inbox", label: "Chat", icon: MessageCircle },
      { href: "/dashboard/quotes", label: "Offertes", icon: FileText },
      { href: "/dashboard/leads", label: "Klanten", icon: UserSearch },
      { href: "/dashboard/nieuwsbrief", label: "Nieuwsbrief", icon: Mail },
      { href: "/dashboard/pipeline", label: "Pipeline", icon: Kanban },
      { href: "/dashboard/appointments", label: "Afspraken", icon: CalendarDays },
    ],
  },
  {
    id: "team",
    label: "Team",
    items: [
      { href: "/dashboard/team", label: "Team", icon: Users },
      { href: "/dashboard/settings", label: "Instellingen", icon: Settings2 },
    ],
  },
];

export const DASHBOARD_NAV_FLAT: DashboardNavItem[] =
  DASHBOARD_NAV_GROUPS.flatMap((g) => g.items);
