import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAnalyticsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">বিশ্লেষণ</h2>
      <Card>
        <CardHeader>
          <CardTitle>পরিসংখ্যান এবং বিশ্লেষণ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">বিশ্লেষণের জন্য এখানে কন্টেন্ট আসবে</p>
        </CardContent>
      </Card>
    </div>
  );
}
