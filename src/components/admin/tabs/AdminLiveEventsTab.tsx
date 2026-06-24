import { useEffect, useState } from "react";
import { Plus, Trash2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";

export default function AdminLiveEventsTab() {
  const { toast } = useToast();
  const { refreshTrigger } = useAdmin();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveEvents();
  }, [refreshTrigger]);

  const fetchLiveEvents = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("live_exam_events")
        .select("*, exam_templates(name)")
        .limit(100);
      setEvents(data || []);
    } catch (error) {
      toast({ title: "Error", description: "ইভেন্ট লোড করতে ব্যর্থ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি এই ইভেন্ট মুছে দিতে চান?")) {
      try {
        await supabase.from("live_exam_events").delete().eq("id", id);
        toast({ title: "সাফল্য", description: "ইভেন্ট সফলভাবে মুছে দেওয়া হয়েছে" });
        fetchLiveEvents();
      } catch (error) {
        toast({ title: "Error", description: "ইভেন্ট মুছতে ব্যর্থ", variant: "destructive" });
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">লাইভ ইভেন্ট ব্যবস্থাপনা</h2>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          নতুন ইভেন্ট
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            সক্রিয় ইভেন্ট ({events.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-muted-foreground">কোন লাইভ ইভেন্ট নেই</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div key={event.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.name || event.exam_templates?.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      স্ট্যাটাস: {event.status || "সক্রিয়"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      শুরু সময়: {event.start_time ? new Date(event.start_time).toLocaleString("bn-BD") : "নির্ধারিত নয়"}
                    </p>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
