import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, User, GraduationCap, LogOut } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Mock authentication state - replace with real auth later
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"student" | "teacher" | null>(null);

  // Demo login functions
  const handleDemoStudentLogin = () => {
    setIsLoggedIn(true);
    setUserRole("student");
  };

  const handleDemoTeacherLogin = () => {
    setIsLoggedIn(true);
    setUserRole("teacher");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
  };

  const publicNavLinks = [
    { name: "হোম", href: "/" },
    { name: "এক্সাম ব্যাচ", href: "/batches" },
    { name: "প্রশ্নব্যাংক", href: "/question-bank" },
    { name: "লাইভ এক্সাম", href: "/live-exams" },
    { name: "লিডারবোর্ড", href: "/leaderboard" },
  ];

  const studentNavLinks = [
    { name: "হোম", href: "/" },
    { name: "ড্যাশবোর্ড", href: "/dashboard" },
    { name: "এক্সাম ব্যাচ", href: "/batches" },
    { name: "প্রশ্নব্যাংক", href: "/question-bank" },
    { name: "লাইভ এক্সাম", href: "/live-exams" },
    { name: "লিডারবোর্ড", href: "/leaderboard" },
  ];

  const teacherNavLinks = [
    { name: "হোম", href: "/" },
    { name: "শিক্ষক প্যানেল", href: "/teacher-dashboard" },
    { name: "এক্সাম ব্যাচ", href: "/batches" },
    { name: "প্রশ্নব্যাংক", href: "/question-bank" },
    { name: "লাইভ এক্সাম", href: "/live-exams" },
  ];

  const navLinks = isLoggedIn 
    ? (userRole === "teacher" ? teacherNavLinks : studentNavLinks)
    : publicNavLinks;

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
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <Button variant="ghost" size="sm" className="gap-2" onClick={handleDemoStudentLogin}>
                  <User className="w-4 h-4" />
                  ছাত্র লগইন
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleDemoTeacherLogin}>
                  <GraduationCap className="w-4 h-4" />
                  শিক্ষক লগইন
                </Button>
              </>
            ) : (
              <>
                <span className="text-sm text-muted-foreground font-bengali">
                  {userRole === "teacher" ? "👨‍🏫 শিক্ষক" : "👨‍🎓 ছাত্র"}
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
            <div className="flex gap-3 pt-3 border-t border-border">
              {!isLoggedIn ? (
                <>
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleDemoStudentLogin}>
                    ছাত্র লগইন
                  </Button>
                  <Button variant="hero" size="sm" className="flex-1" onClick={handleDemoTeacherLogin}>
                    শিক্ষক লগইন
                  </Button>
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
