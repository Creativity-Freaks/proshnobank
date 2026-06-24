const SUPABASE_URL = "https://urtptlxotyyjfqynpbwx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVydHB0bHhvdHl5amZxeW5wYnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTA2NzQsImV4cCI6MjA4NDE2NjY3NH0.w-0GuzuZ3DU0BACTHoCXBPj6qBRxsA3JirwcVflR9BE";

const r = await fetch(`${SUPABASE_URL}/functions/v1/exams?action=live`, {
  headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
});
console.log("STATUS:", r.status);
const body = await r.text();
console.log("BODY:", body.slice(0, 2000));
