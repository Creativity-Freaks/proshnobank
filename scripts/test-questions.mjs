const URL = "https://urtptlxotyyjfqynpbwx.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVydHB0bHhvdHl5amZxeW5wYnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTA2NzQsImV4cCI6MjA4NDE2NjY3NH0.w-0GuzuZ3DU0BACTHoCXBPj6qBRxsA3JirwcVflR9BE";

const headers = { apikey: KEY, "Content-Type": "application/json" };

const [groups, list] = await Promise.all([
  fetch(`${URL}/functions/v1/questions?action=groups&limit=10`, { headers }).then(r => r.json()),
  fetch(`${URL}/functions/v1/questions?limit=5`, { headers }).then(r => r.json()),
]);

console.log("GROUPS total_groups:", groups.total_groups, "total_questions:", groups.total_questions);
if (groups.data?.[0]) console.log("first group:", JSON.stringify(groups.data[0]));
console.log("LIST total:", list.total);
if (list.data?.[0]) console.log("first q:", JSON.stringify({ subject: list.data[0].subject, topic: list.data[0].topic, difficulty: list.data[0].difficulty }));
if (list.error) console.log("LIST ERROR:", list.error);
if (groups.error) console.log("GROUPS ERROR:", groups.error);
