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

// First get category IDs
const cats = await query(`SELECT id, name, slug, parent_id FROM exam_categories WHERE parent_id IS NULL ORDER BY sort_order LIMIT 20`);
console.log("Categories:", JSON.stringify(cats, null, 1));

// Get subcategory IDs
const subcats = await query(`SELECT id, name, slug, parent_id FROM exam_categories WHERE parent_id IS NOT NULL ORDER BY sort_order LIMIT 30`);
console.log("Subcategories:", JSON.stringify(subcats, null, 1));

// Get template IDs
const templates = await query(`SELECT id, title, category FROM exam_templates ORDER BY created_at LIMIT 15`);
console.log("Templates:", JSON.stringify(templates, null, 1));
