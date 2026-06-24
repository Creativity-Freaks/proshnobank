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

// Category IDs (from schema-check):
// SSC: 5dcb0bbc-7eea-44e2-a0b5-e66ef4574322
// HSC: a4550710-abaa-4c9e-b7c6-8a59b95be767
// medical: f31c9af7-4761-4a50-adb9-76b39fcba22a
// engineering: ceee9d21-6f31-4231-852f-23627bcef468
// university: 5acbf4dc-8a6f-4a29-bba9-a2d2d2d24319
// job: 92af1653-2577-4f87-bef4-40b731ec9bcc

// Subcategory IDs:
// ssc-2026: 00c76d31-6fbf-4b36-b65e-c003a47f818b
// ssc-2025: 0b0e63c6-7052-40f6-a9bd-e3a37f12824c
// ssc-science: ffd9e837-6d47-4c82-a05e-31248cd4d42c
// hsc-2026: 7290616c-a33c-47fc-aabd-e3c1ca0555f7
// hsc-science: 621e3135-3493-4be2-9e19-48d64935bde5
// medical-mat: 969544e1-837e-4fa7-8773-522b25ad48b4
// engineering-2026: 40cc4592-28cc-4026-94d7-5f5d1f43d62d
// university-2026: e9b5b10f-3eca-4a28-939f-41617c0d8101

// Template IDs:
// SSC ফুল মডেল: 02cec1fd-b64f-43fb-9baf-d1b314c6cfdf
// HSC পদার্থ: 21a239e2-2964-4326-b9de-fdeedc3efbdb
// মেডিকেল মডেল: 2b516d8c-9b83-46ed-a25e-12175e273508
// ইঞ্জিনিয়ারিং মডেল: ef2e348d-e3e3-4bae-a4de-b377ee65d670
// বিশ্ববিদ্যালয় ক ইউনিট: 1fc4be89-71c6-4389-9c07-bdc7d01af577
// BCS মডেল: fdabcbff-4277-4935-bfe6-0c59aa19fbf5

