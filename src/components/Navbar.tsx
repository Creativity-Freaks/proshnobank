import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, LogOut, Shield, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, isLoading } = useAuth();
  const { isAdmin } = useAdminCheck();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "লগআউট সফল",
      description: "তুমি সফলভাবে লগআউট করেছো",
    });
    navigate("/");
  };

  const publicNavLinks = [
    { name: "হোম", href: "/" },
    { name: "এক্সাম ব্যাচ", href: "/batches" },
    { name: "প্রশ্নব্যাংক", href: "/question-bank" },
    { name: "লাইভ এক্সাম", href: "/live-exams" },
    { name: "লিডারবোর্ড", href: "/leaderboard" },
  ];

  const loggedInNavLinks = [
    { name: "হোম", href: "/" },
    { name: "ড্যাশবোর্ড", href: "/dashboard" },
    { name: "এক্সাম ব্যাচ", href: "/batches" },
    { name: "প্রশ্নব্যাংক", href: "/question-bank" },
    { name: "লাইভ এক্সাম", href: "/live-exams" },
    { name: "লিডারবোর্ড", href: "/leaderboard" },
  ];

  const navLinks = user ? loggedInNavLinks : publicNavLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-bengali text-foreground">প্রশ্নব্যাংক</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors font-bengali text-sm"
              >
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-muted-foreground hover:text-foreground transition-colors font-bengali text-sm flex items-center gap-1"
              >
                <Shield className="w-4 h-4" />
                অ্যাডমিন
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-20 h-8 bg-muted animate-pulse rounded" />
            ) : !user ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-bengali">
                    লগইন
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="hero" size="sm" className="font-bengali">
                    রেজিস্ট্রেশন
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <span className="text-sm text-muted-foreground font-bengali truncate max-w-[150px]">
                  {user.email}
                </span>
                <Button variant="ghost" size="sm" className="gap-2" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  লগআউট
                </Button>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block text-muted-foreground hover:text-foreground transition-colors font-bengali py-2"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="block text-muted-foreground hover:text-foreground transition-colors font-bengali py-2 flex items-center gap-1"
                onClick={() => setIsOpen(false)}
              >
                <Shield className="w-4 h-4" />
                অ্যাডমিন
              </Link>
            )}
            <div className="flex gap-3 pt-3 border-t border-border">
              {!user ? (
                <>
                  <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full font-bengali">
                      লগইন
                    </Button>
                  </Link>
                  <Link to="/register" className="flex-1" onClick={() => setIsOpen(false)}>
                    <Button variant="hero" size="sm" className="w-full font-bengali">
                      রেজিস্ট্রেশন
                    </Button>
                  </Link>
                </>
              ) : (
                <Button variant="ghost" size="sm" className="w-full gap-2" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  লগআউট
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
