/**
 * Analytics Page — Alarm history charts, snooze trends, streak calendar, CSV export.
 * Uses recharts + mock event data from localStorage.
 */

import { useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlarmEventType } from "@/types/alarm";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import * as ipc from "@/lib/mock-ipc";

function useDerivedAnalytics() {
  const events = ipc.listAlarmEvents();

  return useMemo(() => {
    const byDate = new Map<string, { fired: number; snoozed: number; dismissed: number; missed: number }>();
    events.forEach((e) => {
      const date = e.FiredAt.split("T")[0];
      const entry = byDate.get(date) ?? { fired: 0, snoozed: 0, dismissed: 0, missed: 0 };
      const key = e.Type.toLowerCase() as "fired" | "snoozed" | "dismissed" | "missed";
      entry[key] += 1;
      byDate.set(date, entry);
    });

    const dailyData = Array.from(byDate.entries())
      .map(([date, counts]) => ({ date: date.slice(5), ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const snoozeTrend = events
      .filter((e) => e.SnoozeCount > 0)
      .map((e) => ({
        date: e.FiredAt.split("T")[0].slice(5),
        snoozeCount: e.SnoozeCount,
      }));

    const totalFired = events.filter((e) => e.Type === AlarmEventType.Fired).length;
    const totalSnoozed = events.filter((e) => e.Type === AlarmEventType.Snoozed).length;
    const avgSolveTime = (() => {
      const solved = events.filter((e) => e.ChallengeSolveTimeSec !== null);
      if (solved.length === 0) return 0;
      return solved.reduce((sum, e) => sum + (e.ChallengeSolveTimeSec ?? 0), 0) / solved.length;
    })();

    const dismissDates = new Set(
      events
        .filter((e) => e.Type === AlarmEventType.Fired || e.Type === AlarmEventType.Dismissed)
        .map((e) => e.FiredAt.split("T")[0])
    );
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      if (dismissDates.has(dateStr)) {
        streak++;
      } else {
        break;
      }
    }

    return { dailyData, snoozeTrend, totalFired, totalSnoozed, avgSolveTime, streak };
  }, [events]);
}

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <Card>
    <CardContent className="flex flex-col items-center p-4">
      <span className="text-2xl font-heading font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground font-body">{label}</span>
    </CardContent>
  </Card>
);

const Analytics = () => {
  const { t } = useTranslation();
  const { dailyData, snoozeTrend, totalFired, totalSnoozed, avgSolveTime, streak } =
    useDerivedAnalytics();

  const exportCsv = useCallback(() => {
    const events = ipc.listAlarmEvents();
    if (events.length === 0) return;
    const headers = ["AlarmId", "Type", "FiredAt", "SnoozeCount", "ChallengeSolveTimeSec"];
    const rows = events.map((e) =>
      [e.AlarmId, e.Type, e.FiredAt, e.SnoozeCount, e.ChallengeSolveTimeSec ?? ""].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alarm-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-heading font-bold">Analytics</h1>
        <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5">
          <Download className="h-4 w-4" />
          {t("analytics.exportCsv")}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Total Fired" value={totalFired} />
        <StatCard label="Snoozed" value={totalSnoozed} />
        <StatCard label="Streak" value={`${streak}d`} />
      </div>

      {avgSolveTime > 0 && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <span className="text-sm text-muted-foreground font-body">Avg Challenge Time</span>
            <span className="font-heading font-semibold">{avgSolveTime.toFixed(1)}s</span>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="history">
        <TabsList className="w-full">
          <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
          <TabsTrigger value="snooze" className="flex-1">Snooze Trend</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-heading">Daily Alarm Events</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyData.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="fired" stackId="a" fill="hsl(var(--primary))" />
                    <Bar dataKey="snoozed" stackId="a" fill="hsl(var(--snooze))" />
                    <Bar dataKey="dismissed" stackId="a" fill="hsl(var(--dismiss))" />
                    <Bar dataKey="missed" stackId="a" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="snooze">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-heading">Snooze Count Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {snoozeTrend.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No snooze data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={snoozeTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="snoozeCount"
                      stroke="hsl(var(--snooze))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--snooze))", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
