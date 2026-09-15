import {
  LayoutDashboard,
  CreditCard,
  Send,
  ArrowLeftRight,
  Clock3,
  ChartSpline,
  UserRound,
  Bell,
  Headphones,
  Shield,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
}

const isExact = (href: string) => (pathname: string) => pathname === href;
const isPrefix = (href: string) => (pathname: string) => pathname === href || pathname.startsWith(href + "/");

const isPending = (pathname: string) => pathname === "/fargo/pending";
const isTransactions = (pathname: string) => pathname.startsWith("/fargo/transactions") && !isPending(pathname);

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const FARGO_NAV_GROUPS: NavGroup[] = [
  {
    title: "Main",
    items: [
      { href: "/fargo/dashboard", label: "Dashboard", icon: LayoutDashboard, match: isExact("/fargo/dashboard") },
      { href: "/fargo/payments", label: "Payments", icon: CreditCard, match: isPrefix("/fargo/payments") },
      { href: "/fargo/transfers", label: "Transfers", icon: Send, match: isPrefix("/fargo/transfers") },
      { href: "/fargo/transactions", label: "Transactions", icon: ArrowLeftRight, match: isTransactions },
      { href: "/fargo/pending", label: "Pending", icon: Clock3, match: isPending },
      { href: "/fargo/balance-history", label: "Balance History", icon: ChartSpline, match: isExact("/fargo/balance-history") },
    ],
  },
  {
    title: "Manage",
    items: [
      { href: "/fargo/account", label: "Account", icon: UserRound, match: isExact("/fargo/account") },
      { href: "/fargo/notifications", label: "Notifications", icon: Bell, match: isExact("/fargo/notifications") },
      { href: "/fargo/support", label: "Support", icon: Headphones, match: isPrefix("/fargo/support") },
      { href: "/fargo/security", label: "Security", icon: Shield, match: isExact("/fargo/security") },
    ],
  },
];

export const FARGO_PENDING_HREF = "/fargo/pending";
