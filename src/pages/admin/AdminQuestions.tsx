import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { questionsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuestionForm } from '@/components/admin/QuestionForm';
import { QuestionList } from '@/components/admin/QuestionList';
import { Plus, Search, Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

interface QuestionFormData {
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

type Question = Tables<'question_bank'>;

function isQuestion(value: unknown): value is Question {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.subject === 'string' &&
    typeof v.topic === 'string' &&
    (v.difficulty === 'easy' || v.difficulty === 'medium' || v.difficulty === 'hard') &&
    typeof v.question_text === 'string' &&
    Array.isArray(v.options) &&
    typeof v.correct_answer === 'number' &&
    typeof v.created_at === 'string'
  );
}

export default function AdminQuestions() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await questionsApi.list({
        subject: subjectFilter !== 'all' ? subjectFilter : undefined,
        difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
        search: searchQuery || undefined,
      });
      const data = Array.isArray(res.data) ? (res.data as unknown[]) : [];
      setQuestions(data.filter(isQuestion));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'প্রশ্ন লোড করতে সমস্যা হয়েছে।';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [difficultyFilter, searchQuery, subjectFilter, toast]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSubmit = async (formData: QuestionFormData) => {
    try {
      setIsSubmitting(true);
      if (editingQuestion) {
        await questionsApi.update(editingQuestion.id, { ...formData } as Record<string, unknown>);
        toast({ title: 'সফল!', description: 'প্রশ্ন আপডেট হয়েছে।' });
      } else {
        await questionsApi.create(formData);
        toast({ title: 'সফল!', description: 'নতুন প্রশ্ন যোগ হয়েছে।' });
      }
      setShowForm(false);
      setEditingQuestion(null);
      fetchQuestions();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'প্রশ্ন সেভ করতে সমস্যা হয়েছে।';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (question: Question) => { setEditingQuestion(question); setShowForm(true); };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত?')) return;
    try {
      setIsDeleting(id);
      await questionsApi.delete(id);
      toast({ title: 'সফল!', description: 'প্রশ্ন মুছে ফেলা হয়েছে।' });
      fetchQuestions();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'প্রশ্ন মুছতে সমস্যা হয়েছে।';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsDeleting(null);
    }
  };

  const subjects = [...new Set(questions.map((q) => q.subject))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">প্রশ্ন ব্যাংক</h1>
        <p className="text-muted-foreground">প্রশ্ন যোগ, সম্পাদনা ও মুছুন</p>
      </div>

      {showForm ? (
        <QuestionForm
          initialData={editingQuestion ? {
            subject: editingQuestion.subject,
            topic: editingQuestion.topic,
            difficulty: editingQuestion.difficulty,
            question_text: editingQuestion.question_text,
            options: editingQuestion.options as string[],
            correct_answer: editingQuestion.correct_answer,
            explanation: editingQuestion.explanation || '',
          } : undefined}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditingQuestion(null); }}
          isSubmitting={isSubmitting}
        />
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="প্রশ্ন খুঁজুন..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="বিষয়" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব বিষয়</SelectItem>
                {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="কঠিনতা" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব লেভেল</SelectItem>
                <SelectItem value="easy">সহজ</SelectItem>
                <SelectItem value="medium">মাঝারি</SelectItem>
                <SelectItem value="hard">কঠিন</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" /> নতুন প্রশ্ন</Button>
          </div>
          <div className="text-muted-foreground text-sm">মোট {questions.length}টি প্রশ্ন</div>
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <QuestionList questions={questions} onEdit={handleEdit} onDelete={handleDelete} isDeleting={isDeleting} />
          )}
        </>
      )}
    </div>
  );
}
