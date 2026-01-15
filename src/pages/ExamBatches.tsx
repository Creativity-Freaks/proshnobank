import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Stethoscope, 
  Cog, 
  Building2, 
  Briefcase, 
  Users, 
  Clock, 
  BookOpen,
  Star,
  ChevronRight
} from "lucide-react";

const batches = [
  {
    id: 1,
    title: "SSC 2026 সম্পূর্ণ প্রস্তুতি",
    icon: GraduationCap,
    description: "SSC পরীক্ষার জন্য সম্পূর্ণ প্রস্তুতি - সকল বিষয়",
    color: "from-blue-500 to-cyan-500",
    students: 2500,
    exams: 120,
    duration: "৬ মাস",
    price: "৫৯৯ টাকা",
    originalPrice: "৯৯৯ টাকা",
    rating: 4.8,
    features: ["১২০+ মডেল টেস্ট", "সাপ্তাহিক পরীক্ষা", "ভিডিও সমাধান", "লাইভ ক্লাস"],
  },
  {
    id: 2,
    title: "HSC 2026 Science Batch",
    icon: GraduationCap,
    description: "HSC বিজ্ঞান বিভাগের সম্পূর্ণ প্রস্তুতি",
    color: "from-purple-500 to-pink-500",
    students: 1800,
    exams: 150,
    duration: "১ বছর",
    price: "৭৯৯ টাকা",
    originalPrice: "১২৯৯ টাকা",
    rating: 4.9,
    features: ["১৫০+ মডেল টেস্ট", "বিষয়ভিত্তিক টেস্ট", "PDF নোট", "মেন্টর সাপোর্ট"],
  },
  {
    id: 3,
    title: "মেডিকেল ভর্তি ২০২৬",
    icon: Stethoscope,
    description: "MBBS ভর্তি পরীক্ষার জন্য সেরা প্রস্তুতি",
    color: "from-emerald-500 to-teal-500",
    students: 3200,
    exams: 200,
    duration: "৮ মাস",
    price: "১২৯৯ টাকা",
    originalPrice: "১৯৯৯ টাকা",
    rating: 4.9,
    features: ["২০০+ মডেল টেস্ট", "বিগত বছরের প্রশ্ন", "টপিক ওয়াইজ টেস্ট", "র‍্যাংক টেস্ট"],
  },
  {
    id: 4,
    title: "ইঞ্জিনিয়ারিং ভর্তি ২০২৬",
    icon: Cog,
    description: "BUET, CUET, KUET সহ সকল ইঞ্জিনিয়ারিং ভর্তি",
    color: "from-orange-500 to-amber-500",
    students: 2100,
    exams: 180,
    duration: "৮ মাস",
    price: "১০৯৯ টাকা",
    originalPrice: "১৭৯৯ টাকা",
    rating: 4.7,
    features: ["১৮০+ মডেল টেস্ট", "ইউনিভার্সিটি ভিত্তিক টেস্ট", "ম্যাথ ফোকাস", "ফিজিক্স স্পেশাল"],
  },
  {
    id: 5,
    title: "বিশ্ববিদ্যালয় ভর্তি - ক ইউনিট",
    icon: Building2,
    description: "ঢাবি, জাবি, রাবি ক ইউনিট সম্পূর্ণ প্রস্তুতি",
    color: "from-rose-500 to-red-500",
    students: 1500,
    exams: 160,
    duration: "৬ মাস",
    price: "৮৯৯ টাকা",
    originalPrice: "১৪৯৯ টাকা",
    rating: 4.6,
    features: ["১৬০+ মডেল টেস্ট", "বিশ্ববিদ্যালয় ভিত্তিক", "সাম্প্রতিক প্যাটার্ন", "ফ্রি আপডেট"],
  },
  {
    id: 6,
    title: "BCS প্রিলিমিনারি ২০২৬",
    icon: Briefcase,
    description: "৪৭তম BCS প্রিলিমিনারি সম্পূর্ণ প্রস্তুতি",
    color: "from-indigo-500 to-violet-500",
    students: 5500,
    exams: 300,
    duration: "১ বছর",
    price: "১৪৯৯ টাকা",
    originalPrice: "২৪৯৯ টাকা",
    rating: 4.9,
    features: ["৩০০+ মডেল টেস্ট", "বিষয়ভিত্তিক প্র্যাকটিস", "সাম্প্রতিক তথ্য", "Daily Quiz"],
  },
];

const ExamBatches = () => {
  return (
    <div className="min-h-screen bg-background font-bengali">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              তোমার জন্য <span className="text-primary">সেরা এক্সাম ব্যাচ</span>
            </h1>
            <p className="text-muted-foreground mb-4">
              সঠিক ব্যাচ বেছে নিয়ে তোমার স্বপ্নের লক্ষ্যে পৌঁছে যাও। 
              এক্সপার্ট মেন্টরদের সাথে সেরা প্রস্তুতি নাও।
            </p>
          </div>
        </div>
      </section>

      {/* Batches Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-card transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Header */}
                <div className={`bg-gradient-to-br ${batch.color} p-6 text-white`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <batch.icon className="w-8 h-8" />
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                      <span className="text-sm font-medium">{batch.rating}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{batch.title}</h3>
                  <p className="text-white/80 text-sm">{batch.description}</p>
                </div>

                {/* Body */}
                <div className="p-6">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-foreground">{batch.students}+</span>
                      <p className="text-xs text-muted-foreground">শিক্ষার্থী</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-foreground">{batch.exams}+</span>
                      <p className="text-xs text-muted-foreground">এক্সাম</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-foreground">{batch.duration}</span>
                      <p className="text-xs text-muted-foreground">মেয়াদ</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {batch.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-primary">{batch.price}</span>
                      <span className="text-sm text-muted-foreground line-through ml-2">
                        {batch.originalPrice}
                      </span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      ৪০% ছাড়
                    </Badge>
                  </div>

                  <Link to={`/batch/${batch.id}`}>
                    <Button variant="hero" className="w-full">
                      ব্যাচে ভর্তি হও
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ExamBatches;
