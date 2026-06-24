const URL = "https://urtptlxotyyjfqynpbwx.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVydHB0bHhvdHl5amZxeW5wYnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTA2NzQsImV4cCI6MjA4NDE2NjY3NH0.w-0GuzuZ3DU0BACTHoCXBPj6qBRxsA3JirwcVflR9BE";
for (const t of ["exam_templates", "subscription_plans", "site_content", "pdf_library", "app_settings"]) {
  const r = await fetch(`${URL}/rest/v1/${t}?select=*&limit=2`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  const txt = await r.text();
  console.log(t.padEnd(20), r.status, txt.slice(0, 100));
}
