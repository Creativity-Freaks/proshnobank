import { useEffect, useState, useCallback } from "react";
import {
  Plus, Trash2, Clock, Loader2, RefreshCw, Edit2,
  CalendarClock, Trophy, Users, Zap, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/contexts/AdminContext";
import { adminApi, type LiveExamEvent, type ExamTemplate } from "@/lib/admin/admin-api";

const STATUS_BADGE: Record<string, string> = {
  live: "bg-red-100 text-red-700 border-red-200",
  "starting-soon": "bg-orange-100 text-orange-700 border-orange-200",
  upcoming: "bg-sky-100 text-sky-700 border-sky-200",
  ended: "bg-gray-100 text-gray-700 border-gray-200",
};

const STATUS_LABEL: Record<string, string> = {
  live: "লাইভ",
  "starting-soon": "শীঘ্রই শুরু",
  upcoming: "আসন্ন",
  ended: "শেষ",
};

const STATUSES = ["upcoming", "starting-soon", "live", "ended"] as const;

type EventForm = {
  template_id: string;
  start_time: string;
  prize: string;
  status: string;
  participants: number;
};

const defaultForm: EventForm = {
  template_id: "",
  start_time: "",
  prize: "",
  status: "upcoming",
  participants: 0,
};

export default function AdminLiveEventsTab() {
  const { toast } = useToast();
  const { refreshTrigger } = useAdmin();
  const [events, setEvents] = useState<LiveExamEvent[]>([]);
  const [templates, setTemplates] = useState<ExamTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(defaultForm);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [eventsRes, templatesRes] = await Promise.all([
        adminApi.liveExams(),
        adminApi.templates(),
      ]);
      setEvents(eventsRes.data || []);
      setTemplates(templatesRes.data || []);
    } catch (e) {
      console.error("[v0] AdminLiveEventsTab fetchAll error:", e);
      toast({ title: "ত্রুটি", description: "ইভেন্ট লোড করা যায়নি", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll, refreshTrigger]);

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (event: LiveExamEvent) => {
    setEditingId(event.id);
    setForm({
      template_id: event.template_id,
      start_time: event.start_time ? event.start_time.slice(0, 16) : "",
      prize: event.prize || "",
      status: event.status,
      participants: event.participants || 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.template_id || !form.start_time) {
      toast({ title: "ত্রুটি", description: "টেমপ্লেট ও শুরুর সময় দেওয়া আবশ্যক", variant: "destructive" });
      return;
    }
    try {
      setSaving(true);
      const payload = {
        template_id: form.template_id,
        start_time: new Date(form.start_time).toISOString(),
        prize: form.prize || null,
        status: form.status,
        participants: form.participants,
      };
      if (editingId) {
        await adminApi.updateLiveExam(editingId, payload);
        toast({ title: "সাফল্য", description: "ইভেন্ট আপডেট হয়েছে" });
      } else {
        await adminApi.createLiveExam(payload);
        toast({ title: "সাফল্য", description: "নতুন ইভেন্ট তৈরি হয়েছে" });
      }
      setDialogOpen(false);
      fetchAll();
    } catch (e: unknown) {
      toast({ title: "ত্রুটি", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteLiveExam(id);
      toast({ title: "সাফল্য", description: "ইভেন্ট মুছে দেওয়া হয়েছে" });
      fetchAll();
    } catch (e: unknown) {
      toast({ title: "ত্রুটি", description: (e as Error).message, variant: "destructive" });
    }
  };

  const handleStatusChange = async (event: LiveExamEvent, newStatus: string) => {
    try {
      await adminApi.updateLiveExam(event.id, { status: newStatus } as Partial<LiveExamEvent>);
      toast({ title: "সাফল্য", description: "স্ট্যাটাস পরিবর্তন হয়েছে" });
      fetchAll();
    } catch (e: unknown) {
      toast({ title: "ত্রুটি", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">লাইভ এক্সাম ইভেন্ট</h2>
          <p className="text-sm text-muted-foreground mt-0.5">মোট {events.length}টি ইভেন্ট</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            রিফ্রেশ
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            নতুন ইভেন্ট
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <CalendarClock className="h-12 w-12 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">কোনো লাইভ ইভেন্ট নেই</p>
            <Button size="sm" onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              প্রথম ইভেন্ট তৈরি করুন
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {events.map(event => {
            const template = event.exam_templates;
            const startDate = event.start_time ? new Date(event.start_time) : null;
            return (
              <Card
                key={event.id}
                className={`border-2 ${event.status === "live" ? "border-red-300 shadow-red-100 shadow-md" : "border-border"}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Badge
                        variant="outline"
                        className={`text-xs mb-2 ${STATUS_BADGE[event.status] || STATUS_BADGE.upcoming}`}
                      >
                        {event.status === "live" && <Zap className="h-3 w-3 mr-1" />}
                        {STATUS_LABEL[event.status] || event.status}
                      </Badge>
                      <CardTitle className="text-base leading-tight">
                        {template?.title || "(টেমপ্লেট নেই)"}
                      </CardTitle>
                      {template?.category && (
                        <p className="text-xs text-muted-foreground mt-0.5">{template.category}</p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(event)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>ইভেন্ট মুছে দিবেন?</AlertDialogTitle>
                            <AlertDialogDescription>এই ইভেন্টটি স্থায়ীভাবে মুছে যাবে।</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>বাতিল</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(event.id)} className="bg-destructive hover:bg-destructive/90">
                              মুছুন
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="truncate">
                        {startDate ? startDate.toLocaleString("bn-BD") : "নির্ধারিত নয়"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>{event.participants || 0} জন</span>
                    </div>
                    {event.prize && (
                      <div className="flex items-center gap-1.5 text-amber-600 col-span-2">
                        <Trophy className="h-3.5 w-3.5" />
                        <span>{event.prize}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Status Change */}
                  <div className="flex gap-1.5 flex-wrap">
                    {STATUSES.map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(event, s)}
                        className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                          event.status === s
                            ? (STATUS_BADGE[s] || "bg-primary text-primary-foreground")
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {event.status === s && <CheckCircle2 className="h-3 w-3 inline mr-0.5" />}
                        {STATUS_LABEL[s]}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "ইভেন্ট সম্পাদনা" : "নতুন লাইভ ইভেন্ট"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>এক্সাম টেমপ্লেট</Label>
              <Select
                value={form.template_id}
                onValueChange={v => setForm(p => ({ ...p, template_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="টেমপ্লেট বেছে নিন..." />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title} ({t.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>শুরুর তারিখ ও সময়</Label>
              <Input
                type="datetime-local"
                value={form.start_time}
                onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>স্ট্যাটাস</Label>
                <Select
                  value={form.status}
                  onValueChange={v => setForm(p => ({ ...p, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => (
                      <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>অংশগ্রহণকারী (সংখ্যা)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.participants}
                  onChange={e => setForm(p => ({ ...p, participants: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>পুরস্কার (ঐচ্ছিক)</Label>
              <Input
                placeholder="যেমন: ৳৫০০০ নগদ পুরস্কার"
                value={form.prize}
                onChange={e => setForm(p => ({ ...p, prize: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>বাতিল</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? "আপডেট করুন" : "তৈরি করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
