const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://xcyzvtkkgmuezvdaqlgv.supabase.co'
const supabaseKey = 'Mustafa_Mu0512@@'

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