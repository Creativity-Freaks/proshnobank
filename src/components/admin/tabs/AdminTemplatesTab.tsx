import { useEffect, useState } from "react";
import { Plus, Trash2, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";

export default function AdminTemplatesTab() {
  const { toast } = useToast();
  const { refreshTrigger } = useAdmin();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, [refreshTrigger]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("exam_templates")
        .select("*")
        .limit(100);
      setTemplates(data || []);
    } catch (error) {
      toast({ title: "Error", description: "টেমপ্লেট লোড করতে ব্যর্থ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি এই টেমপ্লেট মুছে দিতে চান?")) {
      try {
        await supabase.from("exam_templates").delete().eq("id", id);
        toast({ title: "সাফল্য", description: "টেমপ্লেট সফলভাবে মুছে দেওয়া হয়েছে" });
        fetchTemplates();
      } catch (error) {
        toast({ title: "Error", description: "টেমপ্লেট মুছতে ব্যর্থ", variant: "destructive" });
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">টেমপ্লেট ব্যবস্থাপনা</h2>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          নতুন টেমপ্লেট
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">কোন টেমপ্লেট পাওয়া যায়নি</p>
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="text-lg">{template.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-2">
                    <Eye className="w-3 h-3" />
                    দেখুন
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1 gap-2" onClick={() => handleDelete(template.id)}>
                    <Trash2 className="w-3 h-3" />
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
