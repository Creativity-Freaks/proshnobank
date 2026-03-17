import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
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

    const { error } = await signUp(formData.email, formData.password, formData.name);

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
      navigate("/login");
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
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold font-bengali text-foreground">প্রশ্নব্যাংক</span>
        </Link>

        {/* Register Card */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-bengali text-card-foreground mb-2">
              নতুন অ্যাকাউন্ট তৈরি করো 🎓
            </h1>
            <p className="text-muted-foreground font-bengali text-sm">
              ফ্রি রেজিস্ট্রেশন করে শুরু করো
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

          <div className="mt-6 text-center">
            <p className="text-muted-foreground font-bengali text-sm">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                লগইন করো
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
