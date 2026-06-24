import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminDashboardApi } from "@/lib/admin/admin-dashboard-api";
import { Loader2 } from "lucide-react";

export default function AdminDashboardTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminDashboardApi.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">স্বাগতম, প্রশাসক</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">মোট ক্যাটেগরি</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats?.categories || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">সিস্টেমে রয়েছে</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">মোট বিষয়</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats?.subjects || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">সব ক্যাটেগরিতে</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">মোট প্রশ্ন</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats?.questions || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">সব ধরনের</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">সক্রিয় ব্যবহারকারী</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">এই মাসে</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>সম্প্রতি যুক্ত করা হয়েছে</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">সর্বশেষ আপডেট এখানে দেখা যাবে</p>
        </CardContent>
      </Card>
    </div>
  );
}
