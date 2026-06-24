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
        .select("*")
        .order("order_index", { ascending: true });
      setCategories(data || []);
      if (data && data.length > 0) {
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
        .from("category_subcategories")
        .select("*")
        .eq("category_id", selectedCategory)
        .order("order_index", { ascending: true });
      setSubcategories(data || []);
    } catch (error) {
      toast({ title: "Error", description: "সাব-ক্যাটেগরি লোড করতে ব্যর্থ", variant: "destructive" });
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
          .from("category_subcategories")
          .update(formData)
          .eq("id", editingId);
        toast({ title: "সাফল্য", description: "সাব-ক্যাটেগরি আপডেট হয়েছে" });
      } else {
        await supabase.from("category_subcategories").insert([
          { ...formData, category_id: selectedCategory },
        ]);
        toast({ title: "সাফল্য", description: "সাব-ক্যাটেগরি তৈরি হয়েছে" });
      }
      setFormData({ name: "", description: "" });
      setEditingId(null);
      setShowForm(false);
      fetchSubcategories();
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
    if (confirm("আপনি কি এই সাব-ক্যাটেগরি মুছে দিতে চান?")) {
      try {
        await supabase.from("category_subcategories").delete().eq("id", id);
        toast({ title: "সাফল্য", description: "সাব-ক্যাটেগরি মুছে দেওয়া হয়েছে" });
        fetchSubcategories();
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
        <h2 className="text-2xl font-bold">সাব-ক্যাটেগরি ব্যবস্থাপনা</h2>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: "", description: "" }); }} className="gap-2">
          <Plus className="w-4 h-4" />
          নতুন সাব-ক্যাটেগরি
        </Button>
      </div>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">ক্যাটেগরি নির্বাচন করুন</CardTitle>
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
              {editingId ? "সাব-ক্যাটেগরি সম্পাদনা" : "নতুন সাব-ক্যাটেগরি যোগ করুন"}
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
                placeholder="যেমন: Regular Board, English Medium"
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
        {subcategories.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                এই ক্যাটেগরিতে কোন সাব-ক্যাটেগরি নেই
              </p>
            </CardContent>
          </Card>
        ) : (
          subcategories.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-lg">{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {item.description}
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
