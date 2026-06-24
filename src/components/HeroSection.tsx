import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Award, Users, BookOpen } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

interface HeroContent {
  title: string;
  subtitle: string;
  cta_primary: string;
  cta_secondary: string;
}

const DEFAULT_HERO: HeroContent = {
  title: "তোমার স্বপ্নের লক্ষ্যে পৌঁছে দিতে আমরা আছি",
  subtitle:
    "SSC, HSC, মেডিকেল, ইঞ্জিনিয়ারিং, বিশ্ববিদ্যালয় ভর্তি এবং চাকরির পরীক্ষার জন্য সম্পূর্ণ প্রস্তুতি নাও। লাইভ এক্সাম, প্রশ্নব্যাংক, লিডারবোর্ড সব এক জায়গায়।",
  cta_primary: "এখনই শুরু করো",
  cta_secondary: "ফ্রি ট্রায়াল নাও",
};

const HeroSection = () => {
  const { data: hero } = useSiteContent<HeroContent>("hero", DEFAULT_HERO);

  return (
    <section className="relative min-h-[100dvh] bg-gradient-hero overflow-hidden pt-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-12rem)]">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in text-center lg:text-left flex flex-col items-center lg:items-start">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground px-4 py-2 rounded-full text-sm font-bengali mx-auto lg:mx-0">
              <Award className="w-4 h-4" />
              বাংলাদেশের #১ অনলাইন পরীক্ষা প্ল্যাটফর্ম
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground font-bengali leading-tight">
              {hero.title}
            </h1>

            <p className="text-lg text-primary-foreground/80 font-bengali max-w-xl mx-auto lg:mx-0">
              {hero.subtitle}
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Link to="/register">
                <Button variant="accent" size="xl">
                  <Play className="w-5 h-5" />
                  {hero.cta_primary}
                </Button>
              </Link>
              <Link to="/live-exams">
                <Button variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  {hero.cta_secondary}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-8 border-t border-primary-foreground/20 w-full">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-foreground">৫০০+</div>
                <div className="text-sm text-primary-foreground/70 font-bengali">এক্সাম ব্যাচ</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-foreground">৫ লাখ+</div>
                <div className="text-sm text-primary-foreground/70 font-bengali">প্রশ্ন</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-foreground">১০ লাখ+</div>
                <div className="text-sm text-primary-foreground/70 font-bengali">শিক্ষার্থী</div>
              </div>
            </div>
          </div>

          {/* Right Content - Floating Cards */}
          <div className="relative hidden lg:block">
            <div className="absolute top-0 right-0 w-64 bg-card rounded-2xl p-6 shadow-lg animate-float" style={{ animationDelay: "0s" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-bold font-bengali text-card-foreground">লাইভ এক্সাম</div>
                  <div className="text-sm text-muted-foreground font-bengali">আজ রাত ৯টায়</div>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-primary rounded-full" />
              </div>
              <div className="text-xs text-muted-foreground mt-2 font-bengali">১২৫০ জন অংশগ্রহণ করেছে</div>
            </div>

            <div className="absolute top-40 left-10 w-56 bg-card rounded-2xl p-5 shadow-lg animate-float" style={{ animationDelay: "0.5s" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-secondary flex items-center justify-center">
                  <Users className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <div className="font-bold font-bengali text-card-foreground">লিডারবোর্ড</div>
                  <div className="text-xs text-muted-foreground font-bengali">তোমার র‍্যাংক: #১২</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 right-20 w-60 bg-card rounded-2xl p-5 shadow-lg animate-float" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center">
                  <Award className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <div className="font-bold font-bengali text-card-foreground">সার্টিফিকেট</div>
                  <div className="text-xs text-muted-foreground font-bengali">মেডিকেল মডেল টেস্ট</div>
                </div>
              </div>
              <div className="text-lg font-bold text-secondary font-bengali">৮৫% স্কোর অর্জন!</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
