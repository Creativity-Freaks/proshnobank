import { Cog } from "lucide-react";
import CategoryExamsPage from "@/components/CategoryExamsPage";

const EngineeringExams = () => (
  <CategoryExamsPage
    config={{
      slug: "engineering",
      title: "ইঞ্জিনিয়ারিং ভর্তি",
      subtitle: "BUET, CUET, KUET ভর্তি প্রস্তুতি",
      Icon: Cog,
      gradient: "from-orange-500 to-amber-500",
      heroGradient: "from-orange-500/10 to-amber-500/10",
      examCount: "১৮০+",
      studentCount: "১০০০০+",
      successRate: "৮৮%",
    }}
  />
);

export default EngineeringExams;
