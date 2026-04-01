import { useState, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Lock, Save, ArrowLeft, Loader2, Camera } from "lucide-react";

const Profile = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || "");

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
    return <Navigate to="/login" replace />;
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "ত্রুটি", description: "শুধুমাত্র ছবি আপলোড করা যাবে।", variant: "destructive" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "ত্রুটি", description: "ছবির সাইজ ২MB এর বেশি হতে পারবে না।", variant: "destructive" });
      return;
    }

    try {
      setUploadingAvatar(true);
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: urlWithCacheBust },
      });

      if (updateError) throw updateError;

      setAvatarUrl(urlWithCacheBust);
      toast({ title: "সফল!", description: "প্রোফাইল ছবি আপডেট হয়েছে।" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "প্রোফাইল ছবি আপডেট করতে সমস্যা হয়েছে।";
      toast({ title: "ত্রুটি", description: message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });
      if (error) throw error;
      toast({ title: "সফল!", description: "প্রোফাইল আপডেট হয়েছে।" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "প্রোফাইল আপডেট করতে সমস্যা হয়েছে।";
      toast({ title: "ত্রুটি", description: message, variant: "destructive" });
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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে।";
      toast({ title: "ত্রুটি", description: message, variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  const initials = (fullName || user.email || "U").slice(0, 2).toUpperCase();

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

          {/* Avatar Section */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6 flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={avatarUrl} alt="Profile" />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatar ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
            </div>
            <p className="text-sm text-muted-foreground">ছবি পরিবর্তন করতে ক্লিক করো</p>
          </div>

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
