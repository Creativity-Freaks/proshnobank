import { Facebook, Mail, MessageCircle, Phone, Youtube } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CONTACTS = [
  { icon: Phone, label: "মোবাইল", value: "01642948324", href: "tel:01642948324" },
  { icon: Mail, label: "ইমেইল", value: "info.proshnobank@gmail.com", href: "mailto:info.proshnobank@gmail.com" },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "চ্যাট করুন",
    href: "https://wa.me/8801642948324",
  },
  { icon: Facebook, label: "Facebook", value: "ProshnoBank", href: "https://www.facebook.com/aacwith10ms" },
  { icon: Youtube, label: "YouTube", value: "DevPreneur", href: "https://www.youtube.com/@DevPreneur" },
];

export default function ContactPanel() {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>যোগাযোগ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            যেকোনো সহায়তা, প্রশ্ন বা সমস্যার জন্য আমাদের সাথে যোগাযোগ করুন। আমরা শনি-বৃহস্পতি, সকাল ১০টা - রাত ৮টা পর্যন্ত
            available থাকি।
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {CONTACTS.map((c) => {
              const Icon = c.icon;
              return (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-border p-3 transition hover:border-primary hover:bg-primary/5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-xs text-muted-foreground">{c.label}</span>
                    <span className="block text-sm font-medium">{c.value}</span>
                  </span>
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>অফিস</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>ProshnoBank — বাংলাদেশের অনলাইন পরীক্ষা ও প্রশ্নপত্র তৈরির প্ল্যাটফর্ম।</p>
          <p>সাপোর্ট টিম দ্রুততম সময়ে আপনার মেসেজের উত্তর দেওয়ার চেষ্টা করে।</p>
        </CardContent>
      </Card>
    </div>
  );
}
