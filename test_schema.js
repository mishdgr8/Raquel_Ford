
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, './.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    try {
        console.log('Checking articles table...');
        const { data, error } = await supabase.from('articles').select('*').limit(1);
        if (error) {
            console.error('Error fetching articles:', error);
            return;
        }
        if (data.length === 0) {
            console.log('No articles found in table.');
        } else {
            console.log('Sample article columns:', Object.keys(data[0] || {}).join(', '));
        }
    } catch (err) {
        console.error('Script error:', err);
    }
}

checkSchema();
