import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, type ExamTemplate } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Loader2, FileText, Clock, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TemplateFormData {
  title: string;
  category: string;
  description: string;
  question_count: number;
  duration_minutes: number;
  marks_per_question: number;
  negative_marks: number;
  difficulty: string;
  subjects: string[];
}

const emptyForm: TemplateFormData = {
  title: "", category: "", description: "",
  question_count: 20, duration_minutes: 30,
  marks_per_question: 1, negative_marks: 0,
  difficulty: "medium", subjects: [],
};

export default function AdminTemplates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateFormData>(emptyForm);
  const [subjectInput, setSubjectInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-templates"],
    queryFn: () => adminApi.templates(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, subjects: form.subjects };
      if (editingId) {
        return adminApi.updateTemplate(editingId, payload);
      }
      return adminApi.createTemplate(payload);
    },
    onSuccess: () => {
      toast({ title: "সফল!", description: editingId ? "টেমপ্লেট আপডেট হয়েছে" : "টেমপ্লেট তৈরি হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["admin-templates"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteTemplate(id),
    onSuccess: () => {
      toast({ title: "সফল!", description: "টেমপ্লেট মুছে ফেলা হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["admin-templates"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setSubjectInput(""); };

  const openEdit = (t: ExamTemplate) => {
    setEditingId(t.id);
    setForm({
      title: t.title, category: t.category, description: t.description || "",
      question_count: t.question_count, duration_minutes: t.duration_minutes,
      marks_per_question: t.marks_per_question, negative_marks: t.negative_marks,
      difficulty: t.difficulty || "medium",
      subjects: Array.isArray(t.subjects) ? t.subjects : [],
    });
    setDialogOpen(true);
  };

  const addSubject = () => {
    const s = subjectInput.trim();
    if (s && !form.subjects.includes(s)) {
      setForm({ ...form, subjects: [...form.subjects, s] });
    }
    setSubjectInput("");
  };

  const templates: ExamTemplate[] = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">পরীক্ষা টেমপ্লেট</h1>
          <p className="text-muted-foreground">পরীক্ষার টেমপ্লেট তৈরি, সম্পাদনা ও মুছুন</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> নতুন টেমপ্লেট
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : templates.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">কোনো টেমপ্লেট নেই</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <Card key={t.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{t.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("মুছে ফেলতে চান?")) deleteMutation.mutate(t.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="secondary">{t.category}</Badge>
                {t.difficulty && <Badge variant="outline" className="ml-1">{t.difficulty}</Badge>}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{t.question_count} প্রশ্ন</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.duration_minutes} মিনিট</span>
                  <span className="flex items-center gap-1"><Award className="h-3 w-3" />{t.marks_per_question} মার্ক</span>
                </div>
                {t.description && <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "টেমপ্লেট সম্পাদনা" : "নতুন টেমপ্লেট"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>শিরোনাম *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>ক্যাটেগরি *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="ক্যাটেগরি নির্বাচন" /></SelectTrigger>
                <SelectContent>
                  {["ssc", "hsc", "medical", "engineering", "university", "job"].map((c) => (
                    <SelectItem key={c} value={c}>{c.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>বিবরণ</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>প্রশ্ন সংখ্যা</Label><Input type="number" value={form.question_count} onChange={(e) => setForm({ ...form, question_count: Number(e.target.value) })} /></div>
              <div><Label>সময় (মিনিট)</Label><Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} /></div>
              <div><Label>প্রতি প্রশ্নে মার্ক</Label><Input type="number" value={form.marks_per_question} onChange={(e) => setForm({ ...form, marks_per_question: Number(e.target.value) })} /></div>
              <div><Label>নেগেটিভ মার্ক</Label><Input type="number" value={form.negative_marks} onChange={(e) => setForm({ ...form, negative_marks: Number(e.target.value) })} /></div>
            </div>
            <div><Label>কঠিনতা</Label>
              <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">সহজ</SelectItem>
                  <SelectItem value="medium">মাঝারি</SelectItem>
                  <SelectItem value="hard">কঠিন</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>বিষয়সমূহ</Label>
              <div className="flex gap-2">
                <Input value={subjectInput} onChange={(e) => setSubjectInput(e.target.value)} placeholder="বিষয় যোগ করুন"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubject(); } }} />
                <Button type="button" variant="outline" onClick={addSubject}>যোগ</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {form.subjects.map((s) => (
                  <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => setForm({ ...form, subjects: form.subjects.filter((x) => x !== s) })}>{s} ✕</Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>বাতিল</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.title || !form.category}>
              {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? "আপডেট" : "তৈরি করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
