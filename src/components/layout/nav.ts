import {
  LayoutDashboard,
  Send,
  ArrowLeftRight,
  Clock3,
  ChartSpline,
  UserRound,
  Bell,
  Headphones,
  Shield,
  ArrowRightToLine,
  type LucideIcon,
} from "lucide-react";

const NOVAPAY = "/novapay";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
}

const isExact = (href: string) => (pathname: string) => pathname === href;
const isPrefix = (href: string) => (pathname: string) => pathname === href || pathname.startsWith(href + "/");

const isPending = (pathname: string) => pathname === `${NOVAPAY}/transactions/pending`;
const isTransactions = (pathname: string) => pathname.startsWith(`${NOVAPAY}/transactions`) && !isPending(pathname);

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Main",
    items: [
      { href: `${NOVAPAY}/dashboard`, label: "Dashboard", icon: LayoutDashboard, match: isExact(`${NOVAPAY}/dashboard`) },
      { href: `${NOVAPAY}/transfer`, label: "Transfer", icon: Send, match: isExact(`${NOVAPAY}/transfer`) },
      { href: `${NOVAPAY}/transfer-to-fargo`, label: "Transfer to Fargo", icon: ArrowRightToLine, match: isExact(`${NOVAPAY}/transfer-to-fargo`) },
      { href: `${NOVAPAY}/transactions`, label: "Transactions", icon: ArrowLeftRight, match: isTransactions },
      { href: `${NOVAPAY}/transactions/pending`, label: "Pending", icon: Clock3, match: isPending },
      { href: `${NOVAPAY}/balance-history`, label: "Balance History", icon: ChartSpline, match: isExact(`${NOVAPAY}/balance-history`) },
    ],
  },
  {
    title: "Manage",
    items: [
      { href: `${NOVAPAY}/account`, label: "Account", icon: UserRound, match: isExact(`${NOVAPAY}/account`) },
      { href: `${NOVAPAY}/notifications`, label: "Notifications", icon: Bell, match: isExact(`${NOVAPAY}/notifications`) },
      { href: `${NOVAPAY}/support`, label: "Support", icon: Headphones, match: isPrefix(`${NOVAPAY}/support`) },
      { href: `${NOVAPAY}/security`, label: "Security", icon: Shield, match: isExact(`${NOVAPAY}/security`) },
    ],
  },
];

export const PENDING_HREF = `${NOVAPAY}/transactions/pending`;