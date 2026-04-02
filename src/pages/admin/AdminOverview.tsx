import { useQuery } from "@tanstack/react-query";
import { adminApi, type AdminStats } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BookOpen, FileText, Users, Radio, BarChart3, Target, TrendingUp } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, description }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
);

export default function AdminOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.stats(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats: AdminStats = data?.data || {
    total_questions: 0, total_attempts: 0, total_templates: 0,
    total_users: 0, total_live_exams: 0, avg_accuracy: 0,
    recent_attempts: 0, role_breakdown: {}, subject_breakdown: {},
  };

  const roleEntries = Object.entries(stats.role_breakdown);
  const subjectEntries = Object.entries(stats.subject_breakdown).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ড্যাশবোর্ড ওভারভিউ</h1>
        <p className="text-muted-foreground">সম্পূর্ণ প্ল্যাটফর্মের সারসংক্ষেপ</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="মোট প্রশ্ন" value={stats.total_questions} icon={BookOpen} />
        <StatCard title="মোট পরীক্ষা" value={stats.total_attempts} icon={FileText} description={`গত ৭ দিনে: ${stats.recent_attempts}`} />
        <StatCard title="মোট ইউজার" value={stats.total_users} icon={Users} />
        <StatCard title="গড় নির্ভুলতা" value={`${stats.avg_accuracy}%`} icon={Target} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="পরীক্ষা টেমপ্লেট" value={stats.total_templates} icon={BarChart3} />
        <StatCard title="লাইভ পরীক্ষা" value={stats.total_live_exams} icon={Radio} />
        <StatCard title="সাম্প্রতিক কার্যকলাপ" value={stats.recent_attempts} icon={TrendingUp} description="গত ৭ দিন" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Role breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">রোল বিভাজন</CardTitle>
          </CardHeader>
          <CardContent>
            {roleEntries.length === 0 ? (
              <p className="text-muted-foreground text-sm">কোনো ডেটা নেই</p>
            ) : (
              <div className="space-y-3">
                {roleEntries.map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="capitalize text-sm">{role}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subject breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">বিষয়ভিত্তিক পরীক্ষা</CardTitle>
          </CardHeader>
          <CardContent>
            {subjectEntries.length === 0 ? (
              <p className="text-muted-foreground text-sm">কোনো ডেটা নেই</p>
            ) : (
              <div className="space-y-3">
                {subjectEntries.slice(0, 8).map(([subject, count]) => (
                  <div key={subject} className="flex items-center justify-between">
                    <span className="text-sm">{subject}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
