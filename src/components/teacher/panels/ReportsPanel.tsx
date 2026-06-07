import { CalendarClock, FileText, HelpCircle, Layers } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type TemplateSummary = {
  id: string;
  title: string;
  category: string;
  question_count: number;
  duration_minutes: number;
  created_at: string;
};

export type EventSummary = {
  id: string;
  template_id: string;
  start_time: string;
  status: string;
};

type ReportsPanelProps = {
  questionCount: number;
  templates: TemplateSummary[];
  events: EventSummary[];
  paperCount: number;
  loading: boolean;
};

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" });
}

export default function ReportsPanel({
  questionCount,
  templates,
  events,
  paperCount,
  loading,
}: ReportsPanelProps) {
  const stats = [
    { label: "মোট প্রশ্ন", value: questionCount, icon: HelpCircle },
    { label: "প্রশ্ন সেট", value: templates.length, icon: Layers },
    { label: "অনলাইন পরীক্ষা", value: events.length, icon: CalendarClock },
    { label: "আপলোডকৃত পেপার", value: paperCount, icon: FileText },
  ];

  const totalQuestionsInSets = templates.reduce((sum, t) => sum + (t.question_count || 0), 0);

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 pt-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-2xl font-bold">{loading ? "…" : s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>প্রশ্ন সেট রিপোর্ট</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-sm text-muted-foreground">এখনো কোনো প্রশ্ন সেট তৈরি হয়নি।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-2">টাইটেল</th>
                    <th className="py-2 pr-2">ক্যাটাগরি</th>
                    <th className="py-2 pr-2">প্রশ্ন</th>
                    <th className="py-2 pr-2">সময়</th>
                    <th className="py-2 pr-2">তৈরি</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((t) => (
                    <tr key={t.id} className="border-b last:border-0">
                      <td className="py-2 pr-2 font-medium">{t.title}</td>
                      <td className="py-2 pr-2">
                        <Badge variant="secondary">{t.category}</Badge>
                      </td>
                      <td className="py-2 pr-2">{t.question_count}</td>
                      <td className="py-2 pr-2">{t.duration_minutes} মি. </td>
                      <td className="py-2 pr-2 text-muted-foreground">{formatDate(t.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t font-semibold">
                    <td className="py-2 pr-2">মোট</td>
                    <td className="py-2 pr-2" />
                    <td className="py-2 pr-2">{totalQuestionsInSets}</td>
                    <td className="py-2 pr-2" colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>অনলাইন পরীক্ষা রিপোর্ট</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-sm text-muted-foreground">কোনো অনলাইন পরীক্ষা শিডিউল করা হয়নি।</div>
          ) : (
            <div className="space-y-2">
              {events.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                  <span>{formatDate(e.start_time)}</span>
                  <Badge variant={e.status === "live" ? "default" : "secondary"} className="capitalize">
                    {e.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
