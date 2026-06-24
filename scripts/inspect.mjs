const TOKEN = process.env.SUPA_TOKEN;
const REF = process.env.PROJECT_REF;
const q = async (sql) => {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  return await r.json();
};

console.log("=== exam_templates rows ===");
console.log(JSON.stringify(await q(`select id, title, category, question_count, duration_minutes, difficulty, attempts, rating from exam_templates limit 10`), null, 1));

console.log("\n=== exam_categories columns ===");
const cc = await q(`select column_name, data_type from information_schema.columns where table_name='exam_categories' order by ordinal_position`);
console.log(Array.isArray(cc) ? cc.map((c) => `${c.column_name}:${c.data_type}`).join(", ") : JSON.stringify(cc));

console.log("\n=== exam_categories rows ===");
console.log(JSON.stringify(await q(`select * from exam_categories limit 30`), null, 1));

console.log("\n=== question_bank columns ===");
const qc = await q(`select column_name, data_type from information_schema.columns where table_name='question_bank' order by ordinal_position`);
console.log(Array.isArray(qc) ? qc.map((c) => `${c.column_name}:${c.data_type}`).join(", ") : JSON.stringify(qc));
