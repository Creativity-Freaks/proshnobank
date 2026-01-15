import { 
  Clock, 
  Trophy, 
  FileText, 
  Bookmark, 
  History, 
  Target,
  ScanLine,
  FileQuestion,
  Users
} from "lucide-react";

const studentFeatures = [
  {
    icon: Clock,
    title: "লাইভ এক্সাম",
    description: "রিয়েল এক্সাম হলের মতো পরিবেশে লাইভ পরীক্ষায় অংশ নাও",
  },
  {
    icon: Trophy,
    title: "লিডারবোর্ড",
    description: "দেশব্যাপী মেধাবী শিক্ষার্থীদের সাথে প্রতিযোগিতা করো",
  },
  {
    icon: FileText,
    title: "প্রশ্নব্যাংক",
    description: "বিগত বছরের প্রশ্ন দিয়ে পরীক্ষার প্যাটার্ন বুঝো",
  },
  {
    icon: Bookmark,
    title: "বুকমার্ক",
    description: "গুরুত্বপূর্ণ প্রশ্ন বুকমার্ক করে রাখো রিভিশনের জন্য",
  },
  {
    icon: History,
    title: "হিস্ট্রি",
    description: "তোমার প্রতিটি এক্সামের স্কোর ও প্রগ্রেস ট্র্যাক করো",
  },
  {
    icon: Target,
    title: "পার্সোনালাইজড এক্সাম",
    description: "নিজের পছন্দ মতো বিষয় ও অধ্যায় বেছে নিয়ে এক্সাম দাও",
  },
];

const teacherFeatures = [
  {
    icon: FileQuestion,
    title: "১ ক্লিকে প্রশ্ন তৈরী",
    description: "৫ লাখ+ প্রশ্ন থেকে অটোমেটিক প্রফেশনাল প্রশ্নপত্র তৈরী করুন",
  },
  {
    icon: ScanLine,
    title: "OMR মূল্যায়ন",
    description: "মোবাইল দিয়েই রিয়েল-টাইম OMR স্ক্যান ও মূল্যায়ন করুন",
  },
  {
    icon: Users,
    title: "অনলাইন পরীক্ষা",
    description: "সিকিউর লিংক দিয়ে অনলাইন পরীক্ষা নিন ও রিপোর্ট পান",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Student Features */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-bengali mb-4">
              শিক্ষার্থীদের জন্য
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-bengali text-foreground mb-4">
              তোমার প্রস্তুতিকে করে তুলো <span className="text-primary">আরও শক্তিশালী</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studentFeatures.map((feature, index) => (
              <div
                key={index}
                className="group flex gap-4 p-6 bg-card rounded-2xl shadow-card hover:shadow-lg transition-all duration-300 border border-border"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold font-bengali text-card-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-bengali">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Features */}
        <div id="teachers">
          <div className="text-center mb-12">
            <span className="inline-block bg-secondary/20 text-secondary px-4 py-1 rounded-full text-sm font-bengali mb-4">
              শিক্ষকদের জন্য
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-bengali text-foreground mb-4">
              পরীক্ষা নেওয়া এখন <span className="text-secondary">আরও সহজ</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teacherFeatures.map((feature, index) => (
              <div
                key={index}
                className="group text-center p-8 bg-card rounded-2xl shadow-card hover:shadow-lg transition-all duration-300 border border-border hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-secondary flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-bold font-bengali text-card-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground font-bengali">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
