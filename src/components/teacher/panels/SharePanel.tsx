import { useMemo, useState } from "react";
import { Check, Copy, Facebook, MessageCircle, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function SharePanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const inviteLink = useMemo(() => {
    const ref = user?.id ? `?ref=${user.id.slice(0, 8)}` : "";
    return `${origin}/register${ref}`;
  }, [origin, user?.id]);

  const shareText = "ProshnoBank-এ যুক্ত হও — অনলাইন পরীক্ষা, প্রশ্নব্যাংক ও লাইভ এক্সাম এক জায়গায়!";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({ title: "কপি হয়েছে!", description: "ইনভাইট লিংক কপি করা হয়েছে।" });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ title: "ত্রুটি", description: "কপি করা যায়নি।", variant: "destructive" });
    }
  };

  const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`;
  const waShare = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${inviteLink}`)}`;

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" /> সহজে শেয়ার
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            আপনার ইনভাইট লিংক শেয়ার করে শিক্ষার্থী ও সহকর্মীদের ProshnoBank-এ যুক্ত করুন।
          </p>
          <div>
            <Label>ইনভাইট লিংক</Label>
            <div className="mt-2 flex gap-2">
              <Input readOnly value={inviteLink} />
              <Button variant="outline" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <a href={fbShare} target="_blank" rel="noreferrer">
                <Facebook className="mr-2 h-4 w-4" /> Facebook
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={waShare} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>শেয়ার সম্পর্কে</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• লিংকের মাধ্যমে যুক্ত হওয়া শিক্ষার্থীরা সরাসরি রেজিস্ট্রেশন পেজে যাবে।</p>
          <p>• অনলাইন পরীক্ষা তৈরি করলে প্রতিটি পরীক্ষার আলাদা শেয়ারযোগ্য লিংক পাওয়া যায়।</p>
          <p>• সোশ্যাল মিডিয়ায় এক ক্লিকে শেয়ার করুন।</p>
        </CardContent>
      </Card>
    </div>
  );
}
