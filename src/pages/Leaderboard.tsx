import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { leaderboardApi } from "@/lib/api";
import { Trophy, Medal, Crown, TrendingUp, Users, Target, Award, Loader2 } from "lucide-react";

const timeFilters = [
  { id: "weekly", name: "এই সপ্তাহ" },
  { id: "monthly", name: "এই মাস" },
  { id: "all", name: "সর্বকালীন" },
];

interface RankingEntry {
  rank: number;
  user_id: string;
  name: string;
  score: number;
  exams: number;
  accuracy: number;
}

interface GlobalStats {
  total_participants: number;
  total_exams: number;
  avg_accuracy: number;
}

const Leaderboard = () => {
  const [timeFilter, setTimeFilter] = useState("all");
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [rankRes, statsRes] = await Promise.all([
        leaderboardApi.rankings({ period: timeFilter, limit: 20 }),
        leaderboardApi.stats(),
      ]);
      setRankings(rankRes.data);
      setGlobalStats(statsRes.data);
    } catch (e) {
      console.error("Leaderboard error:", e);
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg"><Crown className="w-6 h-6 text-white" /></div>;
      case 2: return <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-lg"><Medal className="w-6 h-6 text-white" /></div>;
      case 3: return <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-lg"><Medal className="w-6 h-6 text-white" /></div>;
      default: return <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center"><span className="text-lg font-bold text-muted-foreground">{rank}</span></div>;
    }
  };

  return (
    <div className="min-h-screen bg-background font-bengali">
      <Navbar />

      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Trophy className="w-5 h-5" />
            <span className="font-medium">লিডারবোর্ড</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            সেরা <span className="text-primary">পারফর্মারদের</span> তালিকা
          </h1>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{globalStats?.total_participants || 0}</p>
              <p className="text-sm text-muted-foreground">মোট অংশগ্রহণকারী</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{globalStats?.total_exams || 0}</p>
              <p className="text-sm text-muted-foreground">মোট পরীক্ষা</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{Math.round(globalStats?.avg_accuracy || 0)}%</p>
              <p className="text-sm text-muted-foreground">গড় নির্ভুলতা</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4">
        <div className="container mx-auto px-4 flex flex-wrap gap-2 justify-center">
          {timeFilters.map((f) => (
            <Button key={f.id} variant={timeFilter === f.id ? "hero" : "outline"} size="sm" onClick={() => setTimeFilter(f.id)}>
              {f.name}
            </Button>
          ))}
        </div>
      </section>

      {/* Rankings */}
      <section className="py-8 pb-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl font-bold text-foreground">এখনো কোনো ডেটা নেই</p>
              <p>এক্সাম দিলে এখানে র‍্যাংকিং দেখা যাবে</p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Top 3 */}
              {rankings.length >= 3 && (
                <div className="grid md:grid-cols-3 gap-4 p-6 bg-gradient-to-br from-primary/5 to-accent/5">
                  {rankings.slice(0, 3).map((u, i) => (
                    <div key={u.user_id} className={`bg-card rounded-xl p-6 text-center border ${i === 0 ? "border-yellow-400 shadow-lg md:order-2 md:scale-105" : "border-border"}`}>
                      <div className="flex justify-center mb-3">{getRankBadge(u.rank)}</div>
                      <h3 className="font-bold text-foreground mb-1">{u.name}</h3>
                      <p className="text-2xl font-bold text-primary mb-2">{Math.round(u.score)}</p>
                      <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                        <span>{u.exams} এক্সাম</span>
                        <span>{Math.round(u.accuracy)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Rest */}
              <div className="divide-y divide-border">
                {rankings.slice(3).map((u) => (
                  <div key={u.user_id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                    {getRankBadge(u.rank)}
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{u.name}</h4>
                      <p className="text-sm text-muted-foreground">{u.exams} এক্সাম</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{Math.round(u.score)}</p>
                      <p className="text-sm text-muted-foreground">{Math.round(u.accuracy)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Leaderboard;
