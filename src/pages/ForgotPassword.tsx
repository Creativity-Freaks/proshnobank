import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "ত্রুটি",
        description: "ইমেইল দাও",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    if (error) {
      toast({
        title: "ত্রুটি",
        description: "পাসওয়ার্ড রিসেট লিংক পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করো।",
        variant: "destructive",
      });
    } else {
      setEmailSent(true);
      toast({
        title: "সফল!",
        description: "পাসওয়ার্ড রিসেট লিংক তোমার ইমেইলে পাঠানো হয়েছে",
      });
    }
    
    setIsSubmitting(false);
  };

  if (emailSent) {
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

          {/* Success Card */}
          <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold font-bengali text-card-foreground mb-4">
              ইমেইল পাঠানো হয়েছে! ✉️
            </h1>
            <p className="text-muted-foreground font-bengali mb-6">
              পাসওয়ার্ড রিসেট করার লিংক <strong>{email}</strong> এ পাঠানো হয়েছে। 
              তোমার ইমেইল চেক করো এবং লিংকে ক্লিক করো।
            </p>
            <p className="text-sm text-muted-foreground font-bengali mb-6">
              ইমেইল না পেলে স্প্যাম ফোল্ডার চেক করো।
            </p>
            <Link to="/login">
              <Button variant="outline" className="w-full font-bengali">
                <ArrowLeft className="w-4 h-4 mr-2" />
                লগইন পেজে ফিরে যাও
              </Button>
            </Link>
          </div>
        </div>
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

        {/* Forgot Password Card */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-bengali text-card-foreground mb-2">
              পাসওয়ার্ড ভুলে গেছ? 🔐
            </h1>
            <p className="text-muted-foreground font-bengali text-sm">
              তোমার ইমেইল দাও, আমরা রিসেট লিংক পাঠাবো
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

            <Button type="submit" variant="hero" className="w-full font-bengali" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  পাঠানো হচ্ছে...
                </>
              ) : (
                "রিসেট লিংক পাঠাও"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-primary hover:underline font-bengali text-sm inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              লগইন পেজে ফিরে যাও
            </Link>
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

export default ForgotPassword;
