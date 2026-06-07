import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Copy, Link2, Loader2, Play, Radio, Square } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { examsApi, leaderboardApi } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

export type ScheduleTemplate = { id: string; title: string };

export type ScheduleEvent = {
  id: string;
  template_id: string;
  start_time: string;
  status: string;
  participants: number | null;
  prize: string | null;
};

type ExamSchedulePanelProps = {
  templates: ScheduleTemplate[];
  templatesLoading: boolean;
  events: ScheduleEvent[];
  eventsLoading: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  upcoming: "আসন্ন",
  "starting-soon": "শীঘ্রই শুরু",
  live: "লাইভ",
};

function statusVariant(status: string): "default" | "secondary" | "outline" {
  if (status === "live") return "default";
  if (status === "starting-soon") return "secondary";
  return "outline";
}

function shareLink(templateId: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/exam/${templateId}`;
}

type TemplateDetails = {
  title?: string;
  category?: string;
  question_count?: number;
  duration_minutes?: number;
  marks_per_question?: number | string;
  negative_marks?: number | string;
  subjects_breakdown?: unknown;
};

type LeaderRow = { rank: number; name: string; score: number; exams: number; accuracy: number };

export default function ExamSchedulePanel({
  templates,
  templatesLoading,
  events,
  eventsLoading,
}: ExamSchedulePanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [eventTemplateId, setEventTemplateId] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventPrize, setEventPrize] = useState("");
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reportEvent, setReportEvent] = useState<ScheduleEvent | null>(null);

  const templateTitle = (id: string) => templates.find((t) => t.id === id)?.title || "প্রশ্ন সেট";

  const refreshEvents = () => queryClient.invalidateQueries({ queryKey: ["teacher-events"] });

  const handleCreateEvent = async () => {
    if (!eventTemplateId) {
      toast({ title: "ত্রুটি", description: "টেমপ্লেট সিলেক্ট করুন।", variant: "destructive" });
      return;
    }
    if (!eventStartTime) {
      toast({ title: "ত্রুটি", description: "শুরুর সময় দিন।", variant: "destructive" });
      return;
    }
    try {
      setCreatingEvent(true);
      const start = new Date(eventStartTime);
      if (Number.isNaN(start.getTime())) throw new Error("Invalid start time");
      const res = await supabase.from("live_exam_events" as never).insert({
        template_id: eventTemplateId,
        start_time: start.toISOString(),
        status: "upcoming",
        participants: 0,
        prize: eventPrize.trim() || null,
      } as unknown as never);
      if (res.error) throw res.error;
      toast({ title: "সফল!", description: "লাইভ এক্সাম শিডিউল হয়েছে।" });
      setEventStartTime("");
      setEventPrize("");
      refreshEvents();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "শিডিউল করতে সমস্যা হয়েছে।";
      toast({ title: "ত্রুটি", description: message, variant: "destructive" });
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleStatus = async (event: ScheduleEvent, status: "upcoming" | "live") => {
    try {
      setUpdatingId(event.id);
      const res = await supabase
        .from("live_exam_events" as never)
        .update({ status } as unknown as never)
        .eq("id", event.id);
      if (res.error) throw res.error;
      toast({
        title: status === "live" ? "লাইভ!" : "বন্ধ হয়েছে",
        description: status === "live" ? "পরীক্ষাটি এখন লাইভ।" : "পরীক্ষাটি আসন্ন অবস্থায় ফিরেছে।",
      });
      refreshEvents();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "স্ট্যাটাস আপডেট করা যায়নি।";
      toast({ title: "ত্রুটি", description: message, variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCopyLink = async (templateId: string) => {
    try {
      await navigator.clipboard.writeText(shareLink(templateId));
      toast({ title: "কপি হয়েছে!", description: "সিকিউর লিংক ক্লিপবোর্ডে কপি হয়েছে।" });
    } catch {
      toast({ title: "ত্রুটি", description: "কপি করা যায়নি।", variant: "destructive" });
    }
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>লাইভ এক্সাম শিডিউল</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>টেমপ্লেট</Label>
            {templatesLoading ? (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে...
              </div>
            ) : (
              <Select value={eventTemplateId} onValueChange={setEventTemplateId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="টেমপ্লেট সিলেক্ট" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label>শুরুর সময়</Label>
            <Input
              className="mt-2"
              type="datetime-local"
              value={eventStartTime}
              onChange={(e) => setEventStartTime(e.target.value)}
            />
          </div>

          <div>
            <Label>প্রাইজ (ঐচ্ছিক)</Label>
            <Input
              className="mt-2"
              value={eventPrize}
              onChange={(e) => setEventPrize(e.target.value)}
              placeholder="যেমন: ১ম পুরস্কার"
            />
          </div>

          <Button onClick={handleCreateEvent} disabled={creatingEvent}>
            {creatingEvent ? "শিডিউল হচ্ছে..." : "শিডিউল করুন"}
          </Button>
          <p className="text-xs text-muted-foreground">
            শিডিউল করার পর “সিকিউর লিংক” কপি করে শিক্ষার্থীদের পাঠান — তারা ওই লিংকে গিয়ে পরীক্ষা দিতে পারবে।
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>আমার শিডিউল</CardTitle>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-sm text-muted-foreground">কোনো শিডিউলড এক্সাম নেই।</div>
          ) : (
            <div className="space-y-3">
              {events.map((e) => (
                <div key={e.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">
                        {templateTitle(e.template_id)}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {new Date(e.start_time).toLocaleString("bn-BD")}
                      </div>
                    </div>
                    <Badge variant={statusVariant(e.status)} className="shrink-0">
                      {STATUS_LABEL[e.status] || e.status}
                    </Badge>
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>অংশগ্রহণকারী: {e.participants ?? 0}</span>
                    {e.prize ? <span>প্রাইজ: {e.prize}</span> : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleCopyLink(e.template_id)}>
                      <Copy className="mr-1 h-3.5 w-3.5" /> লিংক
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={shareLink(e.template_id)} target="_blank" rel="noreferrer">
                        <Link2 className="mr-1 h-3.5 w-3.5" /> ওপেন
                      </a>
                    </Button>
                    {e.status === "live" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingId === e.id}
                        onClick={() => handleStatus(e, "upcoming")}
                      >
                        <Square className="mr-1 h-3.5 w-3.5" /> বন্ধ
                      </Button>
                    ) : (
                      <Button size="sm" disabled={updatingId === e.id} onClick={() => handleStatus(e, "live")}>
                        {updatingId === e.id ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Radio className="mr-1 h-3.5 w-3.5" />
                        )}
                        লাইভ
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setReportEvent(e)}>
                      <BarChart3 className="mr-1 h-3.5 w-3.5" /> রিপোর্ট
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ReportDialog
        event={reportEvent}
        templateTitle={reportEvent ? templateTitle(reportEvent.template_id) : ""}
        onOpenChange={(open) => !open && setReportEvent(null)}
      />
    </div>
  );
}

function ReportDialog({
  event,
  templateTitle,
  onOpenChange,
}: {
  event: ScheduleEvent | null;
  templateTitle: string;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: details, isLoading: detailsLoading } = useQuery({
    queryKey: ["exam-report-details", event?.template_id],
    enabled: Boolean(event?.template_id),
    queryFn: async () => {
      const res = await examsApi.details(event!.template_id);
      return (res.data || {}) as TemplateDetails;
    },
  });

  const { data: leaders, isLoading: leadersLoading } = useQuery({
    queryKey: ["exam-report-leaders"],
    enabled: Boolean(event),
    queryFn: async () => {
      const res = await leaderboardApi.rankings({ limit: 10 });
      return (res.data || []) as LeaderRow[];
    },
  });

  return (
    <Dialog open={Boolean(event)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{templateTitle} — রিপোর্ট</DialogTitle>
          <DialogDescription>
            {event ? new Date(event.start_time).toLocaleString("bn-BD") : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border border-border p-3">
              <div className="text-xl font-bold">{event?.participants ?? 0}</div>
              <div className="text-xs text-muted-foreground">অংশগ্রহণকারী</div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="text-xl font-bold">{detailsLoading ? "…" : details?.question_count ?? "-"}</div>
              <div className="text-xs text-muted-foreground">প্রশ্ন</div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="text-xl font-bold">{detailsLoading ? "…" : details?.duration_minutes ?? "-"}</div>
              <div className="text-xs text-muted-foreground">মিনিট</div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ক্যাটাগরি</span>
              <span className="font-medium">{details?.category || "-"}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-muted-foreground">মার্ক/প্রশ্ন</span>
              <span className="font-medium">{details?.marks_per_question ?? "-"}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-muted-foreground">নেগেটিভ মার্ক</span>
              <span className="font-medium">{details?.negative_marks ?? "-"}</span>
            </div>
            {event?.prize ? (
              <div className="mt-1 flex justify-between">
                <span className="text-muted-foreground">প্রাইজ</span>
                <span className="font-medium">{event.prize}</span>
              </div>
            ) : null}
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold">টপ পারফর্মার (সাইট-ওয়াইড)</div>
            {leadersLoading ? (
              <div className="text-sm text-muted-foreground">লোড হচ্ছে...</div>
            ) : (leaders || []).length === 0 ? (
              <div className="text-sm text-muted-foreground">এখনো কোনো ডেটা নেই।</div>
            ) : (
              <div className="space-y-1">
                {(leaders || []).slice(0, 5).map((l) => (
                  <div key={l.rank} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-1.5 text-sm">
                    <span>
                      <span className="mr-2 font-semibold">#{l.rank}</span>
                      {l.name}
                    </span>
                    <span className="text-muted-foreground">
                      {l.score} • {l.accuracy}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            <Play className="mr-1 inline h-3 w-3" />
            প্রতি-শিক্ষার্থী বিস্তারিত ফলাফল সিঙ্ক করতে একটি রিপোর্ট এন্ডপয়েন্ট লাগবে (পরবর্তী ধাপ)।
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
