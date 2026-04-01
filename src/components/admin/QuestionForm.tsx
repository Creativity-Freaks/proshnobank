import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { SUBJECT_OPTIONS, normalizeSubjectKey } from '@/lib/subjects';

interface QuestionFormData {
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

interface QuestionFormProps {
  initialData?: QuestionFormData;
  onSubmit: (data: QuestionFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const QuestionForm = ({ initialData, onSubmit, onCancel, isSubmitting }: QuestionFormProps) => {
  const [formData, setFormData] = useState<QuestionFormData>({
    subject: '',
    topic: '',
    difficulty: 'medium',
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        subject: normalizeSubjectKey(initialData.subject) || initialData.subject,
      });
    }
  }, [initialData]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData({ ...formData, options: [...formData.options, ''] });
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      const newCorrectAnswer = formData.correct_answer >= index && formData.correct_answer > 0
        ? formData.correct_answer - 1
        : formData.correct_answer;
      setFormData({ 
        ...formData, 
        options: newOptions,
        correct_answer: Math.min(newCorrectAnswer, newOptions.length - 1)
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'প্রশ্ন সম্পাদনা করুন' : 'নতুন প্রশ্ন যোগ করুন'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">বিষয়</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) => setFormData({ ...formData, subject: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECT_OPTIONS.map((subject) => (
                    <SelectItem key={subject.key} value={subject.key}>{subject.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">টপিক</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="টপিক লিখুন"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">কঠিনতা</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                  setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="কঠিনতা নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">সহজ</SelectItem>
                  <SelectItem value="medium">মাঝারি</SelectItem>
                  <SelectItem value="hard">কঠিন</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question_text">প্রশ্ন</Label>
            <Textarea
              id="question_text"
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              placeholder="প্রশ্ন লিখুন"
              required
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>অপশনসমূহ</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={formData.options.length >= 6}
              >
                <Plus className="h-4 w-4 mr-1" /> অপশন যোগ করুন
              </Button>
            </div>
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct_answer"
                  checked={formData.correct_answer === index}
                  onChange={() => setFormData({ ...formData, correct_answer: index })}
                  className="h-4 w-4 text-primary"
                />
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`অপশন ${index + 1}`}
                  required
                />
                {formData.options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <p className="text-sm text-muted-foreground">
              সঠিক উত্তর সিলেক্ট করতে রেডিও বাটনে ক্লিক করুন
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation">ব্যাখ্যা (ঐচ্ছিক)</Label>
            <Textarea
              id="explanation"
              value={formData.explanation || ''}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="উত্তরের ব্যাখ্যা লিখুন"
              rows={2}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              বাতিল
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'সেভ হচ্ছে...' : initialData ? 'আপডেট করুন' : 'সেভ করুন'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
