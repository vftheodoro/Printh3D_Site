import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.from('sales').select('*').limit(1);
  console.log('Error:', error);

  if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
  } else {
    const { error: err2 } = await supabase.from('sales').select('category_id').limit(1);
    console.log('Has category_id?', !err2);

    const { data: cols } = await supabase.rpc('get_schema_info');
    console.log('Cols:', cols);
  }
}

checkSchema();
