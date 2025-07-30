import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');

// Try to load .env file
dotenv.config({ path: join(rootDir, '.env') });
dotenv.config({ path: join(rootDir, '.env.local') });

// Supabase configuration for Node.js scripts
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ Missing Supabase URL. Please set VITE_SUPABASE_URL in your .env file');
  console.error('   Example: VITE_SUPABASE_URL=https://your-project.supabase.co');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('❌ Missing Supabase anon key. Please set VITE_SUPABASE_ANON_KEY in your .env file');
  console.error('   Get this from your Supabase project settings > API');
  process.exit(1);
}

// Create Supabase client for Node.js
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'gxp-learning-hub-script@1.0.0'
    }
  }
});

console.log('✅ Supabase client initialized for Node.js script');
