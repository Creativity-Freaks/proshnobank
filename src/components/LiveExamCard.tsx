import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Users, Calendar, ArrowRight } from "lucide-react";

interface LiveExam {
  id: number;
  title: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  participants: number;
  isFree: boolean;
  startTime: Date;
}

const liveExams: LiveExam[] = [
  {
    id: 1,
    title: "মেডিকেল মডেল টেস্ট - ২০২৬",
    subject: "পদার্থবিজ্ঞান + রসায়ন + জীববিজ্ঞান",
    date: "আজ",
    time: "রাত ৯:০০",
    duration: "২ ঘণ্টা",
    participants: 1250,
    isFree: false,
    startTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
  },
  {
    id: 2,
    title: "HSC বোর্ড প্রিপারেশন",
    subject: "উচ্চতর গণিত ১ম পত্র",
    date: "আগামীকাল",
    time: "বিকাল ৪:০০",
    duration: "১.৫ ঘণ্টা",
    participants: 890,
    isFree: true,
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    title: "BCS প্রিলিমিনারি মডেল",
    subject: "বাংলা + ইংরেজি + সাধারণ জ্ঞান",
    date: "শনিবার",
    time: "সকাল ১০:০০",
    duration: "২.৫ ঘণ্টা",
    participants: 2100,
    isFree: false,
    startTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
  },
];

const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-2">
      {Object.entries(timeLeft).map(([key, value]) => (
        <div key={key} className="bg-primary/10 rounded-lg px-3 py-2 text-center min-w-[50px]">
          <div className="text-xl font-bold text-primary">{String(value).padStart(2, "0")}</div>
          <div className="text-xs text-muted-foreground font-bengali">
            {key === "hours" ? "ঘণ্টা" : key === "minutes" ? "মিনিট" : "সেকেন্ড"}
          </div>
        </div>
      ))}
    </div>
  );
};

const LiveExamCard = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-bengali text-foreground mb-2">
              আপকামিং <span className="text-primary">লাইভ এক্সাম</span>
            </h2>
            <p className="text-muted-foreground font-bengali">
              রিয়েল এক্সাম হলের মতো পরিবেশে পরীক্ষা দাও
            </p>
          </div>
          <Button variant="outline" className="mt-4 md:mt-0 gap-2">
            সব এক্সাম দেখো
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveExams.map((exam) => (
            <div
              key={exam.id}
              className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bengali ${
                  exam.isFree 
                    ? "bg-secondary/20 text-secondary" 
                    : "bg-accent/20 text-accent"
                }`}>
                  {exam.isFree ? "ফ্রি" : "প্রিমিয়াম"}
                </span>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="font-bengali">{exam.participants}+</span>
                </div>
              </div>

              <h3 className="text-lg font-bold font-bengali text-card-foreground mb-2">
                {exam.title}
              </h3>
              <p className="text-sm text-muted-foreground font-bengali mb-4">
                {exam.subject}
              </p>

              <div className="flex flex-wrap gap-3 mb-6 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="font-bengali">{exam.date}, {exam.time}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="font-bengali">{exam.duration}</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-muted-foreground font-bengali mb-2">শুরু হতে বাকি:</p>
                <CountdownTimer targetDate={exam.startTime} />
              </div>

              <Button variant="hero" className="w-full">
                এক্সামে যোগ দাও
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveExamCard;
