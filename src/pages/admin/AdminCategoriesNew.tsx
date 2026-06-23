import { useState } from "react";
import { Plus, Edit2, Trash2, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BackButton } from "@/components/BackButton";
import { examCatalog } from "@/lib/exam-catalog";
import { Badge } from "@/components/ui/badge";

interface CategoryFormData {
  id: string;
  name: string;
  description?: string;
}

export default function AdminCategoriesNew() {
  const [categories, setCategories] = useState(examCatalog.categories);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFormData | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({ id: "", name: "" });

  const handleAddCategory = () => {
    if (formData.name.trim()) {
      const newCategory = {
        id: formData.id || formData.name.toLowerCase(),
        name: formData.name,
        subjects: [],
      };
      setCategories([...categories, newCategory as any]);
      setFormData({ id: "", name: "" });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditCategory = () => {
    if (formData.name.trim() && selectedCategory) {
      setCategories(
        categories.map((cat) =>
          cat.id === selectedCategory.id ? { ...cat, name: formData.name } : cat
        )
      );
      setFormData({ id: "", name: "" });
      setSelectedCategory(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("কি এই ক্যাটেগরি মুছে দিতে চান?")) {
      setCategories(categories.filter((cat) => cat.id !== categoryId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <BackButton className="mb-6" />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">ক্যাটেগরি ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground">সব পরীক্ষার ক্যাটেগরি যোগ করুন, সম্পাদনা করুন এবং পরিচালনা করুন</p>
        </div>

        {/* Add Category Button */}
        <div className="mb-6">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                নতুন ক্যাটেগরি যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>নতুন ক্যাটেগরি যোগ করুন</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category-name">ক্যাটেগরি নাম *</Label>
                  <Input
                    id="category-name"
                    placeholder="যেমন: ভর্তি পরীক্ষা"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category-id">ক্যাটেগরি ID (ঐচ্ছিক)</Label>
                  <Input
                    id="category-id"
                    placeholder="যেমন: admission"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddCategory} className="w-full">
                  ক্যাটেগরি যোগ করুন
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">ID: {category.id}</CardDescription>
                  </div>
                  <Badge variant="outline">{category.subjects.length} বিষয়</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Subject List */}
                  <div>
                    <p className="text-sm font-medium mb-2">বিষয়সমূহ:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {category.subjects.slice(0, 5).map((subject) => (
                        <div
                          key={subject.id}
                          className="text-xs bg-muted p-2 rounded flex items-center justify-between"
                        >
                          <span>{subject.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {subject.topics?.length || 0}
                          </Badge>
                        </div>
                      ))}
                      {category.subjects.length > 5 && (
                        <div className="text-xs text-muted-foreground p-2">
                          +{category.subjects.length - 5} আরও বিষয়...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3">
                    <Dialog open={isEditDialogOpen && selectedCategory?.id === category.id}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-2"
                          onClick={() => {
                            setSelectedCategory(category as any);
                            setFormData({ id: category.id, name: category.name });
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                          সম্পাদনা
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>ক্যাটেগরি সম্পাদনা</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-category-name">ক্যাটেগরি নাম *</Label>
                            <Input
                              id="edit-category-name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                          </div>
                          <Button onClick={handleEditCategory} className="w-full">
                            সংরক্ষণ করুন
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 gap-2"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                      মুছুন
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {categories.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">কোনো ক্যাটেগরি নেই। শুরু করতে একটি যোগ করুন।</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>প্রথম ক্যাটেগরি যোগ করুন</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
