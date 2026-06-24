import HeroSection from "@/components/HeroSection";
import ExamCategories from "@/components/ExamCategories";
import LiveExamCard from "@/components/LiveExamCard";
import FeaturesSection from "@/components/FeaturesSection";
import StatsSection from "@/components/StatsSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";
import PricingSection from "@/components/PricingSection";
import { usePageMeta } from "@/hooks/usePageMeta";

const Index = () => {
  usePageMeta({
    title: "হোম",
    description: "বাংলা-ফার্স্ট অনলাইন পরীক্ষা প্ল্যাটফর্মে লাইভ এক্সাম, প্রশ্নব্যাংক এবং র‍্যাংকিং সুবিধা।",
  });

  return (
    <div className="min-h-screen bg-background font-bengali">
      <HeroSection />
      <ExamCategories />
      <LiveExamCard />
      <FeaturesSection />
      <WhyChooseUsSection
        eyebrow="কেন প্রশ্নব্যাংক"
        title="কেন আমরা সেরা?"
        subtitle="যে কারণে শিক্ষার্থী ও শিক্ষকরা প্রশ্নব্যাংক বেছে নেন—দ্রুত, আধুনিক এবং ফলাফল-কেন্দ্রিক অভিজ্ঞতা।"
      />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection title="FAQ" subtitle="হোমের গুরুত্বপূর্ণ প্রশ্নগুলো" />
      <StatsSection />
    </div>
  );
};

export default Index;
