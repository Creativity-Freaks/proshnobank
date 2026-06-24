const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const call = async (fn, params = {}) => {
  const url = new URL(`${SUPABASE_URL}/functions/v1/${fn}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const r = await fetch(url, { headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" } });
  const j = await r.json();
  console.log(`\n=== ${fn}?${new URLSearchParams(params)} (${r.status}) ===`);
  console.log(JSON.stringify(j, null, 1).slice(0, 1200));
};

await call("exams", { action: "live" });
await call("leaderboard", { action: "rankings", period: "all", limit: "5" });
await call("leaderboard", { action: "stats" });
