import { GraduationCap } from "lucide-react";
import CategoryExamsPage from "@/components/CategoryExamsPage";

const SSCExams = () => (
  <CategoryExamsPage
    config={{
      slug: "ssc",
      title: "SSC পরীক্ষা",
      subtitle: "এসএসসি বোর্ড পরীক্ষার প্রস্তুতি",
      Icon: GraduationCap,
      gradient: "from-blue-500 to-cyan-500",
      heroGradient: "from-blue-500/10 to-cyan-500/10",
      examCount: "১২০+",
      studentCount: "৫০০০+",
      successRate: "৯২%",
    }}
  />
);

export default SSCExams;
