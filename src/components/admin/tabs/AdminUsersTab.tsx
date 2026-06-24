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
      let query = supabase.from("user_profiles").select("*");
      
      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }
      
      const { data } = await query.limit(100);
      setUsers(data || []);
    } catch (error) {
      toast({ title: "Error", description: "ব্যবহারকারী লোড করতে ব্যর্থ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি এই ব্যবহারকারী মুছে দিতে চান?")) {
      try {
        await supabase.from("user_profiles").delete().eq("id", id);
        toast({ title: "সাফল্য", description: "ব্যবহারকারী সফলভাবে মুছে দেওয়া হয়েছে" });
        fetchUsers();
      } catch (error) {
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
                    <p className="font-medium text-sm">{user.full_name || "অনামিক"}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {user.email}
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
