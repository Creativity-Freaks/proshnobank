const SUPA_TOKEN = process.env.SUPA_TOKEN;
const PROJECT_REF = process.env.PROJECT_REF;
const BASE = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const query = async (sql) => {
  const r = await fetch(BASE, {
    method: "POST",
    headers: { Authorization: `Bearer ${SUPA_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  return await r.json();
};

// Templates by category:
// SSC: 02cec1fd
// HSC physics: 21a239e2
// medical: 2b516d8c
// engineering: ef2e348d
// university ka: 1fc4be89
// BCS: fdabcbff
// bank: 72db7fa5

const events = [
  {
    template_id: "21a239e2-2964-4326-b9de-fdeedc3efbdb",
    start_time: "2026-07-01 10:00:00+06",
    status: "upcoming",
    participants: 45,
    prize: "৫০০০ টাকা বৃত্তি",
  },
  {
    template_id: "2b516d8c-9b83-46ed-a25e-12175e273508",
    start_time: "2026-06-30 15:00:00+06",
    status: "upcoming",
    participants: 120,
    prize: "মেডিকেল প্রস্তুতি কোর্স ফ্রি",
  },
  {
    template_id: "fdabcbff-4277-4935-bfe6-0c59aa19fbf5",
    start_time: "2026-06-29 08:00:00+06",
    status: "starting-soon",
    participants: 200,
    prize: "BCS গাইড বই সেট",
  },
  {
    template_id: "ef2e348d-e3e3-4bae-a4de-b377ee65d670",
    start_time: "2026-07-05 14:00:00+06",
    status: "upcoming",
    participants: 80,
    prize: null,
  },
];

const values = events.map(e => {
  const prize = e.prize ? `'${e.prize}'` : "NULL";
  return `('${e.template_id}', '${e.start_time}', '${e.status}', ${e.participants}, ${prize})`;
}).join(",\n");

const sql = `INSERT INTO live_exam_events (template_id, start_time, status, participants, prize)
VALUES ${values}
RETURNING id, template_id, status, prize`;

const result = await query(sql);
if (result.message) {
  console.error("ERROR:", result.message);
} else {
  console.log("Inserted:", result.length, "live events");
  result.forEach(r => console.log(" -", r.id, r.status, r.prize));
}
