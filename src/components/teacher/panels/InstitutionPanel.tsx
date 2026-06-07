import { useState } from "react";
import { Loader2, School } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { readInstitutionProfile } from "@/lib/teacherPaper";

export default function InstitutionPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const initial = readInstitutionProfile(user?.user_metadata);

  const [name, setName] = useState(initial.name);
  const [address, setAddress] = useState(initial.address);
  const [motto, setMotto] = useState(initial.motto);
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase.auth.updateUser({
        data: {
          institution_name: name.trim(),
          institution_address: address.trim(),
          institution_motto: motto.trim(),
          institution_logo: logoUrl.trim(),
        },
      });
      if (error) throw error;
      toast({ title: "সংরক্ষিত!", description: "প্রতিষ্ঠানের তথ্য আপডেট হয়েছে।" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "সংরক্ষণ করতে সমস্যা হয়েছে।";
      toast({ title: "ত্রুটি", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-primary" /> প্রতিষ্ঠানের তথ্য
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            এই তথ্যগুলো প্রশ্নপত্র ও OMR শিটের হেডারে অটোমেটিক যুক্ত হবে।
          </p>
          <div>
            <Label>প্রতিষ্ঠানের নাম</Label>
            <Input className="mt-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="যেমন: আদর্শ উচ্চ বিদ্যালয়" />
          </div>
          <div>
            <Label>ঠিকানা</Label>
            <Input className="mt-2" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="যেমন: বগুড়া সদর, বগুড়া" />
          </div>
          <div>
            <Label>মটো / স্লোগান (ঐচ্ছিক)</Label>
            <Input className="mt-2" value={motto} onChange={(e) => setMotto(e.target.value)} placeholder="যেমন: শিক্ষাই জাতির মেরুদণ্ড" />
          </div>
          <div>
            <Label>লোগো URL (ঐচ্ছিক)</Label>
            <Input className="mt-2" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://.../logo.png" />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> সংরক্ষণ হচ্ছে...
              </>
            ) : (
              "সংরক্ষণ করুন"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>প্রিভিউ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border p-4 text-center">
            {logoUrl ? (
              <img src={logoUrl} alt="logo" className="mx-auto h-14 w-14 object-contain" />
            ) : (
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <School className="h-7 w-7" />
              </div>
            )}
            <div className="mt-2 text-lg font-bold">{name || "প্রতিষ্ঠানের নাম"}</div>
            {motto ? <div className="text-xs text-muted-foreground">{motto}</div> : null}
            {address ? <div className="text-xs text-muted-foreground">{address}</div> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
