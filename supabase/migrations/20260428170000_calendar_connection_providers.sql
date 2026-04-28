-- Extend social connection providers with calendar integrations.

alter table public.company_social_connections
  drop constraint if exists company_social_connections_provider_chk;

alter table public.company_social_connections
  add constraint company_social_connections_provider_chk
    check (
      provider in (
        'meta',
        'tiktok',
        'linkedin',
        'google_calendar',
        'apple_calendar'
      )
    );
