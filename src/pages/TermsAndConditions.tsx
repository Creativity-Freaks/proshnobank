import { usePageMeta } from "@/hooks/usePageMeta";

export default function TermsAndConditions() {
  usePageMeta({
    title: "Terms and Conditions",
    description: "প্রশ্নব্যাংকের টার্মস অ্যান্ড কন্ডিশনস।",
  });

  return (
    <div className="min-h-screen bg-background font-bengali">
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Terms and Conditions</h1>
          <p className="text-muted-foreground leading-relaxed">
            প্রশ্নব্যাংক ব্যবহার করার সময় প্রযোজ্য শর্তাবলি এই পেইজে উল্লেখ থাকবে। সার্ভিস ব্যবহার করার মাধ্যমে আপনি এই
            শর্তাবলিতে সম্মতি দিচ্ছেন বলে গণ্য হবে।
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground mb-2">অ্যাকাউন্ট ও দায়িত্ব</h2>
              <p className="text-muted-foreground">
                আপনার অ্যাকাউন্টের নিরাপত্তা বজায় রাখা এবং সঠিক তথ্য প্রদান আপনার দায়িত্ব।
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground mb-2">সার্ভিস ব্যবহার</h2>
              <p className="text-muted-foreground">
                প্ল্যাটফর্মের অপব্যবহার বা অননুমোদিত কার্যক্রম নিরুৎসাহিত করা হয় এবং প্রয়োজনে ব্যবস্থা নেওয়া হতে পারে।
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
