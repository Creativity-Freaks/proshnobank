const SUPA_TOKEN = process.env.SUPA_TOKEN;
const PROJECT_REF = process.env.PROJECT_REF;

const q = async (sql) => {
  const r = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SUPA_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  return await r.json();
};

const tables = ["live_exam_events", "exam_templates", "question_bank", "exam_attempts", "profiles", "subjects", "chapters"];

for (const t of tables) {
  const cols = await q(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='${t}' ORDER BY ordinal_position`
  );
  if (cols.message) { console.log(`${t}: ERROR ${cols.message.slice(0,80)}`); continue; }
  console.log(`\n=== ${t} ===`);
  cols.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));
}

// also get actual rows from live_exam_events
const events = await q("SELECT * FROM live_exam_events LIMIT 5");
console.log("\n=== live_exam_events rows ===", JSON.stringify(events, null, 1));

const tmpl = await q("SELECT * FROM exam_templates LIMIT 3");
console.log("\n=== exam_templates rows ===", JSON.stringify(tmpl, null, 1));

const qs = await q("SELECT * FROM question_bank LIMIT 2");
console.log("\n=== question_bank rows ===", JSON.stringify(qs, null, 1));
