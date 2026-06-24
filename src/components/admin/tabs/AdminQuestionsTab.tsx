import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { Textarea } from "@/components/ui/textarea";

export default function AdminQuestionsTab() {
  const { toast } = useToast();
  const { refreshTrigger } = useAdmin();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: "",
    topic: "",
    difficulty: "medium",
    question_text: "",
    options: ["", "", "", ""],
    correct_answer: 0,
    explanation: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory);
    } else {
      setSubcategories([]);
      setSelectedSubcategory("");
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchQuestions();
  }, [refreshTrigger, selectedSubject, searchQuery]);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from("exam_categories")
        .select("*")
        .is("parent_id", null)
        .order("sort_order", { ascending: true });
      setCategories(data || []);
    } catch (error) {
      console.error("[v0] Failed to fetch categories:", error);
    }
  };

  const fetchSubcategories = async (categoryId: string) => {
    try {
      const { data } = await supabase
        .from("exam_categories")
        .select("*")
        .eq("parent_id", categoryId)
        .order("sort_order", { ascending: true });
      setSubcategories(data || []);
    } catch (error) {
      console.error("[v0] Failed to fetch subcategories:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data } = await supabase
        .from("subjects")
        .select("*, exam_categories(name)")
        .order("name", { ascending: true })
        .limit(100);
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

  const handleSave = async () => {
    if (!formData.subject || !formData.topic || !formData.question_text) {
      toast({ title: "Error", description: "সব প্রয়োজনীয় ক্ষেত্র পূরণ করুন", variant: "destructive" });
      return;
    }

    if (formData.options.some(opt => !opt.trim())) {
      toast({ title: "Error", description: "সব বিকল্প পূরণ করুন", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        subject: formData.subject,
        topic: formData.topic,
        difficulty: formData.difficulty,
        question_text: formData.question_text,
        options: formData.options,
        correct_answer: parseInt(String(formData.correct_answer)),
        explanation: formData.explanation,
      };

      if (editingId) {
        // Update
        const { error } = await supabase.from("question_bank").update(payload).eq("id", editingId);
        if (error) throw error;
        toast({ title: "সাফল্য", description: "প্রশ্ন সফলভাবে আপডেট হয়েছে" });
      } else {
        // Create
        const { error } = await supabase.from("question_bank").insert([payload]);
        if (error) throw error;
        toast({ title: "সাফল্য", description: "প্রশ্ন সফলভাবে তৈরি হয়েছে" });
      }

      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error("[v0] Failed to save question:", error);
      toast({ title: "Error", description: "প্রশ্ন সংরক্ষণ করতে ব্যর্থ", variant: "destructive" });
    }
  };

  const handleEdit = (question: any) => {
    setEditingId(question.id);
    setFormData({
      subject: question.subject,
      topic: question.topic,
      difficulty: question.difficulty || "medium",
      question_text: question.question_text,
      options: Array.isArray(question.options) ? question.options : ["", "", "", ""],
      correct_answer: question.correct_answer || 0,
      explanation: question.explanation || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      subject: "",
      topic: "",
      difficulty: "medium",
      question_text: "",
      options: ["", "", "", ""],
      correct_answer: 0,
      explanation: "",
    });
    setShowForm(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">প্রশ্ন ব্যবস্থাপনা</h2>
        <Button className="gap-2" onClick={() => { setShowForm(!showForm); if (!showForm) resetForm(); }}>
          <Plus className="w-4 h-4" />
          {showForm ? "বাতিল করুন" : "ন���ুন প্রশ্ন"}
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-primary">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingId ? "প্রশ্ন সম্পাদনা করুন" : "নতুন প্রশ্ন যোগ করুন"}</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>বিষয় *</Label>
                <Input
                  placeholder="বিষয় (যেমন: গণিত)"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>বিষয়বস্তু/অধ্যায় *</Label>
                <Input
                  placeholder="অধ্যায় (যেমন: বীজগণিত)"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>কঠিনতা স্তর</Label>
                <div className="flex gap-2">
                  {["easy", "medium", "hard"].map((level) => (
                    <Button
                      key={level}
                      size="sm"
                      variant={formData.difficulty === level ? "default" : "outline"}
                      onClick={() => setFormData({ ...formData, difficulty: level })}
                    >
                      {level === "easy" ? "সহজ" : level === "medium" ? "মাঝারি" : "কঠিন"}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>সঠিক উত্তর *</Label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant={formData.correct_answer === index ? "default" : "outline"}
                      onClick={() => setFormData({ ...formData, correct_answer: index })}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>প্রশ্ন টেক্সট *</Label>
              <Textarea
                placeholder="প্রশ্ন এখানে লিখুন..."
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>বিকল্পগুলি *</Label>
              {formData.options.map((option, index) => (
                <Input
                  key={index}
                  placeholder={`বিকল্প ${index + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...formData.options];
                    newOptions[index] = e.target.value;
                    setFormData({ ...formData, options: newOptions });
                  }}
                />
              ))}
            </div>

            <div className="space-y-2">
              <Label>ব্যাখ্যা (ঐচ্ছিক)</Label>
              <Textarea
                placeholder="সঠিক উত্তরের ব্যাখ্যা..."
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1">
                {editingId ? "আপডেট করুন" : "প্রশ্ন সংরক্ষণ করুন"}
              </Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1">
                বাতিল করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">ফিল্টার এবং অনুসন্ধান</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="space-y-2">
            <Label>প্রশ্ন অনুসন্ধান করুন</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="প্রশ্নের টেক্সট দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Buttons */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label>ক্যাটেগরি নির্বাচন করুন</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedCategory === "" ? "default" : "outline"}
                  onClick={() => { setSelectedCategory(""); setSelectedSubcategory(""); }}
                >
                  সব ক্যাটেগরি
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    size="sm"
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    onClick={() => { setSelectedCategory(cat.id); setSelectedSubcategory(""); }}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Subcategory Buttons */}
          {selectedCategory && subcategories.length > 0 && (
            <div className="space-y-2">
              <Label>পরীক্ষা নির্বাচন করুন</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedSubcategory === "" ? "default" : "outline"}
                  onClick={() => setSelectedSubcategory("")}
                >
                  সব পরীক্ষা
                </Button>
                {subcategories.map((sub) => (
                  <Button
                    key={sub.id}
                    size="sm"
                    variant={selectedSubcategory === sub.id ? "default" : "outline"}
                    onClick={() => setSelectedSubcategory(sub.id)}
                  >
                    {sub.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Subject Buttons */}
          {subjects.length > 0 && (
            <div className="space-y-2">
              <Label>বিষয় নির্বাচন করুন</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedSubject === "" ? "default" : "outline"}
                  onClick={() => setSelectedSubject("")}
                >
                  সব বিষয়
                </Button>
                {subjects.slice(0, 8).map((subject) => (
                  <Button
                    key={subject.id}
                    size="sm"
                    variant={selectedSubject === subject.id ? "default" : "outline"}
                    onClick={() => setSelectedSubject(subject.id)}
                  >
                    {subject.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(selectedCategory || selectedSubcategory || selectedSubject || searchQuery) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {selectedCategory && (
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs flex items-center gap-1">
                  ক্যাটেগরি: {categories.find(c => c.id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory("")} className="hover:font-bold">×</button>
                </div>
              )}
              {selectedSubcategory && (
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs flex items-center gap-1">
                  পরীক্ষা: {subcategories.find(s => s.id === selectedSubcategory)?.name}
                  <button onClick={() => setSelectedSubcategory("")} className="hover:font-bold">×</button>
                </div>
              )}
              {selectedSubject && (
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs flex items-center gap-1">
                  বিষয়: {subjects.find(s => s.id === selectedSubject)?.name}
                  <button onClick={() => setSelectedSubject("")} className="hover:font-bold">×</button>
                </div>
              )}
              {searchQuery && (
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs flex items-center gap-1">
                  খোঁজ: {searchQuery.substring(0, 20)}...
                  <button onClick={() => setSearchQuery("")} className="hover:font-bold">×</button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            প���রশ্ন তালিকা ({questions.length})
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
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => handleEdit(question)}>
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
