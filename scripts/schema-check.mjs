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

const tables = [
  "exam_templates", "live_exam_events", "exam_batches",
  "profiles", "question_bank", "exam_attempts", "subjects", "chapters", "exam_categories"
];

for (const t of tables) {
  const cols = await query(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${t}' ORDER BY ordinal_position`
  );
  if (cols.message) { console.log(`\n=== ${t} ERROR: ${cols.message.slice(0,100)}`); continue; }
  console.log(`\n=== ${t} ===`);
  cols.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));
}

// Sample rows from each table
console.log("\n\n=== SAMPLE ROWS ===");
for (const t of ["exam_templates", "live_exam_events", "exam_batches", "subjects"]) {
  const rows = await query(`SELECT * FROM ${t} LIMIT 2`);
  console.log(`\n--- ${t} sample:`, JSON.stringify(rows, null, 1));
}
