import { BackButton } from "@/components/BackButton";
import { examCatalog } from "@/lib/exam-catalog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function AdminCategoriesNew() {
  const categories = examCatalog.categories;

  const handleDelete = (id: string) => {
    if (confirm("কি এই ক্যাটেগরি মুছে দিতে চান?")) {
      console.log("[v0] Delete category:", id);
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

        <div className="mb-6">
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            নতুন ক্যাটেগরি যোগ করুন
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <Badge variant="outline" className="whitespace-nowrap">
                    {category.subjects.length} বিষয়
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">বিষয়সমূহ:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {category.subjects.slice(0, 5).map((subject: any) => (
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

                  <div className="flex gap-2 pt-3">
                    <Button size="sm" variant="outline" className="flex-1 gap-2">
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">কোনো ক্যাটেগরি নেই। শুরু করতে একটি যোগ করুন।</p>
              <Button>প্রথম ক্যাটেগরি যোগ করুন</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
