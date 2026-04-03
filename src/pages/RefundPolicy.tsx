import { usePageMeta } from "@/hooks/usePageMeta";

export default function RefundPolicy() {
  usePageMeta({
    title: "Refund Policy",
    description: "প্রশ্নব্যাংকের রিফান্ড পলিসি।",
  });

  return (
    <div className="min-h-screen bg-background font-bengali">
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Refund Policy</h1>
          <p className="text-muted-foreground leading-relaxed">
            পেমেন্ট/সাবস্ক্রিপশন সংক্রান্ত রিফান্ড নীতিমালা এই পেইজে উল্লেখ থাকবে। প্রয়োজন অনুযায়ী আমরা এই পলিসি আপডেট
            করতে পারি।
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-bold text-foreground mb-2">রিফান্ড অনুরোধ</h2>
            <p className="text-muted-foreground">
              রিফান্ড সংক্রান্ত সাহায্যের জন্য আপনার পেমেন্ট তথ্যসহ আমাদের সাপোর্টে যোগাযোগ করুন।
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
