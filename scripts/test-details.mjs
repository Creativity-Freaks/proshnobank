const URL = 'https://urtptlxotyyjfqynpbwx.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVydHB0bHhvdHl5amZxeW5wYnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTA2NzQsImV4cCI6MjA4NDE2NjY3NH0.w-0GuzuZ3DU0BACTHoCXBPj6qBRxsA3JirwcVflR9BE';

const id = '02cec1fd-b64f-43fb-9baf-d1b314c6cfdf';
const res = await fetch(`${URL}/functions/v1/exams?action=details&id=${id}`, {
  headers: { apikey: KEY }
});
const data = await res.json();
console.log('status:', res.status);
console.log('response:', JSON.stringify(data, null, 1));
