import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";

export default function AdminQuestionsTab() {
  const { toast } = useToast();
  const { refreshTrigger } = useAdmin();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [refreshTrigger, selectedSubject, searchQuery]);

  const fetchSubjects = async () => {
    try {
      const { data } = await supabase.from("subjects").select("*").limit(100);
      setSubjects(data || []);
    } catch (error) {
      console.error("[v0] Failed to fetch subjects:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      let query = supabase.from("question_bank").select("*, subjects(name)");
      
      if (selectedSubject) {
        query = query.eq("subject_id", selectedSubject);
      }
      
      if (searchQuery) {
        query = query.ilike("question_text", `%${searchQuery}%`);
      }

      const { data } = await query.limit(50);
      setQuestions(data || []);
    } catch (error) {
      toast({ title: "Error", description: "প্রশ্ন লোড করতে ব্যর্থ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি এই প্রশ্ন মুছে দিতে চান?")) {
      try {
        await supabase.from("question_bank").delete().eq("id", id);
        toast({ title: "সাফল্য", description: "প্রশ্ন সফলভাবে মুছে দেওয়া হয়েছে" });
        fetchQuestions();
      } catch (error) {
        toast({ title: "Error", description: "প্রশ্ন মুছতে ব্যর্থ", variant: "destructive" });
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">প্রশ্ন ব্যবস্থাপনা</h2>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          নতুন প্রশ্ন
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">ফিল্টার এবং অনুসন্ধান</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>বিষয় নির্বাচন করুন</Label>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setSelectedSubject("")} className={`px-3 py-1 rounded text-sm ${selectedSubject === "" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>সব বিষয়</button>
                {subjects.slice(0, 5).map((subject) => (
                  <button key={subject.id} onClick={() => setSelectedSubject(subject.id)} className={`px-3 py-1 rounded text-sm ${selectedSubject === subject.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                    {subject.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>প্রশ্ন অনুসন্ধান করুন</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="প্রশ্ন খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            প্রশ্ন তালিকা ({questions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <p className="text-muted-foreground">কোন প্রশ্ন পাওয়া যায়নি</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {questions.map((question) => (
                <div key={question.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-2">{question.question_text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      বিষয়: {question.subjects?.name || "অজানা"}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleDelete(question.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
