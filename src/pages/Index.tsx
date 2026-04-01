import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ExamCategories from "@/components/ExamCategories";
import LiveExamCard from "@/components/LiveExamCard";
import FeaturesSection from "@/components/FeaturesSection";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";
import { usePageMeta } from "@/hooks/usePageMeta";

const Index = () => {
  usePageMeta({
    title: "হোম",
    description: "বাংলা-ফার্স্ট অনলাইন পরীক্ষা প্ল্যাটফর্মে লাইভ এক্সাম, প্রশ্নব্যাংক এবং র‍্যাংকিং সুবিধা।",
  });

  return (
    <div className="min-h-screen bg-background font-bengali">
      <Navbar />
      <HeroSection />
      <ExamCategories />
      <LiveExamCard />
      <FeaturesSection />
      <StatsSection />
      <Footer />
    </div>
  );
};

export default Index;
