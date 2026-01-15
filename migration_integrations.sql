-- Add integrations_enc column to profiles table if it doesn't exist
alter table public.profiles 
add column if not exists integrations_enc jsonb default '{}'::jsonb;

-- Comment to explain usage
comment on column public.profiles.integrations_enc is 'Stores encrypted integration settings (API keys, etc) for the user';