const batches = [
  // SSC
  {
    title: "SSC 2026 সম্পূর্ণ প্রস্তুতি ব্যাচ",
    category_id: "5dcb0bbc-7eea-44e2-a0b5-e66ef4574322",
    subcategory_id: "00c76d31-6fbf-4b36-b65e-c003a47f818b",
    template_id: "02cec1fd-b64f-43fb-9baf-d1b314c6cfdf",
    description: "SSC 2026 পরীক্ষার জন্য সম্পূর্ণ প্রস্তুতি — সকল বিষয় এবং মডেল টেস্ট অন্তর্ভুক্ত",
    price: 599,
    duration_days: 180,
    seats: 500,
    status: "published",
    start_date: "2026-07-01",
  },
  {
    title: "SSC বিজ্ঞান স্পেশাল ব্যাচ",
    category_id: "5dcb0bbc-7eea-44e2-a0b5-e66ef4574322",
    subcategory_id: "ffd9e837-6d47-4c82-a05e-31248cd4d42c",
    template_id: "02cec1fd-b64f-43fb-9baf-d1b314c6cfdf",
    description: "SSC বিজ্ঞান বিভাগের শিক্ষার্থীদের জন্য পদার্থ, রসায়ন, জীববিজ্ঞান ও গণিত",
    price: 499,
    duration_days: 120,
    seats: 300,
    status: "published",
    start_date: "2026-07-15",
  },
  // HSC
  {
    title: "HSC 2026 সায়েন্স মেগা ব্যাচ",
    category_id: "a4550710-abaa-4c9e-b7c6-8a59b95be767",
    subcategory_id: "621e3135-3493-4be2-9e19-48d64935bde5",
    template_id: "21a239e2-2964-4326-b9de-fdeedc3efbdb",
    description: "HSC 2026 বিজ্ঞান বিভাগের সম্পূর্ণ প্রস্তুতি — পদার্থ, রসায়ন, জীব ও গণিত",
    price: 799,
    duration_days: 365,
    seats: 400,
    status: "published",
    start_date: "2026-08-01",
  },
  {
    title: "HSC ইংরেজি মাস্টারক্লাস",
    category_id: "a4550710-abaa-4c9e-b7c6-8a59b95be767",
    subcategory_id: "7290616c-a33c-47fc-aabd-e3c1ca0555f7",
    template_id: null,
    description: "HSC ইংরেজি প্রথম ও দ্বিতীয় পত্রের বিশেষ প্রস্তুতি",
    price: 399,
    duration_days: 90,
    seats: 200,
    status: "published",
    start_date: "2026-07-10",
  },
  // Medical
  {
    title: "মেডিকেল ভর্তি ২০২৬ — ফুল প্যাকেজ",
    category_id: "f31c9af7-4761-4a50-adb9-76b39fcba22a",
    subcategory_id: "969544e1-837e-4fa7-8773-522b25ad48b4",
    template_id: "2b516d8c-9b83-46ed-a25e-12175e273508",
    description: "MBBS ভর্তি পরীক্ষার জন্য জীববিজ্ঞান, রসায়ন, পদার্থ ও ইংরেজি সম্পূর্ণ প্রস্তুতি",
    price: 1299,
    duration_days: 240,
    seats: 150,
    status: "published",
    start_date: "2026-07-01",
  },
  // Engineering
  {
    title: "ইঞ্জিনিয়ারিং ভর্তি ২০২৬ — BUET স্পেশাল",
    category_id: "ceee9d21-6f31-4231-852f-23627bcef468",
    subcategory_id: "40cc4592-28cc-4026-94d7-5f5d1f43d62d",
    template_id: "ef2e348d-e3e3-4bae-a4de-b377ee65d670",
    description: "BUET, CUET, RUET, KUET সহ সকল ইঞ্জিনিয়ারিং ভর্তি পরীক্ষার প্রস্তুতি",
    price: 1099,
    duration_days: 240,
    seats: 200,
    status: "published",
    start_date: "2026-07-01",
  },
  // University
  {
    title: "বিশ্ববিদ্যালয় ভর্তি — ক ইউনিট ব্যাচ",
    category_id: "5acbf4dc-8a6f-4a29-bba9-a2d2d2d24319",
    subcategory_id: "e9b5b10f-3eca-4a28-939f-41617c0d8101",
    template_id: "1fc4be89-71c6-4389-9c07-bdc7d01af577",
    description: "ঢাবি, জাবি, রাবি, চবি ক ইউনিট — বিজ্ঞান ও গণিত সম্পূর্ণ প্রস্তুতি",
    price: 899,
    duration_days: 180,
    seats: 250,
    status: "published",
    start_date: "2026-07-20",
  },
  {
    title: "বিশ্ববিদ্যালয় ভর্তি — খ ও গ ইউনিট কম্বো",
    category_id: "5acbf4dc-8a6f-4a29-bba9-a2d2d2d24319",
    subcategory_id: "e9b5b10f-3eca-4a28-939f-41617c0d8101",
    template_id: "99454286-da3b-48a6-aa35-d73113c81c21",
    description: "ব্যবসা ও মানবিক বিভাগের শিক্ষার্থীদের জন্য খ ও গ ইউনিট কম্বো ব্যাচ",
    price: 799,
    duration_days: 180,
    seats: 300,
    status: "published",
    start_date: "2026-07-20",
  },
  // Job
  {
    title: "BCS প্রিলিমিনারি ২০২৬ — সম্পূর্ণ ব্যাচ",
    category_id: "92af1653-2577-4f87-bef4-40b731ec9bcc",
    subcategory_id: null,
    template_id: "fdabcbff-4277-4935-bfe6-0c59aa19fbf5",
    description: "৪৭তম BCS প্রিলিমিনারি পরীক্ষার পূর্ণ প্রস্তুতি — বাংলা, ইংরেজি, গণিত, সাধারণ জ্ঞান",
    price: 1499,
    duration_days: 365,
    seats: 1000,
    status: "published",
    start_date: "2026-07-01",
  },
  {
    title: "ব্যাংক জব স্পেশাল ব্যাচ",
    category_id: "92af1653-2577-4f87-bef4-40b731ec9bcc",
    subcategory_id: null,
    template_id: "72db7fa5-c7bb-4a5c-a3f5-cb4825035ddd",
    description: "সোনালী, জনতা, অগ্রণী, রূপালী ব্যাংক সহ সকল ব্যাংক নিয়োগ পরীক্ষার প্রস্তুতি",
    price: 999,
    duration_days: 180,
    seats: 500,
    status: "published",
    start_date: "2026-07-15",
  },
];

// Build the INSERT SQL
const values = batches.map(b => {
  const tid = b.template_id ? `'${b.template_id}'` : "NULL";
  const sid = b.subcategory_id ? `'${b.subcategory_id}'` : "NULL";
  const sd = b.start_date ? `'${b.start_date}'` : "NULL";
  return `('${b.title.replace(/'/g, "''")}', '${b.category_id}', ${sid}, ${tid}, '${b.description.replace(/'/g, "''")}', ${b.price}, ${b.duration_days}, ${b.seats}, '${b.status}', ${sd})`;
}).join(",\n");

const sql = `INSERT INTO exam_batches (title, category_id, subcategory_id, template_id, description, price, duration_days, seats, status, start_date)
VALUES ${values}
RETURNING id, title, status`;

console.log("Inserting batches...");
const result = await query(sql);
if (result.message) {
  console.error("ERROR:", result.message);
} else {
  console.log("Inserted:", result.length, "batches");
  result.forEach(r => console.log(" -", r.id, r.title));
}
