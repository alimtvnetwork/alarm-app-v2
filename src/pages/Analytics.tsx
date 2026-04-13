/**
 * Analytics Page — Alarm history charts, snooze trends, dismiss ratio, streak, CSV export.
 * Uses recharts + mock event data from localStorage.
 */

import { useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
    const totalDismissed = events.filter((e) => e.Type === AlarmEventType.Dismissed).length;
    const totalMissed = events.filter((e) => e.Type === AlarmEventType.Missed).length;

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

    const pieData = [
      { name: "Fired", value: totalFired },
      { name: "Snoozed", value: totalSnoozed },
      { name: "Dismissed", value: totalDismissed },
      { name: "Missed", value: totalMissed },
    ].filter((d) => d.value > 0);

    return { dailyData, snoozeTrend, totalFired, totalSnoozed, avgSolveTime, streak, pieData };
  }, [events]);
}

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--snooze))",
  "hsl(var(--dismiss))",
  "hsl(var(--destructive))",
];

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
  const { dailyData, snoozeTrend, totalFired, totalSnoozed, avgSolveTime, streak, pieData } =
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
        <h1 className="text-xl font-heading font-bold">{t("analytics.title")}</h1>
        <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5">
          <Download className="h-4 w-4" />
          {t("analytics.exportCsv")}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatCard label={t("analytics.totalFired")} value={totalFired} />
        <StatCard label={t("analytics.snoozed")} value={totalSnoozed} />
        <StatCard label={t("analytics.streak")} value={`${streak}d`} />
      </div>

      {avgSolveTime > 0 && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <span className="text-sm text-muted-foreground font-body">{t("analytics.avgChallengeTime")}</span>
            <span className="font-heading font-semibold">{avgSolveTime.toFixed(1)}s</span>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="history">
        <TabsList className="w-full">
          <TabsTrigger value="history" className="flex-1">{t("analytics.history")}</TabsTrigger>
          <TabsTrigger value="snooze" className="flex-1">{t("analytics.snoozeTrend")}</TabsTrigger>
          <TabsTrigger value="breakdown" className="flex-1">{t("analytics.breakdown")}</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-heading">{t("analytics.dailyEvents")}</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyData.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">{t("analytics.noData")}</p>
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
              <CardTitle className="text-sm font-heading">{t("analytics.snoozeCountTrend")}</CardTitle>
            </CardHeader>
            <CardContent>
              {snoozeTrend.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">{t("analytics.noSnoozeData")}</p>
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

        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-heading">{t("analytics.eventBreakdown")}</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">{t("analytics.noData")}</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                      label={false}
                    >
                      {pieData.map((_entry, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                      formatter={(value: string, entry: any) => {
                        const total = pieData.reduce((s, d) => s + d.value, 0);
                        const item = pieData.find((d) => d.name === value);
                        const pct = item && total > 0 ? Math.round((item.value / total) * 100) : 0;
                        return <span style={{ color: "hsl(var(--muted-foreground))" }}>{value} {pct}%</span>;
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
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
