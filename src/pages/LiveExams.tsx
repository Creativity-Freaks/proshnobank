import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { examsApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { usePageMeta } from "@/hooks/usePageMeta";
import { mapLiveExamRow, getTimeRemainingLabel } from "@/lib/live-exam";
import {
  Clock,
  Users,
  Calendar,
  PlayCircle,
  Bell,
  Trophy,
  Zap,
  Loader2,
} from "lucide-react";

const LiveExams = () => {
  const [, setCurrentTime] = useState(new Date());

  usePageMeta({
    title: "লাইভ এক্সাম",
    description: "চলমান ও আসন্ন লাইভ পরীক্ষায় অংশ নাও এবং রিয়েল-টাইম র‍্যাংকিং দেখো।",
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const {
    data: liveExams = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["live-exams"],
    queryFn: async () => {
      const res = await examsApi.live();
      const rows = Array.isArray(res.data) ? res.data : [];
      return rows.map(mapLiveExamRow).filter((x): x is NonNullable<typeof x> => Boolean(x));
    },
  });

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

      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-xl font-bold text-foreground">লাইভ এক্সাম লোড করা যায়নি</p>
              <p>অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন</p>
            </div>
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
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      {getStatusBadge(exam.status)}
                      <Badge variant="outline">{exam.category}</Badge>
                    </div>

                    <h3 className="text-lg font-bold text-card-foreground mb-2">{exam.title}</h3>

                    <div className="bg-muted rounded-xl p-4 text-center mb-4">
                      <p className="text-sm text-muted-foreground mb-1">
                        {exam.status === "live" ? "চলমান" : "শুরু হবে"}
                      </p>
                      <p className={`text-2xl font-bold ${exam.status === "live" ? "text-red-500" : "text-primary"}`}>
                        {getTimeRemainingLabel(exam.startTime)}
                      </p>
                    </div>

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

                  <div className="px-6 pb-6">
                    {exam.status === "live" || exam.status === "starting-soon" ? (
                      <Link to={`/exam/${exam.id}/take`} state={{ config: exam.config }}>
                        <Button
                          variant="hero"
                          className={`w-full ${exam.status === "live" ? "bg-red-500 hover:bg-red-600" : ""}`}
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          {exam.status === "live" ? "এখনই জয়েন করো" : "প্রস্তুত হও"}
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

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">লাইভ এক্সাম কিভাবে কাজ করে?</h2>
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
