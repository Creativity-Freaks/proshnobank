import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLiveEventsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">লাইভ ইভেন্ট ব্যবস্থাপনা</h2>
      <Card>
        <CardHeader>
          <CardTitle>লাইভ ইভেন্ট পরিচালনা</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">লাইভ ইভেন্ট ব্যবস্থাপনার জন্য এখানে কন্টেন্ট আসবে</p>
        </CardContent>
      </Card>
    </div>
  );
}
