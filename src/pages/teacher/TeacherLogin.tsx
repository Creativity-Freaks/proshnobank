import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Facebook, Loader2, Lock, Mail } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TeacherLogin = () => {
  usePageMeta({
    title: "শিক্ষক লগইন",
    description: "শিক্ষক অ্যাকাউন্টে লগইন করে শিক্ষক প্যানেল ব্যবহার করুন।",
    noIndex: true,
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signInWithGoogle, signInWithFacebook, signOut, user, isLoading: authLoading } = useAuth();
  const { hasRole: canAccessTeacherPanel, isLoading: roleLoading } = useRoleCheck([
    "admin",
    "moderator",
    "teacher",
  ]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !roleLoading && user) {
      navigate(canAccessTeacherPanel ? "/teacher-dashboard" : "/dashboard", { replace: true });
    }
  }, [authLoading, roleLoading, user, canAccessTeacherPanel, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      toast({
        title: "ত্রুটি",
        description: "ইমেইল এবং পাসওয়ার্ড দাও",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "লগইন ব্যর্থ",
        description: "ইমেইল বা পাসওয়ার্ড ভুল হয়েছে",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      await signOut();
      toast({
        title: "ত্রুটি",
        description: "লগইন সেশন পাওয়া যায়নি। আবার চেষ্টা করো",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .limit(20);

    const canAccessTeacherRole = (roleData ?? []).some((item) =>
      ["admin", "moderator", "teacher"].includes(item.role)
    );

    if (roleError || !canAccessTeacherRole) {
      await signOut();
      toast({
        title: "অনুমতি নেই",
        description: "এই অ্যাকাউন্ট শিক্ষক প্যানেলের জন্য অনুমোদিত নয়",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    toast({
      title: "সফল",
      description: "শিক্ষক প্যানেলে স্বাগতম",
    });
    navigate("/teacher-dashboard", { replace: true });
    setIsSubmitting(false);
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center">
          <BrandLogo size="lg" />
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold font-bengali text-card-foreground">শিক্ষক লগইন</h1>
            <p className="text-sm font-bengali text-muted-foreground">
              শুধু শিক্ষক/মডারেটর অ্যাকাউন্ট এই প্যানেলে প্রবেশ করতে পারবে
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bengali">
                ইমেইল
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="teacher@mail.com"
                  className="pl-10"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-bengali">
                পাসওয়ার্ড
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="পাসওয়ার্ড দেখাও"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full font-bengali" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  লগইন হচ্ছে...
                </>
              ) : (
                "শিক্ষক হিসেবে লগইন"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-bengali">অথবা</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full font-bengali gap-2"
              onClick={async () => {
                const { error } = await signInWithGoogle();
                if (error) {
                  const rawMessage = error.message || "Google লগইন করতে সমস্যা হয়েছে";
                  const lower = rawMessage.toLowerCase();

                  let hint = rawMessage;
                  if (lower.includes("provider") || lower.includes("oauth")) {
                    hint = "Supabase Authentication > Providers থেকে Google enable করে Client ID/Secret সেট করতে হবে।";
                  } else if (lower.includes("redirect")) {
                    hint = `Supabase Redirect URL list-এ ${window.location.origin}/dashboard যোগ করো।`;
                  }

                  toast({ title: "ত্রুটি", description: hint, variant: "destructive" });
                }
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full font-bengali gap-2"
              onClick={async () => {
                const { error } = await signInWithFacebook();
                if (error) {
                  const rawMessage = error.message || "Facebook লগইন করতে সমস্যা হয়েছে";
                  const lower = rawMessage.toLowerCase();

                  let hint = rawMessage;
                  if (lower.includes("provider") || lower.includes("oauth")) {
                    hint = "Supabase Authentication > Providers থেকে Facebook enable করে App ID/Secret সেট করতে হবে।";
                  } else if (lower.includes("redirect")) {
                    hint = `Supabase Redirect URL list-এ ${window.location.origin}/dashboard যোগ করো।`;
                  }

                  toast({ title: "ত্রুটি", description: hint, variant: "destructive" });
                }
              }}
            >
              <Facebook className="w-5 h-5" />
              Facebook
            </Button>
          </div>

          <div className="mt-3 text-center text-sm font-bengali text-muted-foreground">
            শিক্ষক অ্যাকাউন্ট নেই?{" "}
            <Link to="/teacher-register" className="text-primary hover:underline">
              শিক্ষক রেজিস্ট্রেশন
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm font-bengali text-muted-foreground transition-colors hover:text-foreground"
          >
            ← হোম পেজে ফিরে যাও
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
