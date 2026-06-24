const URL = 'https://urtptlxotyyjfqynpbwx.supabase.co/functions/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVydHB0bHhvdHl5amZxeW5wYnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTA2NzQsImV4cCI6MjA4NDE2NjY3NH0.w-0GuzuZ3DU0BACTHoCXBPj6qBRxsA3JirwcVflR9BE';
const h = { apikey: KEY, 'Content-Type': 'application/json' };

const r1 = await fetch(`${URL}/exams?action=generate&count=5`, { headers: h });
const d1 = await r1.json();
console.log('generate - count:', d1.data?.length, 'error?:', d1.error);
if (d1.data?.[0]) console.log(' first q:', d1.data[0].question_text?.slice(0, 60));

const r2 = await fetch(`${URL}/exams?action=generateTemplate&id=02cec1fd-b64f-43fb-9baf-d1b314c6cfdf&count=5`, { headers: h });
const d2 = await r2.json();
console.log('generateTemplate - count:', d2.data?.length, 'error?:', d2.error);
if (d2.data?.[0]) console.log(' first q:', d2.data[0].question_text?.slice(0, 60));
