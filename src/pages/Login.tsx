import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, Loader2, Facebook } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePageMeta } from "@/hooks/usePageMeta";
import BrandLogo from "@/components/BrandLogo";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  usePageMeta({
    title: "লগইন",
    description: "প্রশ্নব্যাংক অ্যাকাউন্টে লগইন করে এক্সাম, র‍্যাংকিং ও ড্যাশবোর্ড ব্যবহার করো।",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn, signInWithGoogle, signInWithFacebook, signOut, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "ত্রুটি",
        description: "সব ফিল্ড পূরণ করো",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      let message = "লগইন করতে সমস্যা হয়েছে";
      if (error.message.includes("Invalid login credentials")) {
        message = "ইমেইল বা পাসওয়ার্ড ভুল হয়েছে";
      } else if (error.message.includes("Email not confirmed")) {
        message = "প্রথমে তোমার ইমেইল ভেরিফাই করো";
      }
      
      toast({
        title: "লগইন ব্যর্থ",
        description: message,
        variant: "destructive",
      });
    } else {
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

      const isTeacherAccount = (roleData ?? []).some((item) =>
        ["admin", "moderator", "teacher"].includes(item.role)
      );

      if (roleError || isTeacherAccount) {
        await signOut();
        toast({
          title: "শিক্ষক অ্যাকাউন্ট",
          description: "শিক্ষক অ্যাকাউন্ট লগইন করতে শিক্ষক লগইন পেজ ব্যবহার করো",
          variant: "destructive",
        });
        navigate("/teacher-login", { replace: true });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "সফল!",
        description: "সফলভাবে লগইন হয়েছে",
      });
      navigate("/dashboard");
    }
    
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <BrandLogo size="lg" />
        </Link>

        {/* Login Card */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-bengali text-card-foreground mb-2">
              স্বাগতম! 👋
            </h1>
            <p className="text-muted-foreground font-bengali text-sm">
              তোমার অ্যাকাউন্টে লগইন করো
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bengali">ইমেইল</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-bengali">পাসওয়ার্ড</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                <span className="font-bengali text-muted-foreground">মনে রাখো</span>
              </label>
              <Link to="/forgot-password" className="text-primary hover:underline font-bengali">
                পাসওয়ার্ড ভুলে গেছ?
              </Link>
            </div>

            <Button type="submit" variant="hero" className="w-full font-bengali" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  লগইন হচ্ছে...
                </>
              ) : (
                "লগইন করো"
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

          <div className="mt-6 text-center">
            <p className="text-muted-foreground font-bengali text-sm">
              অ্যাকাউন্ট নেই?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                রেজিস্ট্রেশন করো
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-muted-foreground hover:text-foreground font-bengali text-sm transition-colors">
            ← হোম পেজে ফিরে যাও
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
