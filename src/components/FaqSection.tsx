import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSiteContent } from "@/hooks/useSiteContent";

type FaqItem = {
  question: string;
  answer: string;
};

const defaultItems: FaqItem[] = [
  {
    question: "প্রশ্নব্যাংক কীভাবে কাজ করে?",
    answer:
      "প্রশ্নব্যাংকে তুমি প্রশ্ন অনুশীলন করতে পারবে, লাইভ এক্সামে অংশ নিতে পারবে এবং নিজের প্রগ্রেস ট্র্যাক করতে পারবে।",
  },
  {
    question: "লাইভ এক্সামে কীভাবে অংশ নেব?",
    answer:
      "লাইভ এক্সাম পেইজে গিয়ে চলমান/আসন্ন এক্সাম দেখো। সময় হলে এক্সামে ঢুকে প্রশ্নের উত্তর দাও এবং সাবমিট করো।",
  },
  {
    question: "শিক্ষক হিসেবে কী কী করতে পারব?",
    answer:
      "শিক্ষকরা প্রশ্ন তৈরি/এডিট করতে পারবেন, প্রশ্ন সিলেক্ট করে প্রশ্নপত্র বানাতে পারবেন, অনলাইন পরীক্ষা শিডিউল করতে পারবেন এবং প্রশ্নপত্র আপলোড করতে পারবেন।",
  },
  {
    question: "ফলাফল/র‍্যাঙ্কিং কীভাবে দেখা যাবে?",
    answer:
      "পরীক্ষা শেষ হলে লিডারবোর্ডে র‍্যাঙ্কিং দেখা যাবে। ড্যাশবোর্ডে নিজের স্কোর ও পারফরম্যান্সের সারাংশও থাকবে।",
  },
  {
    question: "মোবাইলে ব্যবহার করা যাবে?",
    answer:
      "হ্যাঁ, প্ল্যাটফর্মটি মোবাইল ফ্রেন্ডলি—মোবাইল থেকেই অনুশীলন ও পরীক্ষা দেওয়া যাবে।",
  },
];

export default function FaqSection({
  title = "FAQ",
  subtitle = "সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্ন",
  items = defaultItems,
}: {
  title?: string;
  subtitle?: string;
  items?: FaqItem[];
}) {
  const { data: content } = useSiteContent<{ items?: Array<Record<string, unknown>> }>("faq", {});
  const dynamic = Array.isArray(content?.items) && content.items.length > 0
    ? content.items.map((r) => ({
        question: String(r.question ?? r.q ?? ""),
        answer: String(r.answer ?? r.a ?? ""),
      }))
    : null;
  const faqItems = dynamic ?? items;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-sm text-primary font-semibold tracking-wide">{title}</p>
          <h2 className="text-3xl font-bold text-foreground mt-2">{subtitle}</h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-bengali">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-bengali">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
