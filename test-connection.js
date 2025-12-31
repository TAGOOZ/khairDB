import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    const { data, error } = await supabase.from('_schema').select('*')
    if (error) throw error
    console.log('Connection successful!')
    console.log('Schema data:', data)
  } catch (error) {
    console.error('Connection failed:', error.message)
  }
}

testConnection() 