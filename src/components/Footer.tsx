import { Link } from "react-router-dom";
import { Facebook, Youtube, Instagram, Mail, Phone } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="space-y-4">
            <Link to="/" className="flex items-center justify-center md:justify-start gap-2">
              <BrandLogo size="md" textClassName="text-xl text-background" />
            </Link>
            <p className="text-background/70 font-bengali text-sm">
              বাংলাদেশের সেরা অনলাইন পরীক্ষা প্ল্যাটফর্ম। তোমার স্বপ্নের লক্ষ্যে পৌঁছে দিতে আমরা আছি।
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              <a
                href="https://www.facebook.com/aacwith10ms"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.youtube.com/@DevPreneur"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/proshnobank_by_aac"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold font-bengali text-lg mb-4">দ্রুত লিংক</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/batches" className="text-background/70 hover:text-background font-bengali transition-colors">
                  এক্সাম ব্যাচ
                </Link>
              </li>
              <li>
                <Link to="/question-bank" className="text-background/70 hover:text-background font-bengali transition-colors">
                  প্রশ্নব্যাংক
                </Link>
              </li>
              <li>
                <Link to="/live-exams" className="text-background/70 hover:text-background font-bengali transition-colors">
                  লাইভ এক্সাম
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-background/70 hover:text-background font-bengali transition-colors">
                  লিডারবোর্ড
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold font-bengali text-lg mb-4">শিক্ষকদের জন্য</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/teachers" className="text-background/70 hover:text-background font-bengali transition-colors">
                  প্রশ্ন তৈরী করুন
                </Link>
              </li>
              <li>
                <Link to="/teachers" className="text-background/70 hover:text-background font-bengali transition-colors">
                  OMR মূল্যায়ন
                </Link>
              </li>
              <li>
                <Link to="/teachers" className="text-background/70 hover:text-background font-bengali transition-colors">
                  অনলাইন পরীক্ষা
                </Link>
              </li>
              <li>
                <Link to="/teacher-dashboard" className="text-background/70 hover:text-background font-bengali transition-colors">
                  টিচার প্যানেল
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold font-bengali text-lg mb-4">যোগাযোগ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-center md:justify-start gap-2 text-background/70">
                <Mail className="w-4 h-4" />
                <a href="mailto:info.proshnobank@gmail.com" className="hover:text-background transition-colors">
                  info.proshnobank@gmail.com
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2 text-background/70">
                <Phone className="w-4 h-4" />
                <a href="tel:01642948324" className="hover:text-background transition-colors">
                  01642948324
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-6">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-background/70 font-bengali">
            <Link to="/about" className="hover:text-background transition-colors">
              About Us
            </Link>
            <span className="text-background/30">|</span>
            <Link to="/privacy-policy" className="hover:text-background transition-colors">
              Privacy Policy
            </Link>
            <span className="text-background/30">|</span>
            <Link to="/refund-policy" className="hover:text-background transition-colors">
              Refund Policy
            </Link>
            <span className="text-background/30">|</span>
            <Link to="/terms-and-conditions" className="hover:text-background transition-colors">
              Terms and Conditions
            </Link>
          </div>

          <div className="pt-6 text-center text-sm text-background/50 font-bengali">
            © २०२६ प्रश्नब्यांक। सर्वस्वत्ष संरक्षित।
          </div>

          <div className="pt-4 text-center text-xs text-background/40 font-bengali">
            <p>
              Powered by{' '}
              <a
                href="https://cf-techlab.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-background/60 hover:text-background transition-colors underline"
              >
                CF Techlab
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
