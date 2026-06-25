import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Pencil, Trash2, Users, Search, RefreshCw, PackageOpen, CalendarDays, Banknote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Batch {
  id: string;
  title: string;
  description: string;
  price: number;
  duration_days: number;
  seats: number;
  status: string;
  start_date: string;
  created_at: string;
  category_id: string;
  subcategory_id: string | null;
  enrolled?: number;
}

interface Category { id: string; name: string }

const STATUS_OPTIONS = ["published", "draft", "archived"];
const STATUS_LABELS: Record<string, string> = {
  published: "প্রকাশিত",
  draft: "খসড়া",
  archived: "আর্কাইভড",
};
const STATUS_COLORS: Record<string, string> = {
  published: "default",
  draft: "secondary",
  archived: "destructive",
};

const emptyForm = {
  title: "",
  description: "",
  price: "",
  duration_days: "",
  seats: "",
  status: "draft",
  start_date: "",
  category_id: "",
  subcategory_id: "",
};

export default function AdminBatchesTab() {
  const { toast } = useToast();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  // ── Load categories ──────────────────────────────────────────────────────────
  useEffect(() => {
    supabase
      .from("exam_categories")
      .select("id, name")
      .is("parent_id", null)
      .order("sort_order")
      .then(({ data }) => setCategories(data || []));
  }, []);

  // ── Load subcategories when category changes ─────────────────────────────────
  useEffect(() => {
    if (!form.category_id) { setSubcategories([]); return; }
    supabase
      .from("exam_categories")
      .select("id, name")
      .eq("parent_id", form.category_id)
      .order("sort_order")
      .then(({ data }) => setSubcategories(data || []));
  }, [form.category_id]);

  // ── Fetch batches ────────────────────────────────────────────────────────────
  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const { data: batchData, error } = await supabase
        .from("exam_batches")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // enrollment counts
      const { data: enrollData } = await supabase
        .from("exam_batch_enrollments")
        .select("batch_id");

      const enrollMap: Record<string, number> = {};
      (enrollData || []).forEach((e: any) => {
        enrollMap[e.batch_id] = (enrollMap[e.batch_id] || 0) + 1;
      });

      setBatches(
        (batchData || []).map((b: any) => ({ ...b, enrolled: enrollMap[b.id] || 0 }))
      );
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  // ── Form helpers ─────────────────────────────────────────────────────────────
  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (b: Batch) => {
    setEditingId(b.id);
    setForm({
      title: b.title || "",
      description: b.description || "",
      price: String(b.price || ""),
      duration_days: String(b.duration_days || ""),
      seats: String(b.seats || ""),
      status: b.status || "draft",
      start_date: b.start_date || "",
      category_id: b.category_id || "",
      subcategory_id: b.subcategory_id || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Error", description: "ব্যাচের নাম দিন", variant: "destructive" });
      return;
    }
    if (!form.category_id) {
      toast({ title: "Error", description: "ক্যাটেগরি নির্বাচন করুন", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        price: parseFloat(form.price) || 0,
        duration_days: parseInt(form.duration_days) || 30,
        seats: parseInt(form.seats) || 0,
        status: form.status,
        start_date: form.start_date || null,
        category_id: form.category_id,
        subcategory_id: form.subcategory_id || null,
      };
      if (editingId) {
        const { error } = await supabase.from("exam_batches").update(payload).eq("id", editingId);
        if (error) throw error;
        toast({ title: "সাফল্য", description: "ব্যাচ আপডেট হয়েছে" });
      } else {
        const { error } = await supabase.from("exam_batches").insert([payload]);
        if (error) throw error;
        toast({ title: "সাফল্য", description: "নতুন ব্যাচ তৈরি হয়েছে" });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchBatches();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই ব্যাচ মুছে ফেলবেন?")) return;
    setDeleting(id);
    try {
      const { error } = await supabase.from("exam_batches").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "সাফল্য", description: "ব্যাচ মুছে ফেলা হয়েছে" });
      fetchBatches();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  // ── Filtered list ────────────────────────────────────────────────────────────
  const filtered = batches.filter(b => {
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const matchCat = filterCategory === "all" || b.category_id === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  // ── KPI summary ──────────────────────────────────────────────────────────────
  const totalBatches = batches.length;
  const publishedBatches = batches.filter(b => b.status === "published").length;
  const totalEnrolled = batches.reduce((s, b) => s + (b.enrolled || 0), 0);
  const totalRevenue = batches.reduce((s, b) => s + (b.price || 0) * (b.enrolled || 0), 0);

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "মোট ব্যাচ", value: totalBatches, icon: PackageOpen },
          { label: "প্রকাশিত", value: publishedBatches, icon: CalendarDays },
          { label: "মোট এনরোলড", value: totalEnrolled, icon: Users },
          { label: "মোট আয়", value: `৳${totalRevenue.toLocaleString("bn-BD")}`, icon: Banknote },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold text-foreground">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Header / filters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-lg">পরীক্ষা ব্যাচ ব্যবস্থাপনা</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={fetchBatches}>
              <RefreshCw className="h-4 w-4 mr-1" /> রিফ্রেশ
            </Button>
            <Button size="sm" onClick={openNew}>
              <Plus className="h-4 w-4 mr-1" /> নতুন ব্যাচ
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ব্যাচের নাম খুঁজুন..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">সব স্ট্যাটাস</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">সব ক্যাটেগরি</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Add/Edit form */}
          {showForm && (
            <div className="border border-border rounded-xl p-5 bg-muted/30 space-y-4">
              <h3 className="font-semibold text-sm">{editingId ? "ব্যাচ সম্পাদনা" : "নতুন ব্যাচ তৈরি"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>ব্যাচের নাম <span className="text-destructive">*</span></Label>
                  <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="যেমন: SSC 2026 বিজ্ঞান ব্যাচ" />
                </div>
                <div className="md:col-span-2">
                  <Label>বিবরণ</Label>
                  <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="ব্যাচের বিস্তারিত বিবরণ" />
                </div>
                <div>
                  <Label>বেস ক্যাটেগরি <span className="text-destructive">*</span></Label>
                  <select
                    value={form.category_id}
                    onChange={e => setForm({ ...form, category_id: e.target.value, subcategory_id: "" })}
                    className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">-- নির্বাচন করুন --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>সাবক্যাটেগরি</Label>
                  <select
                    value={form.subcategory_id}
                    onChange={e => setForm({ ...form, subcategory_id: e.target.value })}
                    disabled={!form.category_id}
                    className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm disabled:opacity-50"
                  >
                    <option value="">-- কোনোটি নয় --</option>
                    {subcategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>মূল্য (৳)</Label>
                  <Input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="০" />
                </div>
                <div>
                  <Label>মেয়াদ (দিন)</Label>
                  <Input type="number" min="1" value={form.duration_days} onChange={e => setForm({ ...form, duration_days: e.target.value })} placeholder="৩০" />
                </div>
                <div>
                  <Label>আসন সংখ্যা</Label>
                  <Input type="number" min="0" value={form.seats} onChange={e => setForm({ ...form, seats: e.target.value })} placeholder="১০০" />
                </div>
                <div>
                  <Label>শুরুর তারিখ</Label>
                  <Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div>
                  <Label>স্ট্যাটাস</Label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  {editingId ? "আপডেট করুন" : "সংরক্ষণ করুন"}
                </Button>
                <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}>
                  বাতিল
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">কোনো ব্যাচ পাওয়া যায়নি।</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">ব্যাচের নাম</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">মূল্য</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">আসন</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">এনরোল্ড</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">শুরু</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">স্ট্যাটাস</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b, i) => (
                    <tr key={b.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/30"}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground max-w-xs truncate">{b.title}</div>
                        {b.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-xs">{b.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">৳{Number(b.price).toLocaleString("bn-BD")}</td>
                      <td className="px-4 py-3">{b.seats || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={b.enrolled ? "text-primary font-semibold" : "text-muted-foreground"}>
                          {b.enrolled || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{b.start_date || "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_COLORS[b.status] as any || "secondary"}>
                          {STATUS_LABELS[b.status] || b.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(b.id)}
                            disabled={deleting === b.id}
                          >
                            {deleting === b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
