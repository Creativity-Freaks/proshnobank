import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ExamCategories from "@/components/ExamCategories";
import LiveExamCard from "@/components/LiveExamCard";
import FeaturesSection from "@/components/FeaturesSection";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";

const Index = () => {
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
