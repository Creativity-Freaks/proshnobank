import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Lock, Save, ArrowLeft, Loader2 } from "lucide-react";

const Profile = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background font-bengali">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });
      if (error) throw error;
      toast({ title: "সফল!", description: "প্রোফাইল আপডেট হয়েছে।" });
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "ত্রুটি", description: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে।", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "ত্রুটি", description: "পাসওয়ার্ড মিলছে না।", variant: "destructive" });
      return;
    }
    try {
      setChangingPassword(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "সফল!", description: "পাসওয়ার্ড পরিবর্তন হয়েছে।" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e.message, variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-bengali">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" /> ফিরে যাও
          </Button>

          <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            প্রোফাইল
          </h1>

          {/* Profile Info */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <h2 className="text-lg font-bold text-foreground mb-4">ব্যক্তিগত তথ্য</h2>
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-primary" /> ইমেইল
                </Label>
                <Input value={user.email || ""} disabled className="bg-muted" />
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-primary" /> পুরো নাম
                </Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="তোমার নাম লেখো" />
              </div>
              <Button onClick={handleUpdateProfile} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                আপডেট করো
              </Button>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> পাসওয়ার্ড পরিবর্তন
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="mb-2">নতুন পাসওয়ার্ড</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="নতুন পাসওয়ার্ড" />
              </div>
              <div>
                <Label className="mb-2">পাসওয়ার্ড নিশ্চিত করো</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="আবার পাসওয়ার্ড লেখো" />
              </div>
              <Button onClick={handleChangePassword} disabled={changingPassword} variant="outline" className="gap-2">
                {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                পাসওয়ার্ড পরিবর্তন করো
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
