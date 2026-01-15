import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Award,
  ChevronRight,
  Play,
  CheckCircle2,
  XCircle,
  BarChart3,
} from "lucide-react";

const examHistory = [
  {
    id: 1,
    title: "মেডিকেল মডেল টেস্ট - ২০২৬",
    date: "১৫ জানুয়ারি, ২০২৬",
    score: 85,
    totalMarks: 100,
    rank: 12,
    totalParticipants: 1250,
    status: "completed",
  },
  {
    id: 2,
    title: "HSC পদার্থবিজ্ঞান - চ্যাপ্টার ৫",
    date: "১২ জানুয়ারি, ২০২৬",
    score: 72,
    totalMarks: 80,
    rank: 45,
    totalParticipants: 890,
    status: "completed",
  },
  {
    id: 3,
    title: "BCS প্রিলিমিনারি মডেল - ০১",
    date: "১০ জানুয়ারি, ২০২৬",
    score: 68,
    totalMarks: 100,
    rank: 156,
    totalParticipants: 2100,
    status: "completed",
  },
  {
    id: 4,
    title: "রসায়ন মডেল টেস্ট - ০২",
    date: "০৮ জানুয়ারি, ২০২৬",
    score: 92,
    totalMarks: 100,
    rank: 5,
    totalParticipants: 650,
    status: "completed",
  },
];

const upcomingExams = [
  {
    id: 1,
    title: "মেডিকেল ফাইনাল মডেল টেস্ট",
    date: "২০ জানুয়ারি, ২০২৬",
    time: "রাত ৯:০০",
    duration: "২ ঘণ্টা",
    enrolled: true,
  },
  {
    id: 2,
    title: "HSC উচ্চতর গণিত - চ্যাপ্টার ৬",
    date: "২২ জানুয়ারি, ২০২৬",
    time: "বিকাল ৪:০০",
    duration: "১.৫ ঘণ্টা",
    enrolled: false,
  },
];

const subjectProgress = [
  { name: "পদার্থবিজ্ঞান", progress: 75, exams: 12, color: "bg-blue-500" },
  { name: "রসায়ন", progress: 82, exams: 15, color: "bg-emerald-500" },
  { name: "জীববিজ্ঞান", progress: 68, exams: 10, color: "bg-purple-500" },
  { name: "উচ্চতর গণিত", progress: 45, exams: 6, color: "bg-orange-500" },
  { name: "ইংরেজি", progress: 90, exams: 18, color: "bg-pink-500" },
];

