"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { BalanceChart } from "@/components/charts/BalanceChart";
import { SkeletonTableRows } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/Table";
import { formatCurrency, formatDateTime, money } from "@/lib/utils";

interface Snapshot {
  date: string;
  balance: number;
}

export function BalanceHistoryView() {
  const [data, setData] = useState<Snapshot[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/balance-history?range=all", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled) setData(json?.points ?? []);
      })
      .catch(() => {
        if (!cancelled) setData([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = (data ?? []).slice(-20).reverse();

  return (
    <div className="space-y-5">
      <BalanceChart />

      <Card>
        <div className="px-5 pt-5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Simulated Balance History</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Recent balance snapshots recorded throughout the simulation</p>
        </div>
        <CardContent className="pt-2">
          {loading ? (
            <SkeletonTableRows rows={6} />
          ) : rows.length === 0 ? (
            <EmptyState title="No balance snapshots yet." description="Balance snapshots are recorded when simulated transfers are created." />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Date recorded</TableHeaderCell>
                  <TableHeaderCell className="text-right">Simulated balance</TableHeaderCell>
                  <TableHeaderCell className="text-right">Change</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => {
                  const next = rows[i + 1];
                  const delta = next ? money(row.balance) - money(next.balance) : 0;
                  return (
                    <TableRow key={`${row.date}-${i}`}>
                      <TableCell className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {formatDateTime(row.date)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-900 dark:text-slate-50">
                        {formatCurrency(row.balance)}
                      </TableCell>
                      <TableCell className={delta === 0 ? "text-right text-slate-400" : delta > 0 ? "text-right font-medium text-emerald-600 dark:text-emerald-400" : "text-right font-medium text-red-500"}>
                        {delta === 0 ? "—" : `${delta > 0 ? "+" : ""}${formatCurrency(delta)}`}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}