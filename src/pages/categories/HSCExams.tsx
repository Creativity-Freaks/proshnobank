import { GraduationCap } from "lucide-react";
import CategoryExamsPage from "@/components/CategoryExamsPage";

const HSCExams = () => (
  <CategoryExamsPage
    config={{
      slug: "hsc",
      title: "HSC পরীক্ষা",
      subtitle: "এইচএসসি বোর্ড পরীক্ষার প্রস্তুতি",
      Icon: GraduationCap,
      gradient: "from-purple-500 to-pink-500",
      heroGradient: "from-purple-500/10 to-pink-500/10",
      examCount: "১৫০+",
      studentCount: "৮০০০+",
      successRate: "৯০%",
    }}
  />
);

export default HSCExams;
