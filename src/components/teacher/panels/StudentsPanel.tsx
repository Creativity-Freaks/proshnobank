import { useEffect, useState } from "react";
import { Loader2, Trash2, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Student = {
  id: string;
  name: string;
  roll: string;
  className: string;
  phone: string;
};

function readRoster(metadata: Record<string, unknown> | undefined): Student[] {
  const raw = metadata?.roster;
  if (!Array.isArray(raw)) return [];
  return raw.filter((s): s is Student => typeof s === "object" && s !== null && "id" in s);
}

export default function StudentsPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [className, setClassName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStudents(readRoster(user?.user_metadata));
  }, [user?.user_metadata]);

  const persist = async (next: Student[]) => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { roster: next } });
      if (error) throw error;
      setStudents(next);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "সংরক্ষণ করা যায়নি।";
      toast({ title: "ত্রুটি", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      toast({ title: "ত্রুটি", description: "শিক্ষার্থীর নাম দিন।", variant: "destructive" });
      return;
    }
    const student: Student = {
      id: `${Date.now()}`,
      name: name.trim(),
      roll: roll.trim(),
      className: className.trim(),
      phone: phone.trim(),
    };
    await persist([...students, student]);
    setName("");
    setRoll("");
    setClassName("");
    setPhone("");
    toast({ title: "যোগ হয়েছে!", description: "শিক্ষার্থী তালিকায় যুক্ত হয়েছে।" });
  };

  const handleRemove = async (id: string) => {
    await persist(students.filter((s) => s.id !== id));
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" /> নতুন শিক্ষার্থী
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>নাম</Label>
            <Input className="mt-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="শিক্ষার্থীর নাম" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>রোল</Label>
              <Input className="mt-2" value={roll} onChange={(e) => setRoll(e.target.value)} />
            </div>
            <div>
              <Label>শ্রেণি</Label>
              <Input className="mt-2" value={className} onChange={(e) => setClassName(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>মোবাইল (ঐচ্ছিক)</Label>
            <Input className="mt-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button onClick={handleAdd} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            যোগ করুন
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> শিক্ষার্থী তালিকা ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-sm text-muted-foreground">এখনো কোনো শিক্ষার্থী যোগ করা হয়নি।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-2">নাম</th>
                    <th className="py-2 pr-2">রোল</th>
                    <th className="py-2 pr-2">শ্রেণি</th>
                    <th className="py-2 pr-2">মোবাইল</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-2 pr-2 font-medium">{s.name}</td>
                      <td className="py-2 pr-2">{s.roll || "-"}</td>
                      <td className="py-2 pr-2">{s.className || "-"}</td>
                      <td className="py-2 pr-2">{s.phone || "-"}</td>
                      <td className="py-2 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleRemove(s.id)} disabled={saving}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
