"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, ShieldAlert, ShieldCheck, UserCheck, UserPlus, UserX, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { formatDate, initials } from "@/lib/utils";

interface AdminUserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
  accountCount: number;
}

interface AdminStats {
  total: number;
  active: number;
  deactivated: number;
}

interface AdminUsersViewProps {
  currentUserId: string;
}

type Filter = "all" | "active" | "deactivated";

export function AdminUsersView({ currentUserId }: AdminUsersViewProps) {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [stats, setStats] = useState<AdminStats>({ total: 0, active: 0, deactivated: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  // Confirmation state — a status is never changed without this modal.
  const [pending, setPending] = useState<{ user: AdminUserRow; nextActive: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Create-user state.
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [createError, setCreateError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });

  function setNewUserField(name: keyof typeof newUser, value: string) {
    setNewUser((prev) => ({ ...prev, [name]: value }));
    setCreateErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function openCreate() {
    setNewUser({ firstName: "", lastName: "", email: "", password: "", phone: "" });
    setCreateErrors({});
    setCreateError(null);
    setCreateOpen(true);
  }

  async function submitCreate(e?: React.FormEvent) {
    e?.preventDefault();
    setCreateErrors({});
    setCreateError(null);

    // Mirror of the server rules so obvious mistakes never reach the API.
    const clientErrors: Record<string, string> = {};
    if (!newUser.firstName.trim()) clientErrors.firstName = "First name is required.";
    if (!newUser.lastName.trim()) clientErrors.lastName = "Last name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email.trim())) {
      clientErrors.email = "Enter a valid email address.";
    }
    if (newUser.password.length < 8) clientErrors.password = "Password must be at least 8 characters.";
    else if (!/[A-Z]/.test(newUser.password) || !/[a-z]/.test(newUser.password) || !/\d/.test(newUser.password)) {
      clientErrors.password = "Password must include uppercase, lowercase and a number.";
    }
    if (Object.keys(clientErrors).length > 0) {
      setCreateErrors(clientErrors);
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setCreateError(json?.error ?? "Something went wrong. Please try again.");
        setCreateErrors(json?.errors ?? {});
        return;
      }
      setCreateOpen(false);
      setNotice(`${json.user.firstName} ${json.user.lastName} was created and can now sign in.`);
      // Refresh the list so the new account and updated counts appear.
      setLoading(true);
      load();
    } catch {
      setCreateError("Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  const load = useCallback(() => {
    fetch("/api/admin/users", { cache: "no-store" })
      .then((r) => r.json().then((json) => ({ ok: r.ok, json })).catch(() => ({ ok: false, json: null })))
      .then(({ ok, json }) => {
        if (!ok || !json) {
          setLoadError(json?.error ?? "Could not load users.");
          return;
        }
        setUsers(json.users ?? []);
        setStats(json.stats ?? { total: 0, active: 0, deactivated: 0 });
        setLoadError(null);
      })
      .catch(() => setLoadError("Something went wrong. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-clear the success notice so the banner does not linger.
  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(t);
  }, [notice]);

  async function confirmChange() {
    if (!pending) return;
    setSaving(true);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: pending.user.id, isActive: pending.nextActive }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setActionError(json?.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStats(json.stats);
      setUsers((prev) => prev.map((u) => (u.id === json.user.id ? json.user : u)));
      setNotice(
        json.user.isActive
          ? `${json.user.firstName} ${json.user.lastName} is now active.`
          : `${json.user.firstName} ${json.user.lastName} has been deactivated.`,
      );
      setPending(null);
    } catch {
      setActionError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Search matches on name (first or last, in any order) or email, and is
  // combined with the active/deactivated filter.
  const q = query.trim().toLowerCase();
  const visible = users.filter((u) => {
    const matchesStatus = filter === "all" ? true : filter === "active" ? u.isActive : !u.isActive;
    if (!matchesStatus) return false;
    if (!q) return true;
    const name = `${u.firstName} ${u.lastName}`.toLowerCase();
    return name.includes(q) || u.email.toLowerCase().includes(q);
  });

  const statsCards: Array<{ key: "total" | "active" | "deactivated"; label: string; icon: typeof Users; tone: string; filter?: Exclude<Filter, "all"> }> = [
    { key: "total", label: "Total registered users", icon: Users, tone: "text-slate-900 dark:text-slate-100" },
    { key: "active", label: "Active users", icon: UserCheck, tone: "text-emerald-600 dark:text-emerald-400", filter: "active" },
    { key: "deactivated", label: "Deactivated users", icon: UserX, tone: "text-red-600 dark:text-red-400", filter: "deactivated" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statsCards.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key];
          const inner = (
            <Card className="h-full">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                  <Icon className={`size-5 ${card.tone}`} aria-hidden="true" />
                </div>
                <p className={`mt-2 text-3xl font-bold ${card.tone}`}>{loading ? "—" : value}</p>
              </CardContent>
            </Card>
          );
          if (!card.filter) {
            return <div key={card.key}>{inner}</div>;
          }
          const selected = filter === card.filter;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setFilter(selected ? "all" : card.filter!)}
              aria-pressed={selected}
              className={`text-left transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                selected ? "ring-2 ring-brand-500" : ""
              }`}
            >
              {inner}
            </button>
          );
        })}
      </div>

      {notice && (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
        >
          {notice}
        </p>
      )}

      {loadError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {loadError}
        </p>
      )}

      {/* User list */}
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Registered users</h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative sm:w-64">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <Input
                  srOnlyLabel
                  label="Search users"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name or email…"
                  className="h-9 pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                {(["all", "active", "deactivated"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    aria-pressed={filter === f}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                      filter === f
                        ? "bg-brand-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {f}
                  </button>
                ))}
                <Button size="sm" onClick={openCreate} className="ml-1">
                  <UserPlus className="size-4" aria-hidden="true" />
                  Create user
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400">Loading users…</p>
          ) : visible.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              {q
                ? `No users match “${query.trim()}”.`
                : "No users match this filter."}
            </p>
          ) : (
            <Table>
              <TableHead>
                <TableRow className="hover:bg-transparent">
                  <TableHeaderCell className="w-[30%]">User</TableHeaderCell>
                  <TableHeaderCell className="w-[20%]">Status</TableHeaderCell>
                  <TableHeaderCell className="w-[20%]">Joined</TableHeaderCell>
                  <TableHeaderCell className="w-[15%] text-right">Accounts</TableHeaderCell>
                  <TableHeaderCell className="w-[15%] text-right">Action</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.map((u) => {
                  const fullName = `${u.firstName} ${u.lastName}`;
                  const isSelf = u.id === currentUserId;
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-900 text-xs font-bold text-white">
                            {initials(u.firstName, u.lastName)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                              {fullName}
                              {isSelf && <span className="ml-2 text-xs font-normal text-slate-400">(you)</span>}
                            </p>
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {u.isActive ? (
                          <Badge tone="success">Active</Badge>
                        ) : (
                          <Badge tone="danger">Deactivated</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400">
                        {formatDate(u.createdAt)}
                      </TableCell>
                      <TableCell className="text-right text-slate-500 dark:text-slate-400">
                        {u.accountCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {u.isActive ? (
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={isSelf}
                            onClick={() => {
                              setActionError(null);
                              setPending({ user: u, nextActive: false });
                            }}
                          >
                            <UserX className="size-4" aria-hidden="true" />
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => {
                              setActionError(null);
                              setPending({ user: u, nextActive: true });
                            }}
                          >
                            <UserCheck className="size-4" aria-hidden="true" />
                            Activate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirmation modal */}
      <Modal
        open={pending !== null}
        onClose={() => (saving ? undefined : setPending(null))}
        title={pending?.nextActive ? "Activate this account?" : "Deactivate this account?"}
        description={
          pending
            ? `${pending.user.firstName} ${pending.user.lastName} · ${pending.user.email}`
            : undefined
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setPending(null)} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant={pending?.nextActive ? "success" : "danger"}
              loading={saving}
              onClick={() => void confirmChange()}
            >
              {pending?.nextActive ? "Activate account" : "Deactivate account"}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          {pending?.nextActive ? (
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span>
                This user will be able to sign in again with their existing email and password. All of their
                accounts and transactions are already intact and remain untouched.
              </span>
            </p>
          ) : (
            <p className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
              <span>
                This user will no longer be able to sign in, and any active session will stop working
                immediately. Their accounts, transactions and history are kept and are restored when the
                account is reactivated.
              </span>
            </p>
          )}
          {actionError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
              {actionError}
            </p>
          )}
        </div>
      </Modal>

      {/* Create user modal — admin-only, enforced server-side as well */}
      <Modal
        open={createOpen}
        onClose={() => (creating ? undefined : setCreateOpen(false))}
        title="Create a new user"
        description="The new account is active and can sign in immediately with the password you set."
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button loading={creating} onClick={() => void submitCreate()}>
              {creating ? "Creating…" : "Create user"}
            </Button>
          </>
        }
      >
        <form onSubmit={submitCreate} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              autoComplete="off"
              placeholder="Michael"
              value={newUser.firstName}
              onChange={(e) => setNewUserField("firstName", e.target.value)}
              error={createErrors.firstName}
            />
            <Input
              label="Last name"
              autoComplete="off"
              placeholder="Anderson"
              value={newUser.lastName}
              onChange={(e) => setNewUserField("lastName", e.target.value)}
              error={createErrors.lastName}
            />
          </div>

          <Input
            label="Email"
            type="email"
            autoComplete="off"
            placeholder="customer@example.com"
            value={newUser.email}
            onChange={(e) => setNewUserField("email", e.target.value)}
            error={createErrors.email}
          />

          <Input
            label="Temporary password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters with uppercase, lowercase and a number. Share it with the user securely."
            placeholder="••••••••"
            value={newUser.password}
            onChange={(e) => setNewUserField("password", e.target.value)}
            error={createErrors.password}
          />

          <Input
            label="Phone (optional)"
            type="tel"
            autoComplete="off"
            placeholder="+1 (555) 010-2030"
            value={newUser.phone}
            onChange={(e) => setNewUserField("phone", e.target.value)}
            error={createErrors.phone}
          />

          {createError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
              {createError}
            </p>
          )}

          <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
        </form>
      </Modal>
    </div>
  );
}
