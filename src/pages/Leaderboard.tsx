import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, TrendingUp, Users, Target, Award } from "lucide-react";

const timeFilters = [
  { id: "daily", name: "আজকে" },
  { id: "weekly", name: "এই সপ্তাহ" },
  { id: "monthly", name: "এই মাস" },
  { id: "all", name: "সর্বকালীন" },
];

const categoryFilters = [
  { id: "all", name: "সকল" },
  { id: "ssc", name: "SSC" },
  { id: "hsc", name: "HSC" },
  { id: "medical", name: "মেডিকেল" },
  { id: "engineering", name: "ইঞ্জিনিয়ারিং" },
  { id: "bcs", name: "BCS" },
];

const leaderboardData = [
  { rank: 1, name: "মোহাম্মদ রাফি", score: 9850, exams: 156, accuracy: 94, avatar: "🧑‍🎓" },
  { rank: 2, name: "ফাতেমা আক্তার", score: 9720, exams: 142, accuracy: 92, avatar: "👩‍🎓" },
  { rank: 3, name: "আব্দুল্লাহ আল মামুন", score: 9650, exams: 138, accuracy: 91, avatar: "🧑‍🎓" },
  { rank: 4, name: "নুসরাত জাহান", score: 9480, exams: 134, accuracy: 89, avatar: "👩‍🎓" },
  { rank: 5, name: "তানভীর হাসান", score: 9320, exams: 130, accuracy: 88, avatar: "🧑‍🎓" },
  { rank: 6, name: "সাদিয়া ইসলাম", score: 9180, exams: 128, accuracy: 87, avatar: "👩‍🎓" },
  { rank: 7, name: "রাকিব হাসান", score: 9050, exams: 125, accuracy: 86, avatar: "🧑‍🎓" },
  { rank: 8, name: "মারিয়া আক্তার", score: 8920, exams: 122, accuracy: 85, avatar: "👩‍🎓" },
  { rank: 9, name: "সাইফুল ইসলাম", score: 8800, exams: 120, accuracy: 84, avatar: "🧑‍🎓" },
  { rank: 10, name: "জান্নাতুল ফেরদৌস", score: 8680, exams: 118, accuracy: 83, avatar: "👩‍🎓" },
];

const Leaderboard = () => {
  const [timeFilter, setTimeFilter] = useState("weekly");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
            <Crown className="w-6 h-6 text-white" />
          </div>
        );
      case 2:
        return (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-lg">
            <Medal className="w-6 h-6 text-white" />
          </div>
        );
      case 3:
        return (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-lg">
            <Medal className="w-6 h-6 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <span className="text-lg font-bold text-muted-foreground">{rank}</span>
          </div>
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
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Trophy className="w-5 h-5" />
              <span className="font-medium">লিডারবোর্ড</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              সেরা <span className="text-primary">পারফর্মারদের</span> তালিকা
            </h1>
            <p className="text-muted-foreground">
              প্রতিযোগিতায় এগিয়ে থাকো, তোমার নাম দেখো টপ লিস্টে
            </p>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">১২,৫০০+</p>
              <p className="text-sm text-muted-foreground">মোট অংশগ্রহণকারী</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">২,৫০,০০০+</p>
              <p className="text-sm text-muted-foreground">মোট পরীক্ষা দেওয়া</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">৮৫%</p>
              <p className="text-sm text-muted-foreground">গড় সাফল্যের হার</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <Award className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">৫০০+</p>
              <p className="text-sm text-muted-foreground">পুরস্কার বিতরণ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <div className="flex flex-wrap gap-2 justify-center">
              {timeFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={timeFilter === filter.id ? "hero" : "outline"}
                  size="sm"
                  onClick={() => setTimeFilter(filter.id)}
                >
                  {filter.name}
                </Button>
              ))}
            </div>
            <div className="w-px h-6 bg-border hidden md:block" />
            <div className="flex flex-wrap gap-2 justify-center">
              {categoryFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={categoryFilter === filter.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setCategoryFilter(filter.id)}
                >
                  {filter.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Table */}
      <section className="py-8 pb-16">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {/* Top 3 Highlight */}
            <div className="grid md:grid-cols-3 gap-4 p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              {leaderboardData.slice(0, 3).map((user, index) => (
                <div
                  key={user.rank}
                  className={`bg-card rounded-xl p-6 text-center border ${
                    index === 0 ? "border-yellow-400 shadow-lg md:order-2 md:scale-105" : "border-border"
                  }`}
                >
                  <div className="flex justify-center mb-3">{getRankBadge(user.rank)}</div>
                  <div className="text-4xl mb-2">{user.avatar}</div>
                  <h3 className="font-bold text-foreground mb-1">{user.name}</h3>
                  <p className="text-2xl font-bold text-primary mb-2">{user.score.toLocaleString()}</p>
                  <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                    <span>{user.exams} এক্সাম</span>
                    <span>{user.accuracy}% নির্ভুল</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Rest of the list */}
            <div className="divide-y divide-border">
              {leaderboardData.slice(3).map((user) => (
                <div
                  key={user.rank}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                >
                  {getRankBadge(user.rank)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{user.avatar}</span>
                      <div>
                        <h4 className="font-medium text-foreground">{user.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {user.exams} এক্সাম সম্পন্ন
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{user.score.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{user.accuracy}% নির্ভুল</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Leaderboard;
