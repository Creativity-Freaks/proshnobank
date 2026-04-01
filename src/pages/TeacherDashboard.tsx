import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePageMeta } from "@/hooks/usePageMeta";
import { examsApi, leaderboardApi, questionsApi } from "@/lib/api";
import { mapLiveExamRow } from "@/lib/live-exam";
import { FileText, Search, Users, BookOpen, Loader2, CalendarClock, ArrowRight } from "lucide-react";

const TeacherDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");

  usePageMeta({
    title: "টিচার ড্যাশবোর্ড",
    description: "লাইভ এক্সাম, প্রশ্ন সংখ্যা এবং শিক্ষার্থীদের অংশগ্রহণের সারাংশ দেখুন।",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: async () => {
      const [questionRes, liveRes, leaderboardRes] = await Promise.all([
        questionsApi.list({ limit: 1 }),
        examsApi.live(),
        leaderboardApi.stats(),
      ]);

      const liveRows = Array.isArray(liveRes.data) ? liveRes.data : [];
      const liveExams = liveRows
        .map(mapLiveExamRow)
        .filter((x): x is NonNullable<typeof x> => Boolean(x));

      return {
        totalQuestions: questionRes.total,
        liveExams,
        leaderboardStats: leaderboardRes.data,
      };
    },
  });

  const filteredLiveExams = useMemo(() => {
    const rows = data?.liveExams || [];
    if (!searchTerm.trim()) return rows;
    return rows.filter((row) => row.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data?.liveExams, searchTerm]);

  return (
    <div className="min-h-screen bg-background font-bengali">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">টিচার ড্যাশবোর্ড</h1>
              <p className="text-muted-foreground">পরীক্ষা ও প্রশ্নব্যাংকের লাইভ অবস্থা দেখুন এবং কনটেন্ট ম্যানেজ করুন</p>
            </div>
            <div className="flex gap-3">
              <Link to="/admin">
                <Button variant="hero">অ্যাডমিন প্যানেলে যান</Button>
              </Link>
              <Link to="/question-bank">
                <Button variant="outline">প্রশ্নব্যাংক দেখুন</Button>
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : isError || !data ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-foreground mb-2">ডাটা লোড করা যায়নি</h2>
              <p className="text-muted-foreground">অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <CalendarClock className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{data.liveExams.length}</div>
                  <div className="text-sm text-muted-foreground">লাইভ/আসন্ন এক্সাম</div>
                </div>

                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-3">
                    <BookOpen className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{data.totalQuestions}</div>
                  <div className="text-sm text-muted-foreground">মোট প্রশ্ন</div>
                </div>

                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{data.leaderboardStats.total_participants}</div>
                  <div className="text-sm text-muted-foreground">মোট অংশগ্রহণকারী</div>
                </div>

                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{data.leaderboardStats.total_exams}</div>
                  <div className="text-sm text-muted-foreground">মোট সম্পন্ন এক্সাম</div>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <h2 className="text-xl font-bold text-foreground">লাইভ এক্সাম তালিকা</h2>
                    <div className="relative w-full md:max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="এক্সাম খুঁজুন..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {filteredLiveExams.length === 0 ? (
                    <div className="p-10 text-center text-muted-foreground">এই ফিল্টারে কোনো এক্সাম নেই</div>
                  ) : (
                    filteredLiveExams.map((exam) => (
                      <div key={exam.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-foreground">{exam.title}</h3>
                            <Badge variant={exam.status === "live" ? "destructive" : "secondary"}>
                              {exam.status === "live" ? "লাইভ" : "আসন্ন"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {exam.category} • {exam.questions} প্রশ্ন • {exam.durationLabel} • {exam.participants}+ অংশগ্রহণকারী
                          </p>
                        </div>
                        <Link to={`/exam/${exam.id}`}>
                          <Button variant="outline" className="gap-2">
                            বিস্তারিত দেখুন <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TeacherDashboard;
