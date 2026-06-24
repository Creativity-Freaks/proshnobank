import { useEffect, useState, useCallback, useRef } from "react";
import {
  Loader2, Search, Shield, ShieldOff, Ban, CheckCircle2,
  ChevronDown, RefreshCw, UserPlus, MoreHorizontal, Mail, Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/contexts/AdminContext";
import { adminApi, type AdminUser } from "@/lib/admin/admin-api";

const ROLE_FILTERS = [
  { id: "all", label: "সকল" },
  { id: "admin", label: "অ্যাডমিন" },
  { id: "teacher", label: "শিক্ষক" },
  { id: "student", label: "শিক্ষার্থী" },
];

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-red-100 text-red-800",
  teacher: "bg-blue-100 text-blue-800",
  moderator: "bg-purple-100 text-purple-800",
  student: "bg-emerald-100 text-emerald-800",
  user: "bg-gray-100 text-gray-800",
};

const ROLE_LABEL: Record<string, string> = {
  admin: "অ্যাডমিন",
  teacher: "শিক্ষক",
  moderator: "মডারেটর",
  student: "শিক্ষার্থী",
  user: "ব্যবহারকারী",
};

export default function AdminUsersTab() {
  const { toast } = useToast();
  const { refreshTrigger } = useAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [total, setTotal] = useState(0);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Create user dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "admin" as "admin" | "moderator" });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.users({ role: roleFilter, search: searchQuery, limit: 50 });
      setUsers(res.data || []);
      setTotal(res.total || 0);
    } catch (e) {
      console.error("[v0] AdminUsersTab fetchUsers error:", e);
      toast({ title: "ত্রুটি", description: "ব্যবহারকারী লোড করা যায়নি", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [roleFilter, searchQuery, toast]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(fetchUsers, 400);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [fetchUsers, refreshTrigger]);

  const handleRoleToggle = async (user: AdminUser, role: string, remove: boolean) => {
    try {
      await adminApi.updateRole(user.user_id, role, remove);
      toast({ title: "সাফল্য", description: `রোল ${remove ? "সরানো" : "যোগ"} হয়েছে` });
      fetchUsers();
    } catch (e: unknown) {
      toast({ title: "ত্রুটি", description: (e as Error).message, variant: "destructive" });
    }
  };

  const handleSuspend = async (user: AdminUser) => {
    const newState = !user.is_suspended;
    try {
      await adminApi.updateSuspension(user.user_id, newState);
      toast({ title: "সাফল্য", description: `অ্যাকাউন্ট ${newState ? "স্থগিত" : "পুনরুদ্ধার"} হয়েছে` });
      fetchUsers();
    } catch (e: unknown) {
      toast({ title: "ত্রুটি", description: (e as Error).message, variant: "destructive" });
    }
  };

  const handleRestrict = async (user: AdminUser) => {
    const newState = !user.is_restricted;
    try {
      await adminApi.updateRestriction(user.user_id, newState);
      toast({ title: "সাফল্য", description: `অ্যাকাউন্ট ${newState ? "সীমাবদ্ধ" : "পুনরুদ্ধার"} হয়েছে` });
      fetchUsers();
    } catch (e: unknown) {
      toast({ title: "ত্রুটি", description: (e as Error).message, variant: "destructive" });
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({ title: "ত্রুটি", description: "সব তথ্য পূরণ করুন", variant: "destructive" });
      return;
    }
    try {
      setCreating(true);
      await adminApi.createUser(newUser);
      toast({ title: "সাফল্য", description: "ব্যবহারকারী তৈরি হয়েছে" });
      setCreateOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "admin" });
      fetchUsers();
    } catch (e: unknown) {
      toast({ title: "ত্রুটি", description: (e as Error).message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">ব্যবহারকারী ব্যবস্থাপনা</h2>
          <p className="text-sm text-muted-foreground mt-0.5">মোট {total} জন নিবন্ধিত</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            রিফ্রেশ
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            নতুন অ্যাডমিন
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="নাম, ইমেইল বা ফোন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ROLE_FILTERS.map(f => (
            <Button
              key={f.id}
              variant={roleFilter === f.id ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">ব্যবহারকারী তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>কোনো ব্যবহারকারী পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map(user => (
                <div
                  key={user.user_id}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                    user.is_suspended ? "bg-red-50 border-red-200" :
                    user.is_restricted ? "bg-amber-50 border-amber-200" :
                    "bg-background hover:bg-muted/40"
                  }`}
                >
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold text-sm">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">
                        {user.name || "(নাম নেই)"}
                      </span>
                      {user.roles.map(r => (
                        <span key={r} className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[r] || ROLE_BADGE.user}`}>
                          {ROLE_LABEL[r] || r}
                        </span>
                      ))}
                      {user.is_suspended && <Badge variant="destructive" className="text-xs">স্থগিত</Badge>}
                      {user.is_restricted && <Badge className="bg-amber-100 text-amber-800 text-xs">সীমাবদ্ধ</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                      {user.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                      )}
                      {user.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </span>
                      )}
                      {user.last_sign_in && (
                        <span>শেষ লগইন: {new Date(user.last_sign_in).toLocaleDateString("bn-BD")}</span>
                      )}
                      {user.purchased_batches && user.purchased_batches.length > 0 && (
                        <span className="text-primary font-medium">{user.purchased_batches.length}টি ব্যাচ</span>
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
                      {/* Role Management */}
                      {!user.roles.includes("admin") && (
                        <DropdownMenuItem onClick={() => handleRoleToggle(user, "admin", false)}>
                          <Shield className="h-4 w-4 mr-2 text-red-600" />
                          অ্যাডমিন বানাও
                        </DropdownMenuItem>
                      )}
                      {user.roles.includes("admin") && (
                        <DropdownMenuItem onClick={() => handleRoleToggle(user, "admin", true)}>
                          <ShieldOff className="h-4 w-4 mr-2 text-muted-foreground" />
                          অ্যাডমিন সরাও
                        </DropdownMenuItem>
                      )}
                      {!user.roles.includes("teacher") && (
                        <DropdownMenuItem onClick={() => handleRoleToggle(user, "teacher", false)}>
                          <Shield className="h-4 w-4 mr-2 text-blue-600" />
                          শিক্ষক বানাও
                        </DropdownMenuItem>
                      )}
                      {user.roles.includes("teacher") && (
                        <DropdownMenuItem onClick={() => handleRoleToggle(user, "teacher", true)}>
                          <ShieldOff className="h-4 w-4 mr-2 text-muted-foreground" />
                          শিক্ষক রোল সরাও
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleRestrict(user)}>
                        {user.is_restricted ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" />
                            সীমাবদ্ধতা সরাও
                          </>
                        ) : (
                          <>
                            <ShieldOff className="h-4 w-4 mr-2 text-amber-600" />
                            সীমাবদ্ধ করো
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSuspend(user)}
                        className={user.is_suspended ? "text-emerald-600" : "text-destructive"}
                      >
                        {user.is_suspended ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            স্থগিতাদেশ তুলে নাও
                          </>
                        ) : (
                          <>
                            <Ban className="h-4 w-4 mr-2" />
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

      {/* Create Admin/Moderator Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>নতুন অ্যাডমিন / মডারেটর তৈরি করুন</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>পুরো নাম</Label>
              <Input
                placeholder="নাম লিখুন..."
                value={newUser.name}
                onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>ইমেইল</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={newUser.email}
                onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>পাসওয়ার্ড</Label>
              <Input
                type="password"
                placeholder="কমপক্ষে ৬ অক্ষর"
                value={newUser.password}
                onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>ভূমিকা</Label>
              <Select
                value={newUser.role}
                onValueChange={v => setNewUser(p => ({ ...p, role: v as "admin" | "moderator" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">অ্যাডমিন</SelectItem>
                  <SelectItem value="moderator">মডারেটর</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>বাতিল</Button>
            <Button onClick={handleCreateUser} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              তৈরি করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