const Dashboard = () => {
  const totalExams = 45;
  const avgScore = 79;
  const bestRank = 5;
  const studyHours = 128;

  return (
    <div className="min-h-screen bg-background font-bengali">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              স্বাগতম, <span className="text-primary">রহিম উদ্দিন</span>
            </h1>
            <p className="text-muted-foreground">
              তোমার প্রগ্রেস ট্র্যাক করো এবং নতুন এক্সামে অংশ নাও
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{totalExams}</div>
              <div className="text-sm text-muted-foreground">মোট এক্সাম</div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{avgScore}%</div>
              <div className="text-sm text-muted-foreground">গড় স্কোর</div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-accent" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">#{bestRank}</div>
              <div className="text-sm text-muted-foreground">সেরা র‍্যাংক</div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{studyHours}h</div>
              <div className="text-sm text-muted-foreground">পড়াশোনার সময়</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Exam History & Progress */}
            <div className="lg:col-span-2 space-y-8">
              {/* Recent Exam History */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    সাম্প্রতিক এক্সাম
                  </h2>
                  <Link to="/leaderboard">
                    <Button variant="ghost" size="sm" className="gap-1">
                      সব দেখুন <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {examHistory.map((exam) => (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          exam.score >= 80 ? "bg-secondary/20" : exam.score >= 60 ? "bg-accent/20" : "bg-destructive/20"
                        }`}>
                          {exam.score >= 80 ? (
                            <CheckCircle2 className="w-5 h-5 text-secondary" />
                          ) : exam.score >= 60 ? (
                            <TrendingUp className="w-5 h-5 text-accent" />
                          ) : (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{exam.title}</h3>
                          <p className="text-sm text-muted-foreground">{exam.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">
                          {exam.score}/{exam.totalMarks}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          র‍্যাংক #{exam.rank}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject Progress */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  বিষয়ভিত্তিক প্রগ্রেস
                </h2>

                <div className="space-y-5">
                  {subjectProgress.map((subject, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{subject.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {subject.exams} এক্সাম • {subject.progress}%
                        </span>
                      </div>
                      <Progress value={subject.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Upcoming & Achievements */}
            <div className="space-y-8">
              {/* Upcoming Exams */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    আপকামিং এক্সাম
                  </h2>
                  <Link to="/live-exams">
                    <Button variant="ghost" size="sm" className="gap-1">
                      সব <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {upcomingExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="p-4 bg-muted/30 rounded-xl border border-border"
                    >
                      <h3 className="font-semibold text-foreground mb-2">{exam.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>{exam.date}, {exam.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Clock className="w-4 h-4" />
                        <span>{exam.duration}</span>
                      </div>
                      <Link to={`/exam/${exam.id}`}>
                        <Button
                          variant={exam.enrolled ? "hero" : "outline"}
                          size="sm"
                          className="w-full gap-2"
                        >
                          {exam.enrolled ? (
                            <>
                              <Play className="w-4 h-4" />
                              এক্সামে যাও
                            </>
                          ) : (
                            "এনরোল করো"
                          )}
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  অর্জনসমূহ
                </h2>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl">
                    <Trophy className="w-8 h-8 text-white mx-auto mb-1" />
                    <div className="text-xs text-white/90">টপ ১০</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl">
                    <Award className="w-8 h-8 text-white mx-auto mb-1" />
                    <div className="text-xs text-white/90">৫০+ এক্সাম</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl">
                    <Target className="w-8 h-8 text-white mx-auto mb-1" />
                    <div className="text-xs text-white/90">৮০%+ গড়</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-xl border-2 border-dashed border-border">
                    <div className="w-8 h-8 rounded-full bg-muted mx-auto mb-1 flex items-center justify-center">
                      <span className="text-muted-foreground">?</span>
                    </div>
                    <div className="text-xs text-muted-foreground">আনলক করো</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-xl border-2 border-dashed border-border">
                    <div className="w-8 h-8 rounded-full bg-muted mx-auto mb-1 flex items-center justify-center">
                      <span className="text-muted-foreground">?</span>
                    </div>
                    <div className="text-xs text-muted-foreground">আনলক করো</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-xl border-2 border-dashed border-border">
                    <div className="w-8 h-8 rounded-full bg-muted mx-auto mb-1 flex items-center justify-center">
                      <span className="text-muted-foreground">?</span>
                    </div>
                    <div className="text-xs text-muted-foreground">আনলক করো</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-primary rounded-2xl p-6 text-primary-foreground">
                <h3 className="font-bold text-lg mb-4">দ্রুত অ্যাক্সেস</h3>
                <div className="space-y-3">
                  <Link to="/question-bank">
                    <Button variant="secondary" className="w-full justify-start gap-2">
                      <BookOpen className="w-4 h-4" />
                      প্রশ্নব্যাংক ব্রাউজ করো
                    </Button>
                  </Link>
                  <Link to="/live-exams">
                    <Button variant="secondary" className="w-full justify-start gap-2">
                      <Play className="w-4 h-4" />
                      লাইভ এক্সাম দেখো
                    </Button>
                  </Link>
                  <Link to="/leaderboard">
                    <Button variant="secondary" className="w-full justify-start gap-2">
                      <Trophy className="w-4 h-4" />
                      লিডারবোর্ড চেক করো
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
