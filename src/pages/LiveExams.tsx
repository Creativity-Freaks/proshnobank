import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { examsApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Users, 
  Calendar, 
  PlayCircle, 
  Bell, 
  ChevronRight,
  Trophy,
  Zap,
  Loader2,
} from "lucide-react";

type LiveStatus = "upcoming" | "starting-soon" | "live";

type ExamConfig = {
  category: string;
  subjects: string[];
  topics: Record<string, string[]>;
  questionCount: number;
  duration: number;
  marksPerQuestion: number;
  negativeMarking: number;
  difficulty: string;
};

type LiveExamItem = {
  id: string;
  title: string;
  category: string;
  startTime: Date;
  durationLabel: string;
  questions: number;
  participants: number;
  prize: string | null;
  status: LiveStatus;
  config: ExamConfig;
};

function formatMinutesBn(minutes: number) {
  const total = Math.max(0, Math.trunc(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h > 0 && m > 0) return `${h.toLocaleString("bn-BD")} ঘণ্টা ${m.toLocaleString("bn-BD")} মিনিট`;
  if (h > 0) return `${h.toLocaleString("bn-BD")} ঘণ্টা`;
  return `${m.toLocaleString("bn-BD")} মিনিট`;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string");
}

function toTopicsRecord(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const v = value as Record<string, unknown>;
  const out: Record<string, string[]> = {};
  Object.entries(v).forEach(([k, val]) => {
    out[k] = toStringArray(val);
  });
  return out;
}

const LiveExams = () => {
  const [, setCurrentTime] = useState(new Date());
  const [liveExams, setLiveExams] = useState<LiveExamItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await examsApi.live();
        const rows = Array.isArray(res.data) ? (res.data as unknown[]) : [];
        const mapped = rows
          .map((r): LiveExamItem | null => {
            if (!r || typeof r !== "object") return null;
            const v = r as Record<string, unknown>;
            const id = typeof v.id === "string" ? v.id : null;
            const title = typeof v.title === "string" ? v.title : null;
            const category = typeof v.category === "string" ? v.category : null;
            const start = typeof v.start_time === "string" ? new Date(v.start_time) : null;
            const status = (v.status === "upcoming" || v.status === "starting-soon" || v.status === "live") ? (v.status as LiveStatus) : "upcoming";
            const participants = typeof v.participants === "number" ? v.participants : 0;
            const prize = typeof v.prize === "string" ? v.prize : null;
            const questionCount = typeof v.question_count === "number" ? v.question_count : 10;
            const durationMinutes = typeof v.duration_minutes === "number" ? v.duration_minutes : 30;
            const marksPerQuestion = typeof v.marks_per_question === "number" ? v.marks_per_question : 1;
            const negativeMarks = typeof v.negative_marks === "number" ? v.negative_marks : 0;
            const difficulty = typeof v.difficulty === "string" ? v.difficulty : "all";
            const subjects = toStringArray(v.subjects);
            const topics = toTopicsRecord(v.topics);

            if (!id || !title || !category || !start || Number.isNaN(start.getTime())) return null;

            return {
              id,
              title,
              category,
              startTime: start,
              durationLabel: formatMinutesBn(durationMinutes),
              questions: questionCount,
              participants,
              prize,
              status,
              config: {
                category,
                subjects,
                topics,
                questionCount,
                duration: durationMinutes,
                marksPerQuestion,
                negativeMarking: negativeMarks,
                difficulty,
              },
            };
          })
          .filter((x): x is LiveExamItem => Boolean(x));

        setLiveExams(mapped);
      } catch (e) {
        console.error("Failed to load live exams:", e);
        setLiveExams([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getTimeRemaining = (startTime: Date) => {
    const diff = startTime.getTime() - Date.now();
    if (diff <= 0) return "শুরু হয়েছে";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} দিন বাকি`;
    }
    
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return (
          <Badge className="bg-red-500 text-white animate-pulse">
            <Zap className="w-3 h-3 mr-1" />
            লাইভ
          </Badge>
        );
      case "starting-soon":
        return (
          <Badge className="bg-orange-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            শীঘ্রই শুরু
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Calendar className="w-3 h-3 mr-1" />
            আসন্ন
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background font-bengali">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-full mb-6">
              <Zap className="w-5 h-5" />
              <span className="font-medium">লাইভ এক্সাম</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              <span className="text-primary">লাইভ পরীক্ষায়</span> অংশ নাও
            </h1>
            <p className="text-muted-foreground">
              রিয়েল-টাইম প্রতিযোগিতায় অংশ নিয়ে নিজেকে যাচাই করো এবং পুরস্কার জিতে নাও
            </p>
          </div>
        </div>
      </section>

      {/* Live Exams Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
          ) : liveExams.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl font-bold text-foreground">এখনো কোনো লাইভ এক্সাম নেই</p>
              <p>পরবর্তীতে আবার চেষ্টা করুন</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveExams.map((exam) => (
              <div
                key={exam.id}
                className={`bg-card rounded-2xl border overflow-hidden hover:shadow-card transition-all duration-300 ${
                  exam.status === "live" ? "border-red-500 shadow-lg" : "border-border"
                }`}
              >
                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    {getStatusBadge(exam.status)}
                    <Badge variant="outline">{exam.category}</Badge>
                  </div>
                  
                  <h3 className="text-lg font-bold text-card-foreground mb-2">
                    {exam.title}
                  </h3>

                  {/* Countdown */}
                  <div className="bg-muted rounded-xl p-4 text-center mb-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      {exam.status === "live" ? "চলমান" : "শুরু হবে"}
                    </p>
                    <p className={`text-2xl font-bold ${exam.status === "live" ? "text-red-500" : "text-primary"}`}>
                      {getTimeRemaining(exam.startTime)}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{exam.durationLabel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{exam.participants}+ জন</span>
                    </div>
                  </div>

                  {exam.prize && (
                    <div className="mt-4 flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                      <Trophy className="w-5 h-5" />
                      <span className="font-medium">পুরস্কার: {exam.prize}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                  {exam.status === "live" ? (
                    <Link to={`/exam/${exam.id}/take`} state={{ config: exam.config }}>
                      <Button variant="hero" className="w-full bg-red-500 hover:bg-red-600">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        এখনই জয়েন করো
                      </Button>
                    </Link>
                  ) : exam.status === "starting-soon" ? (
                    <Link to={`/exam/${exam.id}/take`} state={{ config: exam.config }}>
                      <Button variant="hero" className="w-full">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        প্রস্তুত হও
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" className="w-full">
                      <Bell className="w-4 h-4 mr-2" />
                      রিমাইন্ডার সেট করো
                    </Button>
                  )}
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">
            লাইভ এক্সাম কিভাবে কাজ করে?
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "০১", title: "রেজিস্ট্রেশন", desc: "এক্সামে রেজিস্ট্রেশন করো" },
              { step: "০২", title: "অপেক্ষা", desc: "নির্ধারিত সময়ে এক্সাম শুরু হবে" },
              { step: "০৩", title: "অংশগ্রহণ", desc: "সবার সাথে একসাথে পরীক্ষা দাও" },
              { step: "০৪", title: "রেজাল্ট", desc: "তাৎক্ষণিক ফলাফল ও র‍্যাংকিং দেখো" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LiveExams;
