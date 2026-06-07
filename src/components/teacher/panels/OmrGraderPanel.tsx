import { useMemo, useState } from "react";
import { Calculator, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { gradeOmr, parseAnswers, type OmrResult } from "@/lib/teacherPaper";

type StudentResult = OmrResult & { roll: string };

export default function OmrGraderPanel() {
  const { toast } = useToast();
  const [answerKey, setAnswerKey] = useState("");
  const [marksPer, setMarksPer] = useState("1");
  const [negative, setNegative] = useState("0.25");
  const [responses, setResponses] = useState("");
  const [results, setResults] = useState<StudentResult[]>([]);

  const keyArray = useMemo(() => parseAnswers(answerKey), [answerKey]);

  const handleGrade = () => {
    if (keyArray.length === 0) {
      toast({ title: "ত্রুটি", description: "প্রথমে উত্তরমালা (Answer Key) দিন।", variant: "destructive" });
      return;
    }
    const marks = Number(marksPer) || 1;
    const neg = Math.max(0, Number(negative) || 0);

    const lines = responses
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      toast({ title: "ত্রুটি", description: "শিক্ষার্থীর উত্তর দিন (প্রতি লাইনে একজন)।", variant: "destructive" });
      return;
    }

    const graded: StudentResult[] = lines.map((line, idx) => {
      const [rollPart, ...answerParts] = line.split(/[:\t]/);
      const hasRoll = answerParts.length > 0;
      const roll = hasRoll ? rollPart.trim() : `#${idx + 1}`;
      const answerText = hasRoll ? answerParts.join(" ") : line;
      const result = gradeOmr(keyArray, parseAnswers(answerText), marks, neg);
      return { roll, ...result };
    });

    setResults(graded);
    toast({ title: "সম্পন্ন!", description: `${graded.length} জনের রেজাল্ট তৈরি হয়েছে।` });
  };

  const handleExportCsv = () => {
    if (results.length === 0) return;
    const header = "Roll,Correct,Wrong,Blank,Score,Total";
    const rows = results.map((r) => `${r.roll},${r.correct},${r.wrong},${r.blank},${r.score},${r.total}`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "omr-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>উত্তরমালা ও সেটিংস</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>উত্তরমালা (Answer Key)</Label>
            <Textarea
              className="mt-2 font-mono"
              rows={3}
              value={answerKey}
              onChange={(e) => setAnswerKey(e.target.value)}
              placeholder="যেমন: A B C D A ... (স্পেস বা কমা দিয়ে আলাদা)"
            />
            <p className="mt-1 text-xs text-muted-foreground">শনাক্ত হয়েছে: {keyArray.length} টি প্রশ্ন</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>প্রতি প্রশ্নে মার্কস</Label>
              <Input className="mt-2" type="number" step="0.25" value={marksPer} onChange={(e) => setMarksPer(e.target.value)} />
            </div>
            <div>
              <Label>নেগেটিভ মার্কস</Label>
              <Input className="mt-2" type="number" step="0.25" value={negative} onChange={(e) => setNegative(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>শিক্ষার্থীদের উত্তর</Label>
            <Textarea
              className="mt-2 font-mono"
              rows={6}
              value={responses}
              onChange={(e) => setResponses(e.target.value)}
              placeholder={"প্রতি লাইনে একজন:\n101: A B C D A\n102: A C C D B"}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              ফরম্যাট: রোল : উত্তরসমূহ (রোল না দিলে অটো নম্বর হবে)।
            </p>
          </div>
          <Button onClick={handleGrade}>
            <Calculator className="mr-2 h-4 w-4" /> মূল্যায়ন করুন
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>রেজাল্ট</CardTitle>
          {results.length > 0 ? (
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-sm text-muted-foreground">এখনো কোনো রেজাল্ট নেই। উত্তর দিয়ে মূল্যায়ন করুন।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-2">রোল</th>
                    <th className="py-2 pr-2">সঠিক</th>
                    <th className="py-2 pr-2">ভুল</th>
                    <th className="py-2 pr-2">খালি</th>
                    <th className="py-2 pr-2">স্কোর</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.roll} className="border-b last:border-0">
                      <td className="py-2 pr-2 font-medium">{r.roll}</td>
                      <td className="py-2 pr-2 text-green-600">{r.correct}</td>
                      <td className="py-2 pr-2 text-red-600">{r.wrong}</td>
                      <td className="py-2 pr-2">{r.blank}</td>
                      <td className="py-2 pr-2 font-semibold">
                        {r.score}/{r.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
