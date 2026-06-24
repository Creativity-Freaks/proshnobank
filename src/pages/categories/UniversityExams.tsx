import { Building2 } from "lucide-react";
import CategoryExamsPage from "@/components/CategoryExamsPage";

const UniversityExams = () => (
  <CategoryExamsPage
    config={{
      slug: "university",
      title: "বিশ্ববিদ্যালয় ভর্তি",
      subtitle: "ঢাবি, জাবি, রাবি ভর্তি প্রস্তুতি",
      Icon: Building2,
      gradient: "from-rose-500 to-red-500",
      heroGradient: "from-rose-500/10 to-red-500/10",
      examCount: "২৫০+",
      studentCount: "১৫০০০+",
      successRate: "৮৭%",
    }}
  />
);

export default UniversityExams;
