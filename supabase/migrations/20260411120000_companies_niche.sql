-- Branche / verticale voor multi-niche AI (canonical id, zie lib/niches.ts)
alter table public.companies
  add column if not exists niche text;

comment on column public.companies.niche is 'Canonical niche id (garage, hair_salon, plumber, …). Vrij tekst voor "anders" in company_settings.niche.';
