import { Link } from "react-router-dom";
import { BookOpen, Facebook, Youtube, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-bengali">প্রশ্নব্যাংক</span>
            </Link>
            <p className="text-background/70 font-bengali text-sm">
              বাংলাদেশের সেরা অনলাইন পরীক্ষা প্ল্যাটফর্ম। তোমার স্বপ্নের লক্ষ্যে পৌঁছে দিতে আমরা আছি।
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold font-bengali text-lg mb-4">দ্রুত লিংক</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/batches" className="text-background/70 hover:text-background font-bengali transition-colors">এক্সাম ব্যাচ</Link></li>
              <li><Link to="/question-bank" className="text-background/70 hover:text-background font-bengali transition-colors">প্রশ্নব্যাংক</Link></li>
              <li><Link to="/live-exams" className="text-background/70 hover:text-background font-bengali transition-colors">লাইভ এক্সাম</Link></li>
              <li><Link to="/leaderboard" className="text-background/70 hover:text-background font-bengali transition-colors">লিডারবোর্ড</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold font-bengali text-lg mb-4">শিক্ষকদের জন্য</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/teachers" className="text-background/70 hover:text-background font-bengali transition-colors">প্রশ্ন তৈরী করুন</Link></li>
              <li><Link to="/teachers" className="text-background/70 hover:text-background font-bengali transition-colors">OMR মূল্যায়ন</Link></li>
              <li><Link to="/teachers" className="text-background/70 hover:text-background font-bengali transition-colors">অনলাইন পরীক্ষা</Link></li>
              <li><Link to="/teachers" className="text-background/70 hover:text-background font-bengali transition-colors">টিচার প্যানেল</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold font-bengali text-lg mb-4">যোগাযোগ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-background/70">
                <Mail className="w-4 h-4" />
                <span>info@proshnobank.com</span>
              </li>
              <li className="flex items-center gap-2 text-background/70">
                <Phone className="w-4 h-4" />
                <span>+880 1700 000000</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8 text-center text-sm text-background/50 font-bengali">
          © ২০২৬ প্রশ্নব্যাংক। সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </footer>
  );
};

export default Footer;
