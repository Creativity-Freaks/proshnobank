import { useEffect, useState, useMemo } from "react";
import { Plus, Trash2, Edit2, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { adminDashboardApi } from "@/lib/admin/admin-dashboard-api";
import { useAdmin } from "@/contexts/AdminContext";

function generateSlug(name: string): string {
  // Handles both Bengali and Latin characters
  const latinized = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return (latinized || `cat-${Date.now().toString(36)}`).replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminCategoriesTab() {
  const { toast } = useToast();
  const { refreshTrigger } = useAdmin();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", slug: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCategories();
  }, [refreshTrigger]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminDashboardApi.categories.list();
      setCategories(data);
    } catch (error) {
      toast({ title: "Error", description: "ক্যাটেগরি লোড করতে ব্যর্থ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      // auto-generate slug only when creating (not editing)
      slug: editingId ? prev.slug : generateSlug(name) + `-${Date.now().toString(36)}`,
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "নাম পূরণ করুন", variant: "destructive" });
      return;
    }

    const slug = formData.slug.trim() || generateSlug(formData.name) + `-${Date.now().toString(36)}`;

    try {
      if (editingId) {
        await adminDashboardApi.categories.update(editingId, {
          name: formData.name.trim(),
          slug,
          description: formData.description.trim(),
        });
        toast({ title: "সাফল্য", description: "ক্যাটেগরি আপডেট হয়েছে" });
      } else {
        await adminDashboardApi.categories.create({
          name: formData.name.trim(),
          slug,
          description: formData.description.trim(),
          is_active: true,
          sort_order: 0,
        });
        toast({ title: "সাফল্য", description: "ক্যাটেগরি তৈরি হয়েছে" });
      }
      setFormData({ name: "", slug: "", description: "" });
      setEditingId(null);
      setShowForm(false);
      fetchCategories();
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "ক্যাটেগরি সংরক্ষণ করতে ব্যর্থ", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি এই ক্যাটেগরি মুছে দিতে চান?")) {
      try {
        await adminDashboardApi.categories.delete(id);
        toast({ title: "সাফল্য", description: "ক্যাটেগরি মুছে দেওয়া হয়েছে" });
        fetchCategories();
      } catch (error: any) {
        toast({ title: "Error", description: error?.message || "ক্যাটেগরি মুছতে ব্যর্থ", variant: "destructive" });
      }
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(c => c.name.toLowerCase().includes(q) || (c.slug || "").toLowerCase().includes(q));
  }, [categories, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">বেস ক্যাটেগরি ব্যবস্থাপনা</h2>
        <p className="text-sm text-muted-foreground mt-1">মূল পরীক্ষা ক্যাটেগরি (SSC, HSC, মেডিকেল, ইঞ্জিনিয়ারিং, বিশ্ববিদ্যালয়, চাকরি)</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: "", slug: "", description: "" });
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          নতুন বেস ক্যাটেগরি
        </Button>
        <div className="flex items-center gap-3 flex-1 sm:max-w-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ক্যাটেগরি খুঁজুন..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <span className="text-sm text-muted-foreground whitespace-nowrap">{filteredCategories.length}/{categories.length}টি</span>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "বেস ক্যাটেগরি সম্পাদনা" : "নতুন বেস ক্যাটেগরি যোগ করুন"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>নাম *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="যেমন: ভর্তি পরীক্ষা"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug (URL key)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="admission-exam"
                  className="font-mono text-xs"
                />
              </div>
            </div>
            <div className="space-y-1.5">
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
                  setFormData({ name: "", slug: "", description: "" });
                }}
              >
                বাতিল করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{category.name}</CardTitle>
              <p className="text-xs font-mono text-muted-foreground">{category.slug}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {category.description || "বর্ণনা নেই"}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => {
                    setEditingId(category.id);
                    setFormData({
                      name: category.name,
                      slug: category.slug || "",
                      description: category.description || "",
                    });
                    setShowForm(true);
                  }}
                >
                  <Edit2 className="w-3 h-3" />
                  সম্পাদনা
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={() => handleDelete(category.id)}
                >
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
