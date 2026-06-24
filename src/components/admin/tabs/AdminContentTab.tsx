import { useEffect, useState } from "react";
import { Save, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { contentApi } from "@/lib/content-api";
import { useAdmin } from "@/contexts/AdminContext";

const CONTENT_KEYS = [
  { key: "hero", label: "হিরো সেকশন (title, subtitle, cta_primary, cta_secondary)" },
  { key: "stats", label: "স্ট্যাটস সেকশন (items: [{value, label}])" },
  { key: "features", label: "ফিচার সেকশন (title, items: [{icon, title, desc}])" },
  { key: "why_choose", label: "কেন আমরা সেকশন (title, items: [{title, desc}])" },
  { key: "testimonials", label: "টেস্টিমোনিয়াল (items: [{name, role, text, rating}])" },
  { key: "faq", label: "FAQ (items: [{q, a}])" },
];

type ContentMap = Record<string, string>;

export default function AdminContentTab() {
  const { toast } = useToast();
  const { refreshTrigger } = useAdmin();
  const [values, setValues] = useState<ContentMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      const all = await contentApi.getAll();
      const mapped: ContentMap = {};
      for (const { key } of CONTENT_KEYS) {
        mapped[key] = all[key] ? JSON.stringify(all[key], null, 2) : "";
      }
      setValues(mapped);
    } catch (e) {
      toast({ title: "ত্রুটি", description: "কন্টেন্ট লোড হয়নি।", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [refreshTrigger]);

  const handleSave = async (key: string) => {
    const raw = values[key]?.trim();
    if (!raw) {
      toast({ title: "ত্রুটি", description: "কন্টেন্ট খালি রাখা যাবে না।", variant: "destructive" });
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      toast({ title: "ত্রুটি", description: "বৈধ JSON লিখুন।", variant: "destructive" });
      return;
    }
    try {
      setSaving(key);
      await contentApi.set(key, parsed);
      toast({ title: "সফল!", description: `${key} সেভ হয়েছে।` });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "সেভ করতে সমস্যা হয়েছে।";
      toast({ title: "ত্রুটি", description: msg, variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          এখানে ল্যান্ডিং পেজের সব সেকশনের কন্টেন্ট JSON ফরম্যাটে সম্পাদনা করুন। সেভ করলে তাৎক্ষণিকভাবে লাইভ হবে।
        </p>
        <Button variant="outline" size="sm" onClick={loadAll}>
          <RefreshCw className="mr-2 h-4 w-4" /> রিফ্রেশ
        </Button>
      </div>

      {CONTENT_KEYS.map(({ key, label }) => (
        <Card key={key}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">key: {key}</Label>
              <Textarea
                rows={10}
                className="font-mono text-xs"
                value={values[key] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [key]: e.target.value }))
                }
                placeholder={`{"${key}": ...}`}
              />
            </div>
            <Button
              size="sm"
              onClick={() => handleSave(key)}
              disabled={saving === key}
            >
              {saving === key ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              সেভ করুন
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
