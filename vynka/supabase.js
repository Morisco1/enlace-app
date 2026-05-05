import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aywccfbopzmqcjldxels.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5d2NjZmJvcHptcWNqbGR4ZWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjIxMDMsImV4cCI6MjA5MzQ5ODEwM30.d4-tul71JpVWjcT7deAITpZ9wjZe8vwFc_SgcfqWONY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);