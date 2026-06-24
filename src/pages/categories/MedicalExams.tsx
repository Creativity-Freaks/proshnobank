import { Stethoscope } from "lucide-react";
import CategoryExamsPage from "@/components/CategoryExamsPage";

const MedicalExams = () => (
  <CategoryExamsPage
    config={{
      slug: "medical",
      title: "মেডিকেল ভর্তি",
      subtitle: "MBBS ভর্তি পরীক্ষার প্রস্তুতি",
      Icon: Stethoscope,
      gradient: "from-emerald-500 to-teal-500",
      heroGradient: "from-emerald-500/10 to-teal-500/10",
      examCount: "২০০+",
      studentCount: "১২০০০+",
      successRate: "৮৫%",
    }}
  />
);

export default MedicalExams;
