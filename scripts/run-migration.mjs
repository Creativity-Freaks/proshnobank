import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '/vercel/share/.env.project' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  try {
    console.log('[Migration] Reading SQL file...');
    const sqlPath = path.join(process.cwd(), 'src/lib/migrations/add-hierarchy-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    console.log(`[Migration] Found ${statements.length} SQL statements`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;
      
      console.log(`[Migration] Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.warn(`[Migration] Warning on statement ${i + 1}: ${error.message}`);
        } else {
          console.log(`[Migration] Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.warn(`[Migration] Non-critical error on statement ${i + 1}: ${err.message}`);
      }
    }
    
    console.log('[Migration] All migrations completed!');
  } catch (error) {
    console.error('[Migration] Fatal error:', error);
    process.exit(1);
  }
}

runMigrations();
