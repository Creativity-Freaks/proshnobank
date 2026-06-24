import { useEffect, useState } from "react";
import { Trash2, Loader2, Search, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";

export default function AdminUsersTab() {
  const { toast } = useToast();
  const { refreshTrigger } = useAdmin();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Get distinct users from exam_batch_enrollments
      const { data: enrollments, error: enrollError } = await supabase
        .from("exam_batch_enrollments")
        .select("user_id, created_at, status")
        .order("created_at", { ascending: false })
        .limit(100);

      if (enrollError) throw enrollError;

      if (!enrollments || enrollments.length === 0) {
        setUsers([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(enrollments.map(e => e.user_id))];

      // Fetch user details from auth.users (this requires admin access via service role)
      // For now, we'll show enrollment data with user_id
      const userData = enrollments.map(enrollment => ({
        id: enrollment.user_id,
        user_id: enrollment.user_id,
        created_at: enrollment.created_at,
        status: enrollment.status,
        enrollments_count: enrollments.filter(e => e.user_id === enrollment.user_id).length
      }));

      // Remove duplicates
      const uniqueUsers = Array.from(
        new Map(userData.map(user => [user.id, user])).values()
      );

      setUsers(uniqueUsers);
    } catch (error) {
      console.error("[v0] Failed to fetch users:", error);
      toast({ title: "Error", description: "ব্যবহারকারী লোড করতে ব্যর্থ", variant: "destructive" });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm("আপনি কি এই ব্যবহারকারীর সমস্ত নথিপত্র মুছে দিতে চান?")) {
      try {
        // Delete all enrollments for this user
        const { error } = await supabase
          .from("exam_batch_enrollments")
          .delete()
          .eq("user_id", userId);
        
        if (error) throw error;
        
        toast({ title: "সাফল্য", description: "ব্যবহারকারীর নথিপত্র সফলভাবে মুছে দেওয়া হয়েছে" });
        fetchUsers();
      } catch (error) {
        console.error("[v0] Failed to delete user:", error);
        toast({ title: "Error", description: "ব্যবহারকারী মুছতে ব্যর্থ", variant: "destructive" });
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">ব্যবহারকারী ব্যবস্থাপনা</h2>
        <p className="text-muted-foreground mt-1">মোট ব্যবহারকারী: {users.length}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">অনুসন্ধান</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>নাম বা ইমেইল খুঁজুন</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="নাম বা ইমেইল..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">ব্যবহারকারী তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground">কোন ব্যবহারকারী পাওয়া যায়নি</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex-1">
                    <p className="font-medium text-sm font-mono">{user.user_id.substring(0, 8)}...</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>পরীক্ষা: {user.enrollments_count}</span>
                      <span className={`px-2 py-1 rounded ${user.status === 'enrolled' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.status === 'enrolled' ? 'সক্রিয়' : 'বাতিল'}
                      </span>
                      <span className="text-xs">
                        {new Date(user.created_at).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
