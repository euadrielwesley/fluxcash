import { createClient } from '@supabase/supabase-js';

// Supabase Configuration - Flux Cash Oficial
const SUPABASE_URL = 'https://lzleamsdkztrwezelxqy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6bGVhbXNka3p0cndlemVseHF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MTI3NjgsImV4cCI6MjA4Mzk4ODc2OH0.Y8RzmDSP311ApQQrnyYAWmvRsnxaqCAoEOZRNRvmLe8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
