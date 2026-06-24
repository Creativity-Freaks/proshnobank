import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";

export default function AdminChaptersTab() {
  const { toast } = useToast();
  const { refreshTrigger } = useAdmin();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchChapters();
    }
  }, [selectedSubject, refreshTrigger]);

  const fetchSubjects = async () => {
    try {
      const { data } = await supabase
        .from("subjects")
        .select("*")
        .limit(100);
      setSubjects(data || []);
      if (data && data.length > 0) {
        setSelectedSubject(data[0].id);
      }
    } catch (error) {
      console.error("[v0] Failed to fetch subjects:", error);
    }
  };

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("chapters")
        .select("*")
        .eq("subject_id", selectedSubject)
        .order("order_index", { ascending: true });
      setChapters(data || []);
    } catch (error) {
      toast({ title: "Error", description: "অধ্যায় লোড করতে ব্যর্থ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name) {
        toast({ title: "Error", description: "নাম পূরণ করুন", variant: "destructive" });
        return;
      }

      if (editingId) {
        await supabase
          .from("chapters")
          .update(formData)
          .eq("id", editingId);
        toast({ title: "সাফল্য", description: "অধ্যায় আপডেট হয়েছে" });
      } else {
        await supabase.from("chapters").insert([
          { ...formData, subject_id: selectedSubject },
        ]);
        toast({ title: "সাফল্য", description: "অধ্যায় তৈরি হয়েছে" });
      }
      setFormData({ name: "", description: "" });
      setEditingId(null);
      setShowForm(false);
      fetchChapters();
    } catch (error) {
      toast({ title: "Error", description: "সংরক্ষণ করতে ব্যর্থ", variant: "destructive" });
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({ name: item.name, description: item.description });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি এই অধ্যায় মুছে দিতে চান?")) {
      try {
        await supabase.from("chapters").delete().eq("id", id);
        toast({ title: "সাফল্য", description: "অধ্যায় মুছে দেওয়া হয়েছে" });
        fetchChapters();
      } catch (error) {
        toast({ title: "Error", description: "মুছতে ব্যর্থ", variant: "destructive" });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">অধ্যায় ব্যবস্থাপনা</h2>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: "", description: "" }); }} className="gap-2">
          <Plus className="w-4 h-4" />
          নতুন অধ্যায়
        </Button>
      </div>

      {/* Subject Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">বিষয় নির্বাচন করুন</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {subjects.slice(0, 8).map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  selectedSubject === subject.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {subject.name}
              </button>
            ))}
            {subjects.length > 8 && (
              <div className="text-xs text-muted-foreground self-center">
                +{subjects.length - 8} আরো
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "অধ্যায় সম্পাদনা" : "নতুন অধ্যায় যোগ করুন"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>নাম</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="যেমন: অধ্যায় ১, অধ্যায় ২"
              />
            </div>
            <div>
              <Label>বর্ণনা</Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="বর্ণনা (ঐচ্ছিক)"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>সংরক্ষণ করুন</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                বাতিল করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chapters.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                এই বিষয়ে কোন অধ্যায় নেই
              </p>
            </CardContent>
          </Card>
        ) : (
          chapters.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-lg">{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {item.description || "বর্ণনা নেই"}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit2 className="w-3 h-3" />
                    সম্পাদনা
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                    মুছুন
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
