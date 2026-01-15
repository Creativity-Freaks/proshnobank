import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Users, 
  Calendar, 
  PlayCircle, 
  Bell, 
  ChevronRight,
  Trophy,
  Zap
} from "lucide-react";

const liveExams = [
  {
    id: 1,
    title: "BCS প্রিলি মডেল টেস্ট - ০১",
    category: "BCS",
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    duration: "২ ঘণ্টা ৩০ মিনিট",
    questions: 200,
    participants: 1250,
    prize: "১০,০০০ টাকা",
    status: "upcoming",
  },
  {
    id: 2,
    title: "মেডিকেল ভর্তি - জীববিজ্ঞান",
    category: "মেডিকেল",
    startTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    duration: "১ ঘণ্টা",
    questions: 100,
    participants: 850,
    prize: "৫,০০০ টাকা",
    status: "starting-soon",
  },
  {
    id: 3,
    title: "HSC পদার্থবিজ্ঞান - অধ্যায় ১-৫",
    category: "HSC",
    startTime: new Date(Date.now() - 30 * 60 * 1000), // Started 30 minutes ago
    duration: "১ ঘণ্টা ৩০ মিনিট",
    questions: 80,
    participants: 620,
    prize: null,
    status: "live",
  },
  {
    id: 4,
    title: "SSC গণিত - সম্পূর্ণ সিলেবাস",
    category: "SSC",
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    duration: "১ ঘণ্টা ১৫ মিনিট",
    questions: 60,
    participants: 0,
    prize: null,
    status: "upcoming",
  },
  {
    id: 5,
    title: "ইঞ্জিনিয়ারিং - ফিজিক্স + ম্যাথ",
    category: "ইঞ্জিনিয়ারিং",
    startTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
    duration: "২ ঘণ্টা",
    questions: 120,
    participants: 380,
    prize: "৭,৫০০ টাকা",
    status: "upcoming",
  },
];

const LiveExams = () => {
  const [, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
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
                      <span>{exam.duration}</span>
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
                    <Link to={`/exam/${exam.id}/take`}>
                      <Button variant="hero" className="w-full bg-red-500 hover:bg-red-600">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        এখনই জয়েন করো
                      </Button>
                    </Link>
                  ) : exam.status === "starting-soon" ? (
                    <Link to={`/exam/${exam.id}/take`}>
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
