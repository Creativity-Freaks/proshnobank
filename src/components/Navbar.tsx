import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, LayoutDashboard, UserRound, BookOpen, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { useToast } from "@/hooks/use-toast";
import BrandLogo from "@/components/BrandLogo";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, isLoading } = useAuth();
  const { hasRole: isTeacher, isLoading: teacherRoleLoading } = useRoleCheck(["admin", "moderator", "teacher"]);
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
    { name: "শিক্ষকদের জন্য", href: "/teachers" },
  ];

  const dashboardLink = isTeacher
    ? { name: "শিক্ষক ড্যাশবোর্ড", href: "/teacher-dashboard" }
    : { name: "ড্যাশবোর্ড", href: "/dashboard" };

  const loggedInNavLinks = [
    { name: "হোম", href: "/" },
    { name: "এক্সাম ব্যাচ", href: "/batches" },
    { name: "প্রশ্নব্যাংক", href: "/question-bank" },
    { name: "লাইভ এক্সাম", href: "/live-exams" },
    { name: "লিডারবোর্ড", href: "/leaderboard" },
    dashboardLink,
  ];

  const navLinks = user ? loggedInNavLinks : publicNavLinks;
  const isAuthUiLoading = isLoading || (Boolean(user) && teacherRoleLoading);
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "ব্যবহারকারী";
  const avatarUrl =
    typeof user?.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : undefined;
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo size="md" textClassName="text-base sm:text-xl" />
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
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthUiLoading ? (
              <div className="w-20 h-8 bg-muted animate-pulse rounded" />
            ) : !user ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-bengali">
                    স্টুডেন্ট লগইন
                  </Button>
                </Link>
                <Link to="/teacher-login">
                  <Button variant="outline" size="sm" className="font-bengali">
                    শিক্ষক লগইন
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 font-bengali">
                      <Avatar className="h-7 w-7 border border-border">
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                          {initials || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {displayName}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 font-bengali">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2">
                        <UserRound className="h-4 w-4" />
                        প্রোফাইল
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard#my-batches" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        আমার ব্যাচ
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard#subscription" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        আমার সাবস্ক্রিপশন
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="sm" className="gap-2 font-bengali" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
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
            <div className="flex gap-3 pt-3 border-t border-border">
              {!user ? (
                <>
                  <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full font-bengali">
                      স্টুডেন্ট লগইন
                    </Button>
                  </Link>
                  <Link to="/teacher-login" className="flex-1" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full font-bengali">
                      শিক্ষক লগইন
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="w-full space-y-2">
                  <Link to="/profile" className="block" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full font-bengali gap-2">
                      <UserRound className="w-4 h-4" />
                      প্রোফাইল
                    </Button>
                  </Link>
                  <Link to="/dashboard#my-batches" className="block" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full font-bengali gap-2">
                      <BookOpen className="w-4 h-4" />
                      আমার ব্যাচ
                    </Button>
                  </Link>
                  <Link to="/dashboard#subscription" className="block" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full font-bengali gap-2">
                      <CreditCard className="w-4 h-4" />
                      আমার সাবস্ক্রিপশন
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="w-full gap-2" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                    লগআউট
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
