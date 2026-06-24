import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { adminDashboardApi } from "@/lib/admin/admin-dashboard-api";
import { useAdmin } from "@/contexts/AdminContext";

export default function AdminCategoriesTab() {
  const { toast } = useToast();
  const { refreshTrigger } = useAdmin();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [refreshTrigger]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminDashboardApi.categories.list();
      setCategories(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load categories", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await adminDashboardApi.categories.update(editingId, formData);
        toast({ title: "Success", description: "Category updated successfully" });
      } else {
        await adminDashboardApi.categories.create(formData);
        toast({ title: "Success", description: "Category created successfully" });
      }
      setFormData({ name: "", description: "" });
      setEditingId(null);
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save category", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি এই ক্যাটেগরি মুছে দিতে চান?")) {
      try {
        await adminDashboardApi.categories.delete(id);
        toast({ title: "Success", description: "Category deleted successfully" });
        fetchCategories();
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">বেস ক্যাটেগরি ব্যবস্থাপনা</h2>
        <p className="text-sm text-muted-foreground mt-1">মূল পরীক্ষা ক্যাটেগরি (SSC, HSC, Medical, Engineering, University, Job)</p>
      </div>
      <div className="flex items-center justify-between">
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: "", description: "" }); }} className="gap-2">
          <Plus className="w-4 h-4" />
          নতুন বেস ক্যাটেগরি
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "বেস ক্যাটেগরি সম্পাদনা করুন" : "নতুন বেস ক্যাটেগরি যোগ করুন"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>নাম</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="যেমন: ভর্তি পরীক্ষা" />
            </div>
            <div>
              <Label>বর্ণনা</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="বর্ণনা লিখুন" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>সংরক্ষণ করুন</Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>বাতিল করুন</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-lg">{category.name}</CardTitle>
              <p className="text-xs text-muted-foreground">বেস ক্যাটেগরি</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => { setEditingId(category.id); setFormData({ name: category.name, description: category.description || "" }); setShowForm(true); }}>
                  <Edit2 className="w-3 h-3" />
                  সম্পাদনা
                </Button>
                <Button size="sm" variant="destructive" className="flex-1 gap-2" onClick={() => handleDelete(category.id)}>
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
