import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
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

  const { signIn, signOut, user, isLoading: authLoading } = useAuth();
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
              <Label htmlFor="email" className="font-bengali">ইমেইল</Label>
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
              <Label htmlFor="password" className="font-bengali">পাসওয়ার্ড</Label>
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

          <div className="mt-6 text-center text-sm font-bengali text-muted-foreground">
            স্টুডেন্ট? <Link to="/login" className="text-primary hover:underline">স্টুডেন্ট লগইন</Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm font-bengali text-muted-foreground transition-colors hover:text-foreground">
            ← হোম পেজে ফিরে যাও
          </Link>
        </div>
      </div>

    </div>
  );
};

export default TeacherLogin;
