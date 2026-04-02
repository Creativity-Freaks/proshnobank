import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, type AdminUser } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Shield, UserPlus, Trash2 } from "lucide-react";

const roleLabels: Record<string, string> = {
  admin: "অ্যাডমিন",
  moderator: "মডারেটর",
  teacher: "শিক্ষক",
  user: "ব্যবহারকারী",
};

const roleBadgeClass: Record<string, string> = {
  admin: "bg-red-500/20 text-red-700",
  moderator: "bg-yellow-500/20 text-yellow-700",
  teacher: "bg-blue-500/20 text-blue-700",
  user: "bg-muted text-muted-foreground",
};

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState("all");
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState("user");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", roleFilter],
    queryFn: () => adminApi.users({ role: roleFilter }),
  });

  const addRoleMutation = useMutation({
    mutationFn: () => adminApi.updateRole(selectedUser!.user_id, newRole, false),
    onSuccess: () => {
      toast({ title: "সফল!", description: "রোল যোগ করা হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setRoleDialogOpen(false);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const removeRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminApi.updateRole(userId, role, true),
    onSuccess: () => {
      toast({ title: "সফল!", description: "রোল সরানো হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const users: AdminUser[] = data?.data || [];

  const openRoleDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setNewRole("user");
    setRoleDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ইউজার ম্যানেজমেন্ট</h1>
          <p className="text-muted-foreground">ইউজারদের রোল পরিচালনা করুন</p>
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="ফিল্টার" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব রোল</SelectItem>
            <SelectItem value="admin">অ্যাডমিন</SelectItem>
            <SelectItem value="teacher">শিক্ষক</SelectItem>
            <SelectItem value="moderator">মডারেটর</SelectItem>
            <SelectItem value="user">ব্যবহারকারী</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : users.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">কোনো ইউজার নেই</CardContent></Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ইউজার</TableHead>
                <TableHead>ইমেইল</TableHead>
                <TableHead>রোল</TableHead>
                <TableHead>সর্বশেষ লগইন</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        {u.avatar_url && <AvatarImage src={u.avatar_url} />}
                        <AvatarFallback className="text-xs">{(u.name || u.email || "?")[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{u.name || "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <Badge key={r} className={`${roleBadgeClass[r] || ""} gap-1`}>
                          {roleLabels[r] || r}
                          {r !== "user" && (
                            <button
                              className="ml-1 hover:text-destructive"
                              onClick={() => {
                                if (confirm(`${roleLabels[r]} রোল সরাতে চান?`))
                                  removeRoleMutation.mutate({ userId: u.user_id, role: r });
                              }}
                            >✕</button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString("bn-BD") : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openRoleDialog(u)}>
                      <UserPlus className="h-4 w-4 mr-1" /> রোল যোগ
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>রোল যোগ করুন</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {selectedUser?.name || selectedUser?.email} কে নতুন রোল দিন
            </p>
            <div>
              <Label>রোল নির্বাচন</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">অ্যাডমিন</SelectItem>
                  <SelectItem value="teacher">শিক্ষক</SelectItem>
                  <SelectItem value="moderator">মডারেটর</SelectItem>
                  <SelectItem value="user">ব্যবহারকারী</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>বাতিল</Button>
            <Button onClick={() => addRoleMutation.mutate()} disabled={addRoleMutation.isPending}>
              {addRoleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              রোল যোগ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
