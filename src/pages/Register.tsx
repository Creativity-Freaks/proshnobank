import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePageMeta } from "@/hooks/usePageMeta";
import BrandLogo from "@/components/BrandLogo";

const Register = () => {
  const [searchParams] = useSearchParams();
  const registrationType = searchParams.get("type") === "teacher" ? "teacher" : "student";
  const isTeacherRegistration = registrationType === "teacher";

  usePageMeta({
    title: isTeacherRegistration ? "শিক্ষক রেজিস্ট্রেশন" : "রেজিস্ট্রেশন",
    description: isTeacherRegistration
      ? "শিক্ষক অ্যাকাউন্ট তৈরি করে শিক্ষক প্যানেল ব্যবহার শুরু করুন।"
      : "নতুন অ্যাকাউন্ট তৈরি করে লাইভ এক্সাম, প্রশ্নব্যাংক এবং ড্যাশবোর্ড ব্যবহার শুরু করো।",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const { signUp, signInWithGoogle, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "ত্রুটি",
        description: "সব ফিল্ড পূরণ করো",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "ত্রুটি",
        description: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "ত্রুটি",
        description: "পাসওয়ার্ড মিলছে না",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await signUp(formData.email, formData.password, formData.name, registrationType);

    if (error) {
      let message = "রেজিস্ট্রেশন করতে সমস্যা হয়েছে";
      if (error.message.includes("User already registered")) {
        message = "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে";
      } else if (error.message.includes("Invalid email")) {
        message = "সঠিক ইমেইল দাও";
      }

      toast({
        title: "রেজিস্ট্রেশন ব্যর্থ",
        description: message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "সফল! 🎉",
        description: "অ্যাকাউন্ট তৈরি হয়েছে। ইমেইল ভেরিফাই করো অথবা সরাসরি লগইন করো।",
      });
      navigate(isTeacherRegistration ? "/teacher-login" : "/login");
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

        {/* Register Card */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-bengali text-card-foreground mb-2">
              {isTeacherRegistration ? "শিক্ষক অ্যাকাউন্ট তৈরি করুন 🎓" : "নতুন অ্যাকাউন্ট তৈরি করো 🎓"}
            </h1>
            <p className="text-muted-foreground font-bengali text-sm">
              {isTeacherRegistration ? "শিক্ষক প্যানেল ব্যবহারের জন্য রেজিস্ট্রেশন করুন" : "ফ্রি রেজিস্ট্রেশন করে শুরু করো"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-bengali">পুরো নাম</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="তোমার নাম"
                  className="pl-10"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-bengali">ইমেইল</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@mail.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="font-bengali">মোবাইল নম্বর (ঐচ্ছিক)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="০১XXXXXXXXX"
                  className="pl-10"
                  value={formData.phone}
                  onChange={handleChange}
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-bengali">পাসওয়ার্ড নিশ্চিত করো</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="rounded border-border mt-1" required />
              <span className="font-bengali text-muted-foreground">
                আমি <Link to="/terms" className="text-primary hover:underline">শর্তাবলী</Link> এবং{" "}
                <Link to="/privacy" className="text-primary hover:underline">গোপনীয়তা নীতি</Link> মেনে নিচ্ছি
              </span>
            </div>

            <Button type="submit" variant="hero" className="w-full font-bengali" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  রেজিস্ট্রেশন হচ্ছে...
                </>
              ) : (
                "রেজিস্ট্রেশন করো"
              )}
            </Button>
          </form>

          {!isTeacherRegistration ? (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground font-bengali">অথবা</span>
                </div>
              </div>

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
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google দিয়ে রেজিস্ট্রেশন করো
              </Button>
            </>
          ) : (
            <p className="mt-4 text-center text-sm font-bengali text-muted-foreground">
              শিক্ষক রেজিস্ট্রেশনের জন্য ইমেইল/পাসওয়ার্ড দিয়ে অ্যাকাউন্ট তৈরি করুন।
            </p>
          )}

          <div className="mt-6 text-center">
            <p className="text-muted-foreground font-bengali text-sm">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
              <Link to={isTeacherRegistration ? "/teacher-login" : "/login"} className="text-primary hover:underline font-medium">
                {isTeacherRegistration ? "শিক্ষক লগইন" : "লগইন করো"}
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

export default Register;
