import { useQuery } from "@tanstack/react-query";
import { adminApi, type SubjectInfo } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen } from "lucide-react";

export default function AdminSubjects() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-subjects"],
    queryFn: () => adminApi.subjects(),
  });

  const subjects: SubjectInfo[] = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">বিষয় ও টপিক</h1>
        <p className="text-muted-foreground">প্রশ্ন ব্যাংক থেকে স্বয়ংক্রিয়ভাবে সংগৃহীত বিষয় ও টপিকসমূহ</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : subjects.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">কোনো বিষয় নেই। প্রশ্ন ব্যাংকে প্রশ্ন যোগ করুন।</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <Card key={s.name}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    {s.name}
                  </CardTitle>
                  <Badge variant="secondary">{s.question_count} প্রশ্ন</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{s.topics.length}টি টপিক</p>
                <div className="flex flex-wrap gap-1">
                  {s.topics.map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
