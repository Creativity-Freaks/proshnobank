import { useEffect, useState, useCallback } from "react";
import {
  Loader2, Search, UserPlus, RefreshCw, MoreHorizontal,
  Shield, ShieldOff, BookOpen, Mail, Phone, CheckCircle2,
  GraduationCap, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { adminApi } from "@/lib/admin/admin-api";
import { useAdmin } from "@/contexts/AdminContext";

type Teacher = {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
  last_sign_in: string | null;
  is_suspended: boolean;
  is_restricted: boolean;
  question_count: number;
};

export default function AdminTeachersTab() {
  const { toast } = useToast();
  const { refreshTrigger } = useAdmin();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Invite dialog
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", password: "" });

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all users with teacher role
      const res = await adminApi.users({ role: "teacher", search: searchQuery, limit: 100 });
      const teacherUsers = res.data || [];

      // Count questions created per teacher
      const { data: qData } = await supabase
        .from("question_bank")
        .select("created_by")
        .not("created_by", "is", null);

      const countMap: Record<string, number> = {};
      (qData || []).forEach((row: any) => {
        if (row.created_by) {
          countMap[row.created_by] = (countMap[row.created_by] || 0) + 1;
        }
      });

      const total = Object.values(countMap).reduce((s, v) => s + v, 0);
      setTotalQuestions(total);

      setTeachers(
        teacherUsers.map((u) => ({
          user_id: u.user_id,
          name: u.name || "(নাম নেই)",
          email: u.email || "",
          phone: u.phone || "",
          avatar_url: u.avatar_url || "",
          last_sign_in: u.last_sign_in,
          is_suspended: u.is_suspended || false,
          is_restricted: u.is_restricted || false,
          question_count: countMap[u.user_id] || 0,
        }))
      );
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e?.message || "শিক্ষক তালিকা লোড করা যায়নি", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, toast]);

  useEffect(() => {
    const timeout = setTimeout(fetchTeachers, 300);
    return () => clearTimeout(timeout);
  }, [fetchTeachers, refreshTrigger]);

  const handleRemoveTeacher = async (userId: string) => {
    if (!confirm("এই ব্যবহারকারীর শিক্ষক রোল সরিয়ে দিবেন?")) return;
    try {
      await adminApi.updateRole(userId, "teacher", true);
      toast({ title: "সাফল্য", description: "শিক্ষক রোল সরানো হয়েছে" });
      fetchTeachers();
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e?.message, variant: "destructive" });
    }
  };

  const handleSuspend = async (teacher: Teacher) => {
    try {
      await adminApi.updateSuspension(teacher.user_id, !teacher.is_suspended);
      toast({
        title: "সাফল্য",
        description: teacher.is_suspended ? "অ্যাকাউন্ট পুনরুদ্ধার হয়েছে" : "অ্যাকাউন্ট স্থগিত হয়েছে",
      });
      fetchTeachers();
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e?.message, variant: "destructive" });
    }
  };

  const handleInviteTeacher = async () => {
    if (!inviteForm.name || !inviteForm.email || !inviteForm.password) {
      toast({ title: "ত্রুটি", description: "সব তথ্য পূরণ করুন", variant: "destructive" });
      return;
    }
    if (inviteForm.password.length < 6) {
      toast({ title: "ত্রুটি", description: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে", variant: "destructive" });
      return;
    }
    try {
      setInviting(true);
      // Create user then assign teacher role
      const { data: { session } } = await supabase.auth.getSession();
      const SUPABASE_URL = "https://urtptlxotyyjfqynpbwx.supabase.co";
      const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVydHB0bHhvdHl5amZxeW5wYnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTA2NzQsImV4cCI6MjA4NDE2NjY3NH0.w-0GuzuZ3DU0BACTHoCXBPj6qBRxsA3JirwcVflR9BE";

      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin?action=create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({
          name: inviteForm.name,
          email: inviteForm.email,
          password: inviteForm.password,
          role: "teacher",
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "তৈরি করা যায়নি");
      }

      toast({ title: "সাফল্য", description: "নতুন শিক্ষক তৈরি হয়েছে" });
      setInviteOpen(false);
      setInviteForm({ name: "", email: "", password: "" });
      fetchTeachers();
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e?.message || "শিক্ষক তৈরি করতে ব্যর্থ", variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

  const handleMakeTeacher = async (userId: string) => {
    try {
      await adminApi.updateRole(userId, "teacher", false);
      toast({ title: "সাফল্য", description: "শিক্ষক রোল যোগ হয়েছে" });
      fetchTeachers();
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e?.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">শিক্ষক প্যানেল</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            মোট {teachers.length} জন শিক্ষক — সম্মিলিত {totalQuestions}টি প্রশ্ন তৈরি
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTeachers} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            রিফ্রেশ
          </Button>
          <Button size="sm" onClick={() => setInviteOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            নতুন শিক্ষক
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teachers.length}</p>
                <p className="text-xs text-muted-foreground">মোট শিক্ষক</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-green-100 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalQuestions}</p>
                <p className="text-xs text-muted-foreground">মোট প্রশ্ন</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {teachers.filter((t) => !t.is_suspended).length}
                </p>
                <p className="text-xs text-muted-foreground">সক্রিয়</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {teachers.length > 0 ? Math.round(totalQuestions / teachers.length) : 0}
                </p>
                <p className="text-xs text-muted-foreground">গড় প্রশ্ন/শিক্ষক</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="নাম, ইমেইল বা ফোন দিয়ে খুঁজুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Teachers List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">শিক্ষক তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>কোনো শিক্ষক পাওয়া যায়নি</p>
              <Button size="sm" className="mt-4 gap-2" onClick={() => setInviteOpen(true)}>
                <Plus className="h-4 w-4" />
                প্রথম শিক্ষক যোগ করুন
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {teachers.map((teacher) => (
                <div
                  key={teacher.user_id}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                    teacher.is_suspended
                      ? "bg-red-50 border-red-200"
                      : "bg-background hover:bg-muted/40"
                  }`}
                >
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-700 font-semibold text-sm">
                    {(teacher.name || teacher.email || "T").charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{teacher.name}</span>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">শিক্ষক</Badge>
                      {teacher.is_suspended && (
                        <Badge variant="destructive" className="text-xs">স্থগিত</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                      {teacher.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {teacher.email}
                        </span>
                      )}
                      {teacher.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {teacher.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <BookOpen className="h-3 w-3" />
                        {teacher.question_count}টি প্রশ্ন
                      </span>
                      {teacher.last_sign_in && (
                        <span>
                          শেষ লগইন: {new Date(teacher.last_sign_in).toLocaleDateString("bn-BD")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem onClick={() => handleRemoveTeacher(teacher.user_id)}>
                        <ShieldOff className="h-4 w-4 mr-2 text-muted-foreground" />
                        শিক্ষক রোল সরাও
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleSuspend(teacher)}
                        className={teacher.is_suspended ? "text-emerald-600" : "text-destructive"}
                      >
                        {teacher.is_suspended ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            স্থগিতাদেশ তুলে নাও
                          </>
                        ) : (
                          <>
                            <ShieldOff className="h-4 w-4 mr-2" />
                            অ্যাকাউন্ট স্থগিত করো
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>নতুন শিক্ষক তৈরি করুন</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>পুরো নাম *</Label>
              <Input
                placeholder="শিক্ষকের নাম"
                value={inviteForm.name}
                onChange={(e) => setInviteForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>ইমেইল *</Label>
              <Input
                type="email"
                placeholder="teacher@example.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>পাসওয়ার্ড *</Label>
              <Input
                type="password"
                placeholder="কমপক্ষে ৬ অক্ষর"
                value={inviteForm.password}
                onChange={(e) => setInviteForm((p) => ({ ...p, password: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              বাতিল
            </Button>
            <Button onClick={handleInviteTeacher} disabled={inviting}>
              {inviting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              শিক্ষক তৈরি করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
