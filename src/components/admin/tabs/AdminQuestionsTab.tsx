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
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [selectedSubjectText, setSelectedSubjectText] = useState<string>("");
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
    fetchSubjectOptions();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategoriesByParent(selectedCategory);
    } else {
      setSubcategories([]);
      setSelectedSubcategory("");
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchQuestions();
  }, [refreshTrigger, selectedSubjectText, searchQuery]);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from("exam_categories")
        .select("id, name")
        .is("parent_id", null)
        .order("sort_order", { ascending: true });
      setCategories(data || []);
    } catch (error) {
      console.error("[v0] Failed to fetch categories:", error);
    }
  };

  const fetchSubcategoriesByParent = async (categoryId: string) => {
    try {
      const { data } = await supabase
        .from("exam_categories")
        .select("id, name")
        .eq("parent_id", categoryId)
        .order("sort_order", { ascending: true });
      setSubcategories(data || []);
    } catch (error) {
      console.error("[v0] Failed to fetch subcategories:", error);
    }
  };

  const fetchSubjectOptions = async () => {
    try {
      // Get unique subject text values from question_bank
      const { data } = await supabase
        .from("question_bank")
        .select("subject")
        .limit(200);
      const unique = Array.from(new Set((data || []).map((d: any) => d.subject).filter(Boolean))).sort();
      setSubjectOptions(unique as string[]);
    } catch (error) {
      console.error("[v0] Failed to fetch subject options:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("question_bank")
        .select("id, subject, topic, difficulty, question_text, options, correct_answer, explanation, created_at");

      if (selectedSubjectText) {
        query = query.eq("subject", selectedSubjectText);
      }

      if (searchQuery) {
        query = query.ilike("question_text", `%${searchQuery}%`);
      }

      const { data } = await query.order("created_at", { ascending: false }).limit(50);
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
        const { error } = await supabase.from("question_bank").delete().eq("id", id);
        if (error) throw error;
        toast({ title: "সাফল্য", description: "প্রশ্ন সফলভাবে মুছে দেওয়া হয়েছে" });
        fetchQuestions();
        fetchSubjectOptions();
      } catch (error: any) {
        toast({ title: "Error", description: error?.message || "প্রশ্ন মুছতে ব্যর্থ", variant: "destructive" });
      }
    }
  };

  const handleSave = async () => {
    if (!formData.subject || !formData.topic || !formData.question_text) {
      toast({ title: "Error", description: "বিষয়, অধ্যায় এবং প্রশ্ন বাধ্যতামূলক", variant: "destructive" });
      return;
    }

    if (formData.options.some((opt) => !opt.trim())) {
      toast({ title: "Error", description: "সব বিকল্প পূরণ করুন", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        subject: formData.subject.trim(),
        topic: formData.topic.trim(),
        difficulty: formData.difficulty as "easy" | "medium" | "hard",
        question_text: formData.question_text.trim(),
        options: formData.options,
        correct_answer: parseInt(String(formData.correct_answer)),
        explanation: formData.explanation.trim() || null,
      };

      if (editingId) {
        const { error } = await supabase.from("question_bank").update(payload).eq("id", editingId);
        if (error) throw error;
        toast({ title: "সাফল্য", description: "প্রশ্ন সফলভাবে আপডেট হয়েছে" });
      } else {
        const { error } = await supabase.from("question_bank").insert([payload]);
        if (error) throw error;
        toast({ title: "সাফল্য", description: "প্রশ্ন সফলভাবে তৈরি হয়েছে" });
      }

      resetForm();
      fetchQuestions();
      fetchSubjectOptions();
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "প্রশ্ন সংরক্ষণ করতে ব্যর্থ", variant: "destructive" });
    }
  };

  const handleEdit = (question: any) => {
    setEditingId(question.id);
    setFormData({
      subject: question.subject || "",
      topic: question.topic || "",
      difficulty: question.difficulty || "medium",
      question_text: question.question_text || "",
      options: Array.isArray(question.options) ? question.options : ["", "", "", ""],
      correct_answer: question.correct_answer ?? 0,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">প্রশ্ন ব্যবস্থাপনা</h2>
          <p className="text-sm text-muted-foreground mt-1">মোট {questions.length}টি প্রশ্ন দেখাচ্ছে</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
              setEditingId(null);
            }
          }}
        >
          <Plus className="w-4 h-4" />
          {showForm ? "বাতিল করুন" : "নতুন প্রশ্ন"}
        </Button>
      </div>

      {/* Question Form */}
      {showForm && (
        <Card className="border-2 border-primary">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingId ? "প্রশ্ন সম্পাদনা করুন" : "নতুন প্রশ্ন যোগ করুন"}</CardTitle>
            <Button size="sm" variant="ghost" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>বিষয় (Subject) *</Label>
                <Input
                  placeholder="যেমন: গণিত, বাংলা, পদার্থ"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  list="subject-suggestions"
                />
                {subjectOptions.length > 0 && (
                  <datalist id="subject-suggestions">
                    {subjectOptions.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                )}
                {subjectOptions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {subjectOptions.slice(0, 6).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({ ...formData, subject: s })}
                        className="text-xs px-2 py-0.5 rounded-full border border-border hover:bg-muted transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>অধ্যায়/বিষয়বস্তু (Topic) *</Label>
                <Input
                  placeholder="যেমন: বীজগণিত, অনুচ্ছেদ রচনা"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>কঠিনতা স্তর</Label>
                <div className="flex gap-2">
                  {[
                    { value: "easy", label: "সহজ" },
                    { value: "medium", label: "মাঝারি" },
                    { value: "hard", label: "কঠিন" },
                  ].map((level) => (
                    <Button
                      key={level.value}
                      size="sm"
                      type="button"
                      variant={formData.difficulty === level.value ? "default" : "outline"}
                      onClick={() => setFormData({ ...formData, difficulty: level.value })}
                    >
                      {level.label}
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
                      type="button"
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
                <div key={index} className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      formData.correct_answer === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <Input
                    placeholder={`বিকল্প ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[index] = e.target.value;
                      setFormData({ ...formData, options: newOptions });
                    }}
                  />
                </div>
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
              <Button onClick={resetForm} variant="outline" className="flex-1">
                বাতিল করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">ফিল্টার এবং অনুসন্ধান</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="প্রশ্নের টেক্সট দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label>ক্যাটেগরি</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedCategory === "" ? "default" : "outline"}
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedSubcategory("");
                  }}
                >
                  সব
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    size="sm"
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedSubcategory("");
                    }}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Subject Filter (from actual question_bank data) */}
          {subjectOptions.length > 0 && (
            <div className="space-y-2">
              <Label>বিষয় অনুযায়ী ফিল্টার</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedSubjectText === "" ? "default" : "outline"}
                  onClick={() => setSelectedSubjectText("")}
                >
                  সব বিষয়
                </Button>
                {subjectOptions.slice(0, 12).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={selectedSubjectText === s ? "default" : "outline"}
                    onClick={() => setSelectedSubjectText(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters */}
          {(selectedSubjectText || searchQuery) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {selectedSubjectText && (
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs flex items-center gap-1">
                  বিষয়: {selectedSubjectText}
                  <button onClick={() => setSelectedSubjectText("")} className="hover:font-bold ml-1">
                    ×
                  </button>
                </div>
              )}
              {searchQuery && (
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs flex items-center gap-1">
                  খোঁজ: {searchQuery.substring(0, 20)}
                  <button onClick={() => setSearchQuery("")} className="hover:font-bold ml-1">
                    ×
                  </button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">প্রশ্ন তালিকা ({questions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : questions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">কোন প্রশ্ন পাওয়া যায়নি</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2">{question.question_text}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-primary font-medium">{question.subject}</span>
                      <span className="text-xs text-muted-foreground">{question.topic}</span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                          question.difficulty === "easy"
                            ? "bg-green-100 text-green-700"
                            : question.difficulty === "hard"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {question.difficulty === "easy"
                          ? "সহজ"
                          : question.difficulty === "hard"
                          ? "কঠিন"
                          : "মাঝারি"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(question)}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(question.id)}>
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
