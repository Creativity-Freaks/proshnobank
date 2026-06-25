import { useEffect, useState, useMemo } from "react";
import { Plus, Trash2, Edit2, Loader2, Search } from "lucide-react";
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
  const [formData, setFormData] = useState({ name: "", key: "", category_id: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchCategories();
    fetchSubjects();
  }, [refreshTrigger]);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from("exam_categories")
        .select("id, name, parent_id")
        .is("parent_id", null)
        .order("sort_order", { ascending: true });
      setCategories(data || []);
    } catch (error) {
      console.error("[v0] Failed to fetch categories:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("subjects")
        .select("id, name, key, category_id, description, is_active, exam_categories(name)")
        .order("name", { ascending: true });
      setSubjects(data || []);
    } catch (error) {
      toast({ title: "Error", description: "বিষয় লোড করতে ব্যর্থ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  function autoKey(name: string, catId: string): string {
    const cat = categories.find((c) => c.id === catId);
    const catSlug = cat?.name
      ? cat.name.toLowerCase().replace(/\s+/g, "_").replace(/[^\u0980-\u09FFa-z0-9_]/g, "").slice(0, 12)
      : "sub";
    const nameSlug = name
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^\u0980-\u09FFa-z0-9_]/g, "")
      .slice(0, 16);
    return `${catSlug}_${nameSlug}_${Date.now().toString(36)}`;
  }

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      key: editingId ? prev.key : autoKey(name, prev.category_id),
    }));
  };

  const handleCategoryChange = (catId: string) => {
    setFormData((prev) => ({
      ...prev,
      category_id: catId,
      key: editingId ? prev.key : autoKey(prev.name, catId),
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category_id) {
      toast({ title: "Error", description: "নাম এবং ক্যাটেগরি বাধ্যতামূলক", variant: "destructive" });
      return;
    }

    const key = formData.key.trim() || autoKey(formData.name, formData.category_id);

    try {
      if (editingId) {
        const { error } = await supabase
          .from("subjects")
          .update({
            name: formData.name,
            key,
            category_id: formData.category_id,
            description: formData.description || null,
          })
          .eq("id", editingId);
        if (error) throw error;
        toast({ title: "সাফল্য", description: "বিষয় সফলভাবে আপডেট হয়েছে" });
      } else {
        const { error } = await supabase.from("subjects").insert([
          {
            name: formData.name,
            key,
            category_id: formData.category_id,
            description: formData.description || null,
            is_active: true,
          },
        ]);
        if (error) throw error;
        toast({ title: "সাফল্য", description: "বিষয় সফলভাবে তৈরি হয়েছে" });
      }
      setFormData({ name: "", key: "", category_id: "", description: "" });
      setEditingId(null);
      setShowForm(false);
      fetchSubjects();
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "বিষয় সংরক্ষণ করতে ব্যর্থ", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি এই বিষয় মুছে দিতে চান?")) {
      try {
        const { error } = await supabase.from("subjects").delete().eq("id", id);
        if (error) throw error;
        toast({ title: "সাফল্য", description: "বিষয় সফলভাবে মুছে দেওয়া হয়েছে" });
        fetchSubjects();
      } catch (error: any) {
        toast({ title: "Error", description: error?.message || "বিষয় মুছতে ব্যর্থ", variant: "destructive" });
      }
    }
  };

  // Show root-level and all categories for selection
  const allCategories = categories;

  // Filtered subjects based on filterCategory + searchQuery
  const filteredSubjects = useMemo(() => {
    return subjects.filter(sub => {
      const matchesCat = !filterCategory || sub.category_id === filterCategory;
      const matchesSearch = !searchQuery || sub.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [subjects, filterCategory, searchQuery]);

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
        <div>
          <h2 className="text-2xl font-bold">বিষয় ব্যবস্থাপনা</h2>
          <p className="text-sm text-muted-foreground mt-1">মোট {subjects.length}টি বিষয়</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: "", key: "", category_id: "", description: "" });
          }}
          className="gap-2"
        >
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>নাম *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="যেমন: বাংলা ১ম পত্র"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Key (স্বয়ংক্রিয়)</Label>
                <Input
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="ssc_bangla_1"
                  className="font-mono text-xs"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>ক্যাটেগরি *</Label>
              <div className="flex gap-2 flex-wrap">
                {allCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`px-3 py-1.5 rounded text-sm transition-colors ${
                      formData.category_id === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    } ${cat.parent_id ? "border-l-2 border-primary/30 ml-2" : "font-medium"}`}
                  >
                    {cat.parent_id ? "↳ " : ""}{cat.name}
                  </button>
                ))}
              </div>
              {!formData.category_id && (
                <p className="text-xs text-destructive">ক্যাটেগরি নির্বাচন করুন</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>বর্ণনা (ঐচ্ছিক)</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="বিষয়ের বর্ণনা"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>সংরক্ষণ করুন</Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                বাতিল করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Filter Card ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">ফিল্টার এবং অনুসন্ধান</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="বিষয়ের নাম দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">ক্যাটেগরি অনুযায়ী ফিল্টার</Label>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={filterCategory === "" ? "default" : "outline"}
                onClick={() => setFilterCategory("")}>সব</Button>
              {categories.map(cat => (
                <Button key={cat.id} size="sm" variant={filterCategory === cat.id ? "default" : "outline"}
                  onClick={() => setFilterCategory(cat.id === filterCategory ? "" : cat.id)}>{cat.name}</Button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">দেখাচ্ছে: {filteredSubjects.length}/{subjects.length}টি বিষয়</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.map((subject) => (
          <Card key={subject.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{subject.name}</CardTitle>
              <p className="text-xs font-mono text-muted-foreground">{subject.key}</p>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-primary mb-1">
                ক্যাটেগরি: {(subject.exam_categories as any)?.name || "অজানা"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {subject.description || "বর্ণনা নেই"}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => {
                    setEditingId(subject.id);
                    setFormData({
                      name: subject.name,
                      key: subject.key,
                      category_id: subject.category_id || "",
                      description: subject.description || "",
                    });
                    setShowForm(true);
                  }}
                >
                  <Edit2 className="w-3 h-3" />
                  সম্পাদনা
                </Button>
                <Button size="sm" variant="destructive" className="flex-1 gap-2" onClick={() => handleDelete(subject.id)}>
                  <Trash2 className="w-3 h-3" />
                  মুছুন
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
