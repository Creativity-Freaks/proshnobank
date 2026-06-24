import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminTemplatesTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">টেমপ্লেট ব্যবস্থাপনা</h2>
      <Card>
        <CardHeader>
          <CardTitle>টেমপ্লেট পরিচালনা</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">টেমপ্লেট ব্যবস্থাপনার জন্য এখানে কন্টেন্ট আসবে</p>
        </CardContent>
      </Card>
    </div>
  );
}
