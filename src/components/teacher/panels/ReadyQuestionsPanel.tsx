import { ArrowRight, FileStack, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TemplateSummary } from "@/components/teacher/panels/ReportsPanel";

const READY_PACKS = [
  { title: "প্রাইমারি বৃত্তি মডেল টেস্ট", subject: "সকল বিষয়", count: 100, level: "প্রাইমারি" },
  { title: "SSC বোর্ড স্ট্যান্ডার্ড MCQ", subject: "পদার্থ/রসায়ন/জীববিজ্ঞান", count: 150, level: "SSC" },
  { title: "HSC মডেল টেস্ট সিরিজ", subject: "বিজ্ঞান বিভাগ", count: 200, level: "HSC" },
  { title: "চাকরি প্রস্তুতি (BCS/ব্যাংক)", subject: "সাধারণ জ্ঞান + গণিত", count: 250, level: "Job" },
];

type ReadyQuestionsPanelProps = {
  templates: TemplateSummary[];
  loading: boolean;
  onCreateNew: () => void;
};

export default function ReadyQuestionsPanel({ templates, loading, onCreateNew }: ReadyQuestionsPanelProps) {
  return (
    <div className="mt-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> রেডি প্রশ্ন / সাজেশন
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            রেডিমেড প্যাকেজ থেকে দ্রুত প্রশ্নপত্র বানান, অথবা প্রশ্নব্যাংক থেকে নিজের সেট তৈরি করুন।
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {READY_PACKS.map((pack) => (
              <div key={pack.title} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{pack.level}</Badge>
                  <span className="text-xs text-muted-foreground">{pack.count}+ প্রশ্ন</span>
                </div>
                <div className="mt-2 font-semibold">{pack.title}</div>
                <div className="text-xs text-muted-foreground">{pack.subject}</div>
                <Button variant="ghost" size="sm" className="mt-2 px-0" onClick={onCreateNew}>
                  সেট তৈরি করুন <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <FileStack className="h-5 w-5 text-primary" /> আমার সংরক্ষিত সেট
          </CardTitle>
          <Button size="sm" onClick={onCreateNew}>
            নতুন সেট
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">লোড হচ্ছে...</div>
          ) : templates.length === 0 ? (
            <div className="text-sm text-muted-foreground">এখনো কোনো সেট সংরক্ষণ করা হয়নি।</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => (
                <div key={t.id} className="rounded-xl border border-border p-4">
                  <div className="font-semibold">{t.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {t.question_count} প্রশ্ন • {t.duration_minutes} মিনিট
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    {t.category}
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
