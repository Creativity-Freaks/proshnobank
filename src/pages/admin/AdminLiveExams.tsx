import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, type LiveExamEvent } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Loader2, Radio, Calendar, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminLiveExams() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ template_id: "", start_time: "", prize: "", status: "upcoming" });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-live-exams"],
    queryFn: () => adminApi.liveExams(),
  });

  const { data: templatesData } = useQuery({
    queryKey: ["admin-templates"],
    queryFn: () => adminApi.templates(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        return adminApi.updateLiveExam(editingId, {
          template_id: form.template_id,
          start_time: new Date(form.start_time).toISOString(),
          prize: form.prize || null,
          status: form.status,
        });
      }
      return adminApi.createLiveExam({
        template_id: form.template_id,
        start_time: new Date(form.start_time).toISOString(),
        prize: form.prize || undefined,
      });
    },
    onSuccess: () => {
      toast({ title: "সফল!" });
      queryClient.invalidateQueries({ queryKey: ["admin-live-exams"] });
      setDialogOpen(false);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteLiveExam(id),
    onSuccess: () => {
      toast({ title: "মুছে ফেলা হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["admin-live-exams"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const events: LiveExamEvent[] = data?.data || [];
  const templates = templatesData?.data || [];

  const openCreate = () => {
    setEditingId(null);
    setForm({ template_id: "", start_time: "", prize: "", status: "upcoming" });
    setDialogOpen(true);
  };

  const openEdit = (e: LiveExamEvent) => {
    setEditingId(e.id);
    const dt = new Date(e.start_time);
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setForm({ template_id: e.template_id, start_time: local, prize: e.prize || "", status: e.status });
    setDialogOpen(true);
  };

  const statusColor = (s: string) => {
    if (s === "live") return "bg-green-500/20 text-green-700";
    if (s === "completed") return "bg-muted text-muted-foreground";
    return "bg-primary/10 text-primary";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">লাইভ পরীক্ষা</h1>
          <p className="text-muted-foreground">লাইভ পরীক্ষা ইভেন্ট পরিচালনা</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> নতুন ইভেন্ট</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : events.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">কোনো লাইভ পরীক্ষা নেই</CardContent></Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>পরীক্ষা</TableHead>
                <TableHead>সময়</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead>অংশগ্রহণকারী</TableHead>
                <TableHead>পুরস্কার</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.exam_templates?.title || e.template_id.slice(0, 8)}</TableCell>
                  <TableCell>{new Date(e.start_time).toLocaleString("bn-BD")}</TableCell>
                  <TableCell><Badge className={statusColor(e.status)}>{e.status}</Badge></TableCell>
                  <TableCell>{e.participants}</TableCell>
                  <TableCell>{e.prize || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("মুছে ফেলতে চান?")) deleteMutation.mutate(e.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "ইভেন্ট সম্পাদনা" : "নতুন লাইভ পরীক্ষা"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>পরীক্ষা টেমপ্লেট *</Label>
              <Select value={form.template_id} onValueChange={(v) => setForm({ ...form, template_id: v })}>
                <SelectTrigger><SelectValue placeholder="টেমপ্লেট নির্বাচন" /></SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>শুরুর সময় *</Label><Input type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
            <div><Label>পুরস্কার</Label><Input value={form.prize} onChange={(e) => setForm({ ...form, prize: e.target.value })} placeholder="যেমন: ১০০০ টাকা" /></div>
            {editingId && (
              <div>
                <Label>স্ট্যাটাস</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">আসন্ন</SelectItem>
                    <SelectItem value="live">লাইভ</SelectItem>
                    <SelectItem value="completed">সম্পন্ন</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>বাতিল</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.template_id || !form.start_time}>
              {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? "আপডেট" : "তৈরি করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
