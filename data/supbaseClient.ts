import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lzlycyjvsglfjkuxltqx.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6bHljeWp2c2dsZmprdXhsdHF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NjE0NjcsImV4cCI6MjA1NzUzNzQ2N30.MtqgAX_fbNAvJ5YnE5nl1_C8l6VozK0QOP5jTW2Bg4c"; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);