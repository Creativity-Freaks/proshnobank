import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuestionForm } from '@/components/admin/QuestionForm';
import { QuestionList } from '@/components/admin/QuestionList';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Plus, Search, ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

type Question = Tables<'question_bank'>;

interface QuestionFormData {
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isLoading: isCheckingAdmin } = useAdminCheck();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  useEffect(() => {
    if (!isCheckingAdmin && !isAdmin) {
      toast({
        title: 'অ্যাক্সেস অস্বীকৃত',
        description: 'এই পেজে অ্যাক্সেস করতে অ্যাডমিন অনুমতি প্রয়োজন।',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [isAdmin, isCheckingAdmin, navigate, toast]);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      let query = supabase.from('question_bank').select('*').order('created_at', { ascending: false });
      
      if (subjectFilter !== 'all') {
        query = query.eq('subject', subjectFilter);
      }
      if (difficultyFilter !== 'all' && (difficultyFilter === 'easy' || difficultyFilter === 'medium' || difficultyFilter === 'hard')) {
        query = query.eq('difficulty', difficultyFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      let filteredData = data || [];
      if (searchQuery) {
        filteredData = filteredData.filter(q => 
          q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.topic.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setQuestions(filteredData);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: 'Error',
        description: 'প্রশ্ন লোড করতে সমস্যা হয়েছে।',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchQuestions();
    }
  }, [isAdmin, subjectFilter, difficultyFilter, searchQuery]);

  const handleSubmit = async (formData: QuestionFormData) => {
    try {
      setIsSubmitting(true);
      
      const questionData = {
        subject: formData.subject,
        topic: formData.topic,
        difficulty: formData.difficulty,
        question_text: formData.question_text,
        options: formData.options,
        correct_answer: formData.correct_answer,
        explanation: formData.explanation || null,
      };

      if (editingQuestion) {
        const { error } = await supabase
          .from('question_bank')
          .update(questionData)
          .eq('id', editingQuestion.id);
        
        if (error) throw error;
        
        toast({
          title: 'সফল!',
          description: 'প্রশ্ন আপডেট হয়েছে।',
        });
      } else {
        const { error } = await supabase
          .from('question_bank')
          .insert(questionData);
        
        if (error) throw error;
        
        toast({
          title: 'সফল!',
          description: 'নতুন প্রশ্ন যোগ হয়েছে।',
        });
      }
      
      setShowForm(false);
      setEditingQuestion(null);
      fetchQuestions();
    } catch (error: any) {
      console.error('Error saving question:', error);
      toast({
        title: 'Error',
        description: error.message || 'প্রশ্ন সেভ করতে সমস্যা হয়েছে।',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত এই প্রশ্নটি মুছে ফেলতে চান?')) return;
    
    try {
      setIsDeleting(id);
      const { error } = await supabase.from('question_bank').delete().eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'সফল!',
        description: 'প্রশ্ন মুছে ফেলা হয়েছে।',
      });
      
      fetchQuestions();
    } catch (error: any) {
      console.error('Error deleting question:', error);
      toast({
        title: 'Error',
        description: error.message || 'প্রশ্ন মুছতে সমস্যা হয়েছে।',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingQuestion(null);
  };

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const subjects = [...new Set(questions.map(q => q.subject))];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            হোমে ফিরে যান
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">অ্যাডমিন প্যানেল</h1>
          </div>
          <p className="text-muted-foreground">প্রশ্ন ব্যাংক পরিচালনা করুন</p>
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
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="প্রশ্ন বা টপিক খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="বিষয়" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব বিষয়</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="কঠিনতা" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব লেভেল</SelectItem>
                  <SelectItem value="easy">সহজ</SelectItem>
                  <SelectItem value="medium">মাঝারি</SelectItem>
                  <SelectItem value="hard">কঠিন</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                নতুন প্রশ্ন
              </Button>
            </div>

            <div className="mb-4 text-muted-foreground">
              মোট {questions.length}টি প্রশ্ন পাওয়া গেছে
            </div>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <QuestionList
                questions={questions}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={isDeleting}
              />
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminPanel;
