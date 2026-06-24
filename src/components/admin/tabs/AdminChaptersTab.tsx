import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Edit2, Loader2, BookOpen, ChevronDown, ChevronUp, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";

export default function AdminChaptersTab() {
  const { toast } = useToast();
  const { refreshTrigger } = useAdmin();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchSubjects = useCallback(async () => {
    setLoadingSubjects(true);
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, key, category_id")
        .eq("is_active", true)
        .order("name");
      if (error) throw new Error(error.message);
      setSubjects(data || []);
      if (data && data.length > 0 && !selectedSubject) {
        setSelectedSubject(data[0].id);
      }
    } catch (error: any) {
      toast({ title: "ত্রুটি", description: "বিষয় লোড করতে ব্যর্থ: " + error.message, variant: "destructive" });
    } finally {
      setLoadingSubjects(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchChapters = useCallback(async () => {
    if (!selectedSubject) return;
    setLoadingChapters(true);
    try {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("subject_id", selectedSubject)
        .order("order_index", { ascending: true });
      if (error) throw new Error(error.message);
      setChapters(data || []);
    } catch (error: any) {
      toast({ title: "ত্রুটি", description: "অধ্যায় লোড করতে ব্যর্থ", variant: "destructive" });
    } finally {
      setLoadingChapters(false);
    }
  }, [selectedSubject]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchSubjects(); }, []);

  useEffect(() => { fetchChapters(); }, [selectedSubject, refreshTrigger]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: "ত্রুটি", description: "নাম পূরণ করুন", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from("chapters")
          .update({ name: formData.name, description: formData.description })
          .eq("id", editingId);
        if (error) throw new Error(error.message);
        toast({ title: "সাফল্য", description: "অধ্যায় আপডেট হয়েছে" });
      } else {
        const maxOrder = chapters.length > 0
          ? Math.max(...chapters.map((c) => c.order_index || 0)) + 1
          : 1;
        const { error } = await supabase.from("chapters").insert({
          name: formData.name,
          description: formData.description || null,
          subject_id: selectedSubject,
          order_index: maxOrder,
        });
        if (error) throw new Error(error.message);
        toast({ title: "সাফল্য", description: "অধ্যায় তৈরি হয়েছে" });
      }
      setFormData({ name: "", description: "" });
      setEditingId(null);
      setShowForm(false);
      fetchChapters();
    } catch (error: any) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({ name: item.name, description: item.description || "" });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই অধ্যায় মুছে দেবেন?")) return;
    try {
      const { error } = await supabase.from("chapters").delete().eq("id", id);
      if (error) throw new Error(error.message);
      toast({ title: "সাফল্য", description: "অধ্যায় মুছে দেওয়া হয়েছে" });
      fetchChapters();
    } catch (error: any) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    }
  };

  const displayedSubjects = showAllSubjects ? subjects : subjects.slice(0, 12);
  const selectedSubjectName = subjects.find((s) => s.id === selectedSubject)?.name;

  if (loadingSubjects) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold font-bengali">অধ্যায় ব্যবস্থাপনা</h2>
          <p className="text-sm text-muted-foreground font-bengali mt-0.5">
            বিষয় অনুযায়ী অধ্যায় তৈরি, সম্পাদনা ও মুছুন
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: "", description: "" });
          }}
          disabled={!selectedSubject}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          নতুন অধ্যায়
        </Button>
      </div>

      {/* Subject Selector */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bengali">বিষয় নির্বাচন করুন</CardTitle>
            <Badge variant="outline" className="text-xs">{subjects.length}টি বিষয়</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <p className="text-sm text-muted-foreground font-bengali text-center py-2">
              কোনো বিষয় নেই — আগে বিষয় ট্যাব থেকে বিষয় যোগ করুন
            </p>
          ) : (
            <>
              <div className="flex gap-2 flex-wrap">
                {displayedSubjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium font-bengali transition-colors ${
                      selectedSubject === subject.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/70"
                    }`}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
              {subjects.length > 12 && (
                <button
                  onClick={() => setShowAllSubjects((v) => !v)}
                  className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  {showAllSubjects ? (
                    <><ChevronUp className="h-3.5 w-3.5" />কম দেখুন</>
                  ) : (
                    <><ChevronDown className="h-3.5 w-3.5" />আরো {subjects.length - 12}টি দেখুন</>
                  )}
                </button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {showForm && selectedSubject && (
        <Card>
          <CardHeader>
            <CardTitle className="font-bengali">
              {editingId ? "অধ্যায় সম্পাদনা" : `নতুন অধ্যায় — ${selectedSubjectName}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-bengali">অধ্যায়ের নাম *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="যেমন: সরল সমীকরণ, নিউটনের গতিসূত্র"
                className="font-bengali"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-bengali">বর্ণনা (ঐচ্ছিক)</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="সংক্ষিপ্ত বর্ণনা"
                className="font-bengali"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="font-bengali">
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                সংরক্ষণ করুন
              </Button>
              <Button
                variant="outline"
                className="font-bengali"
                onClick={() => { setShowForm(false); setEditingId(null); }}
              >
                বাতিল
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chapters List */}
      {selectedSubject && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold font-bengali text-sm text-muted-foreground">
              {selectedSubjectName} — অধ্যায়সমূহ
            </h3>
            <Badge variant="outline" className="text-xs">{chapters.length}টি</Badge>
          </div>

          {loadingChapters ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : chapters.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="font-bengali text-sm">এই বিষয়ে কোনো অধ্যায় নেই</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 font-bengali gap-2"
                  onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: "", description: "" }); }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  প্রথম অধ্যায় যোগ করুন
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {chapters.map((item, idx) => (
                <Card key={item.id} className="group">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <CardTitle className="text-sm font-bengali leading-snug">{item.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    {item.description && (
                      <p className="text-xs text-muted-foreground font-bengali mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1.5 text-xs font-bengali"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit2 className="w-3 h-3" />
                        সম্পাদনা
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 gap-1.5 text-xs font-bengali"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                        মুছুন
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
