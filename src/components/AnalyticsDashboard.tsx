import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { examsApi } from "@/lib/api";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Brain,
  Flame,
  Award,
  Calendar,
  Download,
  Filter,
  Loader2,
} from "lucide-react";

interface SubjectPerformance {
  subject: string;
  total_attempts: number;
  accuracy: number;
  rank?: number;
}

interface PerformanceTrend {
  date: string;
  score: number;
  accuracy: number;
}

interface StrengthWeakness {
  topic: string;
  accuracy: number;
  attempts: number;
  type: "strength" | "weakness";
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
  const [performanceTrend, setPerformanceTrend] = useState<PerformanceTrend[]>([]);
  const [strengthWeakness, setStrengthWeakness] = useState<StrengthWeakness[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // Load overall stats
      const statsRes = await examsApi.stats().catch(() => ({
        data: {
          total_exams: 0,
          avg_score: 0,
          accuracy: 0,
          total_study_time_hours: 0,
          subject_stats: [],
        },
      }));
      setStats(statsRes.data);
      setSubjectPerformance(statsRes.data.subject_stats || []);

      // Load attempts for trend
      const attemptsRes = await examsApi
        .attempts({ limit: 100 })
        .catch(() => ({ data: [] }));

      if (attemptsRes.data && Array.isArray(attemptsRes.data)) {
        const trend = (attemptsRes.data as any[])
          .slice(0, 30)
          .map((attempt) => ({
            date: new Date(attempt.created_at).toLocaleDateString(),
            score: attempt.score,
            accuracy: (attempt.correct_answers / attempt.total_questions) * 100,
          }));
        setPerformanceTrend(trend);
      }
    } catch (error) {
      console.error("[v0] Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-green-600";
    if (accuracy >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getAccuracyBg = (accuracy: number) => {
    if (accuracy >= 80) return "bg-green-50 border-green-200";
    if (accuracy >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                বিস্তারিত পারফরম্যান্স বিশ্লেষণ
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant={timeRange === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("week")}
              >
                ১ সপ্তাহ
              </Button>
              <Button
                variant={timeRange === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("month")}
              >
                ১ মাস
              </Button>
              <Button
                variant={timeRange === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("all")}
              >
                সবসময়
              </Button>
              <Button variant="outline" size="sm" className="ml-2">
                <Download className="w-4 h-4 mr-2" />
                ডাউনলোড
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">মোট পরীক্ষা</p>
                <h3 className="text-3xl font-bold">{stats?.total_exams || 0}</h3>
              </div>
              <Award className="w-12 h-12 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">গড় নম্বর</p>
                <h3 className="text-3xl font-bold">
                  {stats?.avg_score?.toFixed(1) || 0}
                </h3>
              </div>
              <TrendingUp className="w-12 h-12 opacity-20" />
            </div>
          </Card>

          <Card
            className={`p-6 bg-gradient-to-br text-white ${
              (stats?.accuracy || 0) >= 70
                ? "from-green-500 to-green-600"
                : "from-orange-500 to-orange-600"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="opacity-90 text-sm mb-1">নির্ভুলতা</p>
                <h3 className="text-3xl font-bold">
                  {stats?.accuracy?.toFixed(1) || 0}%
                </h3>
              </div>
              <Target className="w-12 h-12 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">অধ্যয়ন সময়</p>
                <h3 className="text-3xl font-bold">
                  {stats?.total_study_time_hours || 0}h
                </h3>
              </div>
              <Flame className="w-12 h-12 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Performance Trend Chart */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            পারফরম্যান্স ট্রেন্ড
          </h2>
          {performanceTrend.length > 0 ? (
            <div className="h-64 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="mb-4">চার্ট কম্পোনেন্ট (Recharts/Chart.js সহ)</p>
                <p className="text-sm">
                  শেষ {performanceTrend.length} পরীক্ষার নম্বর এবং নির্ভুলতা
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              ট্রেন্ড ডেটা পাওয়া যায়নি
            </div>
          )}
        </Card>

        {/* Subject-wise Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Subject Performance */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              বিষয়ভিত্তিক পারফরম্যান্স
            </h2>
            <div className="space-y-4">
              {subjectPerformance.length > 0 ? (
                subjectPerformance.map((subject, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-l-4 border-blue-500 ${getAccuracyBg(
                      subject.accuracy
                    )}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {subject.subject}
                      </h3>
                      <Badge
                        className={`${getAccuracyColor(subject.accuracy)} bg-opacity-20`}
                      >
                        {subject.accuracy.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{subject.total_attempts} পরীক্ষা</span>
                      {subject.rank && (
                        <span className="text-orange-600">
                          র‍্যাঙ্ক #{subject.rank}
                        </span>
                      )}
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${
                          subject.accuracy >= 80
                            ? "from-green-400 to-green-600"
                            : subject.accuracy >= 60
                            ? "from-yellow-400 to-yellow-600"
                            : "from-red-400 to-red-600"
                        }`}
                        style={{ width: `${subject.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  এখনো কোনো পরীক্ষা নেওয়া হয়নি
                </p>
              )}
            </div>
          </Card>

          {/* Strength & Weakness */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              শক্তিশালী ও দুর্বল বিষয়
            </h2>
            <div className="space-y-4">
              {/* Strengths */}
              <div>
                <h3 className="font-semibold text-green-700 mb-3">
                  শক্তিশালী বিষয়
                </h3>
                <div className="space-y-2">
                  {subjectPerformance
                    ?.filter((s) => s.accuracy >= 70)
                    .slice(0, 3)
                    .map((subject, idx) => (
                      <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900 font-medium">
                            {subject.subject}
                          </span>
                          <Badge variant="outline" className="bg-green-50">
                            {subject.accuracy.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div>
                <h3 className="font-semibold text-orange-700 mb-3">
                  দুর্বল বিষয়
                </h3>
                <div className="space-y-2">
                  {subjectPerformance
                    ?.filter((s) => s.accuracy < 60)
                    .slice(0, 3)
                    .map((subject, idx) => (
                      <div key={idx} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900 font-medium">
                            {subject.subject}
                          </span>
                          <Badge variant="outline" className="bg-orange-50">
                            {subject.accuracy.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="p-6 bg-blue-50 border border-blue-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            উন্নতির পরামর্শ
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">1.</span>
              <span>
                যেসব বিষয়ে নির্ভুলতা ৬০% এর নিচে, সেগুলিতে আরও অনুশীলন করুন
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">2.</span>
              <span>
                প্রতিদিন কমপক্ষে ১ ঘন্টা নিয়মিত অনুশীলন করে আপনার দক্ষতা বৃদ্ধি করুন
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">3.</span>
              <span>
                কঠিন প্রশ্নগুলির জন্য শিক্ষকদের সাথে আলোচনা করুন এবং সন্ধেহ সমাধান করুন
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
