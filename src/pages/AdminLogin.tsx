import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, Shield } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useToast } from "@/hooks/use-toast";
import { getConfiguredAdminEmails, isConfiguredAdminEmail } from "@/lib/admin-access";

const AdminLogin = () => {
  usePageMeta({
    title: "অ্যাডমিন লগইন",
    description: "অ্যাডমিন প্যানেলের জন্য সুরক্ষিত লগইন।",
    noIndex: true,
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const configuredAdminEmails = useMemo(() => getConfiguredAdminEmails(), []);
  const { signIn, signOut, user, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !adminLoading && user && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [authLoading, adminLoading, user, isAdmin, navigate]);

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

    if (!isConfiguredAdminEmail(email)) {
      toast({
        title: "অনুমতি নেই",
        description: "এই ইমেইল অ্যাডমিন হিসেবে কনফিগার করা নেই",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Ensure admin login starts with a clean auth state.
    if (user) {
      await signOut();
    }

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "লগইন ব্যর্থ",
        description: "অ্যাডমিন লগইন তথ্য ভুল হয়েছে",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const signedInEmail = user?.email ?? email;
    if (!isConfiguredAdminEmail(signedInEmail)) {
      await signOut();
      toast({
        title: "অনুমতি নেই",
        description: "এই অ্যাকাউন্ট অ্যাডমিন প্যানেলে প্রবেশ করতে পারবে না",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    toast({
      title: "সফল",
      description: "অ্যাডমিন প্যানেলে স্বাগতম",
    });

    navigate("/admin", { replace: true });
    setIsSubmitting(false);
  };

  if (authLoading || adminLoading) {
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
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="mb-2 text-2xl font-bold font-bengali text-card-foreground">অ্যাডমিন লগইন</h1>
            <p className="text-sm font-bengali text-muted-foreground">
              শুধু অনুমোদিত অ্যাডমিন ইমেইল দিয়ে লগইন করা যাবে
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bengali">অ্যাডমিন ইমেইল</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@mail.com"
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
                "অ্যাডমিন লগইন"
              )}
            </Button>
          </form>

          {configuredAdminEmails.length > 0 ? (
            <p className="mt-4 text-center text-xs font-bengali text-muted-foreground">
              কনফিগার করা অ্যাডমিন: {configuredAdminEmails.join(", ")}
            </p>
          ) : (
            <p className="mt-4 text-center text-xs font-bengali text-destructive">
              VITE_ADMIN_EMAILS সেট করা নেই
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
