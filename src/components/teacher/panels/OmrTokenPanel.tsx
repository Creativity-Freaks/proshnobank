import { useState } from "react";
import { Copy, KeyRound, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { parseAnswers } from "@/lib/teacherPaper";

function randomToken(): string {
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `OMR-${part()}-${part()}`;
}

export default function OmrTokenPanel() {
  const { toast } = useToast();
  const [examName, setExamName] = useState("");
  const [answerKey, setAnswerKey] = useState("");
  const [token, setToken] = useState(randomToken());

  const keyCount = parseAnswers(answerKey).length;

  const handleCopy = async () => {
    const payload = [
      `Exam: ${examName || "Untitled"}`,
      `Token: ${token}`,
      `Questions: ${keyCount}`,
      `Answer Key: ${parseAnswers(answerKey).join(" ")}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(payload);
      toast({ title: "কপি হয়েছে!", description: "টোকেন ও উত্তরমালা কপি করা হয়েছে।" });
    } catch {
      toast({ title: "ত্রুটি", description: "কপি করা যায়নি।", variant: "destructive" });
    }
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" /> OMR টোকেন তৈরী
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            প্রতিটি পরীক্ষার জন্য একটি ইউনিক টোকেন ও উত্তরমালা তৈরি করুন, যা মূল্যায়নকারীর সাথে শেয়ার করতে পারবেন।
          </p>
          <div>
            <Label>পরীক্ষার নাম</Label>
            <Input className="mt-2" value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="যেমন: HSC মডেল টেস্ট ০১" />
          </div>
          <div>
            <Label>উত্তরমালা</Label>
            <Textarea
              className="mt-2 font-mono"
              rows={3}
              value={answerKey}
              onChange={(e) => setAnswerKey(e.target.value)}
              placeholder="A B C D A ..."
            />
            <p className="mt-1 text-xs text-muted-foreground">শনাক্ত হয়েছে: {keyCount} টি প্রশ্ন</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setToken(randomToken())}>
              <RefreshCw className="mr-2 h-4 w-4" /> নতুন টোকেন
            </Button>
            <Button onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" /> কপি করুন
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>টোকেন</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <div className="text-xs uppercase text-muted-foreground">Exam Token</div>
            <div className="mt-2 text-2xl font-bold tracking-widest text-primary">{token}</div>
            <div className="mt-3 text-sm text-muted-foreground">{examName || "নাম দেওয়া হয়নি"}</div>
            <div className="text-sm text-muted-foreground">{keyCount} টি প্রশ্ন</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
