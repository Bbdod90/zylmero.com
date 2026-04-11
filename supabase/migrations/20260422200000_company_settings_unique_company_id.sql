-- PostgREST/Supabase upsert(onConflict: 'company_id') vereist UNIQUE of PRIMARY KEY op company_id.
-- Zonder unieke index: "there is no unique or exclusion constraint matching the ON CONFLICT specification"
-- IF NOT EXISTS: veilig als er al een PK op company_id is (dan is deze index overbodig maar schaadt niet).

create unique index if not exists company_settings_company_id_uidx
  on public.company_settings (company_id);

notify pgrst, 'reload schema';
