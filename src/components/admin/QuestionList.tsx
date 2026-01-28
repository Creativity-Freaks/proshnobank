import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Question = Tables<'question_bank'>;

interface QuestionListProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
  isDeleting: string | null;
}

const difficultyLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  easy: { label: 'সহজ', variant: 'secondary' },
  medium: { label: 'মাঝারি', variant: 'default' },
  hard: { label: 'কঠিন', variant: 'destructive' },
};

export const QuestionList = ({ questions, onEdit, onDelete, isDeleting }: QuestionListProps) => {
  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          কোনো প্রশ্ন পাওয়া যায়নি। নতুন প্রশ্ন যোগ করুন।
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">প্রশ্ন</TableHead>
              <TableHead>বিষয়</TableHead>
              <TableHead>টপিক</TableHead>
              <TableHead>কঠিনতা</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => {
              const options = question.options as string[];
              const difficultyInfo = difficultyLabels[question.difficulty] || difficultyLabels.medium;
              
              return (
                <TableRow key={question.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium line-clamp-2">{question.question_text}</p>
                      <p className="text-sm text-muted-foreground">
                        {options.length} অপশন • সঠিক: অপশন {question.correct_answer + 1}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{question.subject}</TableCell>
                  <TableCell>{question.topic}</TableCell>
                  <TableCell>
                    <Badge variant={difficultyInfo.variant}>
                      {difficultyInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDelete(question.id)}
                        disabled={isDeleting === question.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
