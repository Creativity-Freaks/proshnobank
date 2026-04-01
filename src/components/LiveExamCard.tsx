import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { examsApi } from "@/lib/api";
import { mapLiveExamRow, getTimeRemainingLabel } from "@/lib/live-exam";
import { Clock, Users, Calendar, ArrowRight, Loader2 } from "lucide-react";

const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const label = getTimeRemainingLabel(targetDate);

  return (
    <div className="bg-primary/10 rounded-lg px-3 py-2 text-center">
      <div className="text-lg font-bold text-primary">{label}</div>
      <div className="text-xs text-muted-foreground font-bengali">শুরু হতে বাকি</div>
    </div>
  );
};

const LiveExamCard = () => {
  const { data: liveExams = [], isLoading } = useQuery({
    queryKey: ["home-live-exams"],
    queryFn: async () => {
      const res = await examsApi.live();
      const rows = Array.isArray(res.data) ? res.data : [];
      return rows
        .map(mapLiveExamRow)
        .filter((x): x is NonNullable<typeof x> => Boolean(x))
        .slice(0, 3);
    },
  });

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-bengali text-foreground mb-2">
              আপকামিং <span className="text-primary">লাইভ এক্সাম</span>
            </h2>
            <p className="text-muted-foreground font-bengali">রিয়েল এক্সাম হলের মতো পরিবেশে পরীক্ষা দাও</p>
          </div>
          <Link to="/live-exams">
            <Button variant="outline" className="mt-4 md:mt-0 gap-2">
              সব এক্সাম দেখো
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : liveExams.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">এই মুহূর্তে কোনো আপকামিং লাইভ এক্সাম নেই</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveExams.map((exam) => (
              <div
                key={exam.id}
                className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bengali ${
                      exam.status === "live" ? "bg-red-100 text-red-700" : "bg-secondary/20 text-secondary"
                    }`}
                  >
                    {exam.status === "live" ? "লাইভ" : "আসন্ন"}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="font-bengali">{exam.participants}+</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold font-bengali text-card-foreground mb-2">{exam.title}</h3>
                <p className="text-sm text-muted-foreground font-bengali mb-4">{exam.category}</p>

                <div className="flex flex-wrap gap-3 mb-6 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="font-bengali">{exam.startTime.toLocaleString("bn-BD")}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="font-bengali">{exam.durationLabel}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <CountdownTimer targetDate={exam.startTime} />
                </div>

                <Link to={`/exam/${exam.id}`}>
                  <Button variant="hero" className="w-full">
                    এক্সামে যোগ দাও
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LiveExamCard;
