import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminUsersTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">ব্যবহারকারী ব্যবস্থাপনা</h2>
      <Card>
        <CardHeader>
          <CardTitle>ব্যবহারকারী পরিচালনা</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">ব্যবহারকারী ব্যবস্থাপনার জন্য এখানে কন্টেন্ট আসবে</p>
        </CardContent>
      </Card>
    </div>
  );
}
