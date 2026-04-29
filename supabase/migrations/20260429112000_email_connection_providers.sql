-- Extend provider constraint for direct email OAuth connections.

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
        'apple_calendar',
        'google_email',
        'microsoft_email'
      )
    );
