#!/usr/bin/env node

/**
 * Admin User Creation Script
 * Creates a new admin user in Supabase Auth
 * 
 * Usage: node scripts/create-admin-user.mjs [email] [password]
 * Example: node scripts/create-admin-user.mjs info.proshnobank@gmail.com admin123
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const envPath = path.join(process.cwd(), '.env.development.local');
const env = fs.existsSync(envPath)
  ? Object.fromEntries(
      fs.readFileSync(envPath, 'utf-8')
        .split('\n')
        .filter(line => line && !line.startsWith('#'))
        .map(line => line.split('='))
    )
  : {};

const SUPABASE_URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// Command line arguments
const email = process.argv[2];
const password = process.argv[3];

async function createAdminUser() {
  if (!email || !password) {
    console.error('Usage: node scripts/create-admin-user.mjs <email> <password>');
    console.error('Example: node scripts/create-admin-user.mjs info.proshnobank@gmail.com admin123');
    process.exit(1);
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Error: Missing Supabase configuration');
    console.error('Required environment variables:');
    console.error('  - VITE_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    console.error('');
    console.error('Set these in .env.development.local or as environment variables');
    process.exit(1);
  }

  try {
    console.log('Connecting to Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    console.log(`Creating admin user: ${email}`);
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.error('Error creating user:', error.message);
      if (error.message.includes('already exists')) {
        console.log('');
        console.log('User already exists. To reset password:');
        console.log('1. Go to Supabase Dashboard');
        console.log('2. Authentication > Users');
        console.log('3. Find the user and click "..." menu');
        console.log('4. Select "Reset password"');
      }
      process.exit(1);
    }

    console.log('✓ Admin user created successfully!');
    console.log('');
    console.log('User Details:');
    console.log(`  ID: ${data.user?.id}`);
    console.log(`  Email: ${data.user?.email}`);
    console.log(`  Created: ${data.user?.created_at}`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Verify VITE_ADMIN_EMAILS includes: ' + email);
    console.log('2. Restart dev server: npm run dev');
    console.log(`3. Login at: http://localhost:8080/admin/login`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

createAdminUser();
