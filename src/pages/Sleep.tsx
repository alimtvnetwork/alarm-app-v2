/**
 * Sleep Page — Sleep quality tracking, bedtime goals, weekly sleep chart.
 */

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Moon, Sun, Star } from "lucide-react";

// Mock weekly sleep data
const MOCK_SLEEP_DATA = [
  { day: "Mon", hours: 7.5, quality: 4 },
  { day: "Tue", hours: 6.2, quality: 3 },
  { day: "Wed", hours: 8.0, quality: 5 },
  { day: "Thu", hours: 7.0, quality: 4 },
  { day: "Fri", hours: 5.5, quality: 2 },
  { day: "Sat", hours: 9.0, quality: 5 },
  { day: "Sun", hours: 8.5, quality: 4 },
];

const MOODS = [
  { emoji: "😴", label: "Exhausted" },
  { emoji: "😐", label: "Tired" },
  { emoji: "🙂", label: "OK" },
  { emoji: "😊", label: "Good" },
  { emoji: "🤩", label: "Great" },
];

const Sleep = () => {
  const [sleepQuality, setSleepQuality] = useState(3);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const avgHours = (
    MOCK_SLEEP_DATA.reduce((sum, d) => sum + d.hours, 0) / MOCK_SLEEP_DATA.length
  ).toFixed(1);

  const avgQuality = (
    MOCK_SLEEP_DATA.reduce((sum, d) => sum + d.quality, 0) / MOCK_SLEEP_DATA.length
  ).toFixed(1);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-heading font-bold">Sleep</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2">
        <Card>
          <CardContent className="flex flex-col items-center p-4">
            <Moon className="mb-1 h-5 w-5 text-primary" />
            <span className="text-2xl font-heading font-bold">{avgHours}h</span>
            <span className="text-xs text-muted-foreground font-body">Avg Sleep</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-4">
            <Star className="mb-1 h-5 w-5 text-alarm-snooze" />
            <span className="text-2xl font-heading font-bold">{avgQuality}/5</span>
            <span className="text-xs text-muted-foreground font-body">Avg Quality</span>
          </CardContent>
        </Card>
      </div>

      {/* Weekly chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-heading">This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MOCK_SLEEP_DATA}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis
                domain={[0, 12]}
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                label={{ value: "hrs", angle: -90, position: "insideLeft", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Log today's sleep */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-heading">
            <Sun className="h-4 w-4" />
            How did you sleep?
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Quality slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-body">
              <span>Quality</span>
              <span>{sleepQuality}/5</span>
            </div>
            <Slider
              value={[sleepQuality]}
              onValueChange={([v]) => setSleepQuality(v)}
              min={1}
              max={5}
              step={1}
            />
          </div>

          {/* Mood selector */}
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-body">Mood</span>
            <div className="flex justify-between gap-1">
              {MOODS.map((mood, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedMood(i)}
                  className={`flex flex-col items-center gap-0.5 rounded-lg p-2 transition-colors ${
                    selectedMood === i
                      ? "bg-primary/15 ring-1 ring-primary"
                      : "hover:bg-secondary"
                  }`}
                >
                  <span className="text-xl">{mood.emoji}</span>
                  <span className="text-[10px] text-muted-foreground">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full">Save</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sleep;
