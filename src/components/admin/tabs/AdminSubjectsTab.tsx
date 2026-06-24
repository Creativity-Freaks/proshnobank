import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";

export default function AdminSubjectsTab() {
  const { toast } = useToast();
  const { refreshTrigger } = useAdmin();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", category_id: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchSubjects();
  }, [refreshTrigger]);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase.from("exam_categories").select("*");
      setCategories(data || []);
    } catch (error) {
      console.error("[v0] Failed to fetch categories:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from("subjects").select("*, exam_categories(name)");
      setSubjects(data || []);
    } catch (error) {
      toast({ title: "Error", description: "বিষয় লোড করতে ব্যর্থ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.category_id) {
        toast({ title: "Error", description: "সব ফিল্ড পূরণ করুন", variant: "destructive" });
        return;
      }

      if (editingId) {
        await supabase.from("subjects").update(formData).eq("id", editingId);
        toast({ title: "সাফল্য", description: "বিষয় সফলভাবে আপডেট হয়েছে" });
      } else {
        await supabase.from("subjects").insert([formData]);
        toast({ title: "সাফল্য", description: "বিষয় সফলভাবে তৈরি হয়েছে" });
      }
      setFormData({ name: "", category_id: "", description: "" });
      setEditingId(null);
      setShowForm(false);
      fetchSubjects();
    } catch (error) {
      toast({ title: "Error", description: "বিষয় সংরক্ষণ করতে ব্যর্থ", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি এই বিষয় মুছে দিতে চান?")) {
      try {
        await supabase.from("subjects").delete().eq("id", id);
        toast({ title: "সাফল্য", description: "বিষয় সফলভাবে মুছে দেওয়া হয়েছে" });
        fetchSubjects();
      } catch (error) {
        toast({ title: "Error", description: "বিষয় মুছতে ব্যর্থ", variant: "destructive" });
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">বিষয় ব্যবস্থাপনা</h2>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: "", category_id: "", description: "" }); }} className="gap-2">
          <Plus className="w-4 h-4" />
          নতুন বিষয়
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "বিষয় সম্পাদনা" : "নতুন বিষয় যোগ করুন"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>নাম</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="যেমন: গণিত" />
            </div>
            <div>
              <Label>ক্যাটেগরি</Label>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => setFormData({ ...formData, category_id: cat.id })}
                    className={`px-3 py-2 rounded text-sm ${formData.category_id === cat.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              {!formData.category_id && <p className="text-xs text-red-500 mt-1">ক্যাটেগরি নির্বাচন করুন</p>}
            </div>
            <div>
              <Label>বর্ণনা</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="বিষয়ের বর্ণনা" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>সংরক্ষণ করুন</Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>বাতিল করুন</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <Card key={subject.id}>
            <CardHeader>
              <CardTitle className="text-lg">{subject.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">ক্যাটেগরি: {subject.exam_categories?.name}</p>
              <p className="text-sm text-muted-foreground mb-4">{subject.description}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => { setEditingId(subject.id); setFormData({ name: subject.name, category_id: subject.category_id, description: subject.description || "" }); setShowForm(true); }}>
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="destructive" className="flex-1 gap-2" onClick={() => handleDelete(subject.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
