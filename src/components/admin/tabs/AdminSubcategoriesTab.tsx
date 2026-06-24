import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";

export default function AdminSubcategoriesTab() {
  const { toast } = useToast();
  const { refreshTrigger } = useAdmin();
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories();
    }
  }, [selectedCategory, refreshTrigger]);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from("exam_categories")
        .select("id, name, slug")
        .is("parent_id", null)
        .order("sort_order", { ascending: true });
      setCategories(data || []);
      if (data && data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].id);
      }
    } catch (error) {
      console.error("[v0] Failed to fetch categories:", error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("exam_categories")
        .select("id, name, slug, description, is_active, sort_order")
        .eq("parent_id", selectedCategory)
        .order("sort_order", { ascending: true });
      setSubcategories(data || []);
    } catch (error) {
      toast({ title: "Error", description: "সাব-ক্যাটেগরি লোড করতে ব্যর্থ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\u0980-\u09FFa-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      || `sub-${Date.now()}`;
  }

  const handleSave = async () => {
    try {
      if (!formData.name) {
        toast({ title: "Error", description: "নাম পূরণ করুন", variant: "destructive" });
        return;
      }

      if (editingId) {
        const { error } = await supabase
          .from("exam_categories")
          .update({ name: formData.name, description: formData.description || null })
          .eq("id", editingId);
        if (error) throw error;
        toast({ title: "সাফল্য", description: "পরীক্ষা ক্যাটেগরি আপডেট হয়েছে" });
      } else {
        const slug = generateSlug(formData.name) + `-${Date.now().toString(36)}`;
        const { error } = await supabase.from("exam_categories").insert([
          {
            parent_id: selectedCategory,
            name: formData.name,
            slug,
            description: formData.description || null,
            is_active: true,
            sort_order: 0,
          },
        ]);
        if (error) throw error;
        toast({ title: "সাফল্য", description: "পরীক্ষা ক্যাটেগরি তৈরি হয়েছে" });
      }
      setFormData({ name: "", description: "" });
      setEditingId(null);
      setShowForm(false);
      fetchSubcategories();
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "সংরক্ষণ করতে ব্যর্থ", variant: "destructive" });
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({ name: item.name, description: item.description || "" });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি এই পরীক্ষা ক্যাটেগরি মুছে দিতে চান?")) {
      try {
        const { error } = await supabase.from("exam_categories").delete().eq("id", id);
        if (error) throw error;
        toast({ title: "সাফল্য", description: "পরীক্ষা ক্যাটেগরি মুছে দেওয়া হয়েছে" });
        fetchSubcategories();
      } catch (error: any) {
        toast({ title: "Error", description: error?.message || "মুছতে ব্যর্থ", variant: "destructive" });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">পরীক্ষা ক্যাটেগরি ব্যবস্থাপনা</h2>
        <p className="text-sm text-muted-foreground mt-1">বেস ক্যাটেগরির অধীনে পরীক্ষার ধরন (যেমন: SSC বিজ্ঞান, SSC মানবিক)</p>
      </div>

      <div className="flex items-center justify-between">
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: "", description: "" });
          }}
          className="gap-2"
          disabled={!selectedCategory}
        >
          <Plus className="w-4 h-4" />
          নতুন পরীক্ষা ক্যাটেগরি
        </Button>
      </div>

      {/* Parent Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">বেস ক্যাটেগরি নির্বাচন করুন</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "পরীক্ষা ক্যাটেগরি সম্পাদনা" : "নতুন পরীক্ষা ক্যাটেগরি যোগ করুন"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>নাম</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="যেমন: SSC বিজ্ঞান ২০২৬"
              />
            </div>
            <div>
              <Label>বর্ণনা (ঐচ্ছিক)</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="বর্ণনা লিখুন"
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
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subcategories.length === 0 ? (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">
                  এই ক্যাটেগরিতে কোন পরীক্ষা ক্যাটেগরি নেই
                </p>
              </CardContent>
            </Card>
          ) : (
            subcategories.map((item) => (
              <Card key={item.id} className="border-l-4 border-l-primary/60">
                <CardHeader>
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <p className="text-xs text-muted-foreground font-mono">{item.slug}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {item.description || "বর্ণনা নেই"}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => handleEdit(item)}>
                      <Edit2 className="w-3 h-3" />
                      সম্পাদনা
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1 gap-2" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-3 h-3" />
                      মুছুন
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
