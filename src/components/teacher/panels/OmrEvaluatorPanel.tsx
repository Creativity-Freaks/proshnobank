import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OmrGraderPanel from "@/components/teacher/panels/OmrGraderPanel";
import OmrSheetPanel from "@/components/teacher/panels/OmrSheetPanel";

export default function OmrEvaluatorPanel() {
  return (
    <div className="mt-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>OMR Evaluator</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          OMR শিট তৈরি করুন, পরীক্ষা নিন, এবং উত্তরমালা দিয়ে দ্রুত রেজাল্ট বের করুন—নেগেটিভ মার্কিং সহ।
        </CardContent>
      </Card>
      <Tabs defaultValue="grade">
        <TabsList>
          <TabsTrigger value="grade">মূল্যায়ন</TabsTrigger>
          <TabsTrigger value="create">OMR শিট তৈরী</TabsTrigger>
        </TabsList>
        <TabsContent value="grade">
          <OmrGraderPanel />
        </TabsContent>
        <TabsContent value="create">
          <OmrSheetPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
