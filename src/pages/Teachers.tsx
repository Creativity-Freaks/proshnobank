import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import { 
  GraduationCap, 
  FileText, 
  Users, 
  BarChart3, 
  Clock,
  CheckCircle,
  PenTool,
  Upload,
  Share2,
  ChevronRight,
  PlayCircle
} from "lucide-react";

const features = [
  {
    icon: PenTool,
    title: "সহজে প্রশ্ন তৈরি",
    description: "MCQ, সংক্ষিপ্ত, রচনামূলক - সব ধরনের প্রশ্ন তৈরি করুন সহজেই",
  },
  {
    icon: Upload,
    title: "প্রশ্নপত্র আপলোড",
    description: "PDF বা Word ফাইল আপলোড করে প্রশ্নপত্র তৈরি করুন",
  },
  {
    icon: Users,
    title: "ক্লাস ম্যানেজমেন্ট",
    description: "আপনার ছাত্রদের গ্রুপে ভাগ করে সহজে পরিচালনা করুন",
  },
  {
    icon: Clock,
    title: "শিডিউল এক্সাম",
    description: "নির্দিষ্ট সময়ে স্বয়ংক্রিয়ভাবে পরীক্ষা শুরু হবে",
  },
  {
    icon: BarChart3,
    title: "বিস্তারিত রিপোর্ট",
    description: "প্রতিটি ছাত্রের পারফরম্যান্স অ্যানালাইসিস দেখুন",
  },
  {
    icon: Share2,
    title: "সহজে শেয়ার",
    description: "লিঙ্ক বা কোড শেয়ার করে ছাত্রদের পরীক্ষায় যুক্ত করুন",
  },
];

const stats = [
  { value: "৫,০০০+", label: "শিক্ষক" },
  { value: "২,০০,০০০+", label: "শিক্ষার্থী" },
  { value: "১,০০,০০০+", label: "পরীক্ষা" },
  { value: "৯৯.৯%", label: "আপটাইম" },
];

const Teachers = () => {
  return (
    <div className="min-h-screen bg-background font-bengali">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary">
                <GraduationCap className="w-4 h-4 mr-1" />
                শিক্ষকদের জন্য
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                অনলাইনে <span className="text-primary">পরীক্ষা নেওয়া</span> এখন আরো সহজ
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                প্রশ্নপত্র তৈরি, পরীক্ষা পরিচালনা এবং স্বয়ংক্রিয় মূল্যায়ন - সবকিছু এক প্ল্যাটফর্মে।
                বিনামূল্যে শুরু করুন।
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/teacher-login">
                  <Button variant="hero" size="lg">
                    টিচার ড্যাশবোর্ডে যান
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
                <Link to="/teacher-register">
                  <Button variant="outline" size="lg">
                    <PlayCircle className="w-5 h-5 mr-2" />
                    শিক্ষক রেজিস্ট্রেশন করুন
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Illustration */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">নতুন পরীক্ষা তৈরি করুন</p>
                      <p className="text-sm text-muted-foreground">৫ মিনিটেই প্রস্তুত</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-muted rounded-full w-full" />
                    <div className="h-3 bg-muted rounded-full w-3/4" />
                    <div className="h-3 bg-muted rounded-full w-5/6" />
                  </div>
                </div>
                
                {/* Floating cards */}
                <div className="absolute -top-4 -right-4 bg-green-100 text-green-700 px-4 py-2 rounded-xl shadow-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">স্বয়ংক্রিয় মূল্যায়ন</span>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-card border border-border px-4 py-3 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-sm">👨</div>
                      <div className="w-8 h-8 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center text-sm">👩</div>
                      <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-sm">👨</div>
                    </div>
                    <span className="text-sm text-muted-foreground">+২৫০ জন অংশ নিচ্ছে</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</p>
                <p className="text-primary-foreground/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              শিক্ষকদের জন্য <span className="text-primary">শক্তিশালী টুলস</span>
            </h2>
            <p className="text-muted-foreground">
              পরীক্ষা পরিচালনার সব কাজ সহজ করতে আমাদের ফিচারগুলো
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-card transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us (modern + animated) */}
      <WhyChooseUsSection
        eyebrow="কেন আমরা"
        title="কেন আমাদের বেছে নেবেন?"
        subtitle="একটা জায়গা থেকেই প্রশ্ন তৈরি, পরীক্ষা নেওয়া, শিডিউল করা এবং মূল্যায়ন—সবকিছু সহজ করুন।"
        points={[
          {
            title: "প্রশ্ন তৈরি দ্রুত",
            description: "MCQ/সংক্ষিপ্ত/রচনামূলক প্রশ্ন তৈরি করে সাথে সাথে ব্যবহার করুন।",
          },
          {
            title: "প্রশ্নপত্র আপলোড",
            description: "PDF/Word আপলোড করে প্রশ্নপত্র ম্যানেজ করতে পারবেন।",
          },
          {
            title: "পরীক্ষা শিডিউল",
            description: "সময় সেট করে অনলাইন এক্সাম চালু করুন এবং মনিটর করুন।",
          },
          {
            title: "রিপোর্ট ও ইনসাইট",
            description: "শিক্ষার্থীদের পারফরম্যান্স বুঝে দ্রুত উন্নতি করান।",
          },
        ]}
      />

      {/* Testimonials */}
      <TestimonialsSection title="টেস্টিমোনিয়াল" subtitle="শিক্ষক ও শিক্ষার্থীদের অভিজ্ঞতা" />

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-primary rounded-3xl p-8 md:p-12 text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              আজই শুরু করুন, সম্পূর্ণ বিনামূল্যে!
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              কোনো ক্রেডিট কার্ড লাগবে না। এখনই রেজিস্ট্রেশন করুন এবং আপনার প্রথম পরীক্ষা তৈরি করুন।
            </p>
            <Link to="/teacher-register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                শিক্ষক রেজিস্ট্রেশন
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Teachers;
