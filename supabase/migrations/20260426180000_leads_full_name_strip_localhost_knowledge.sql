-- Schema drift fix: some production DBs missed `full_name` on leads (PostgREST "schema cache").
-- Cleanup: AI kennis-URL veld mag geen localhost bevatten op productie.

DO $$
BEGIN
  IF to_regclass('public.leads') IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'full_name'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'name'
    ) THEN
      ALTER TABLE public.leads ADD COLUMN full_name text;
      UPDATE public.leads SET full_name = COALESCE(NULLIF(trim(name), ''), 'Lead');
      ALTER TABLE public.leads ALTER COLUMN full_name SET NOT NULL;
      ALTER TABLE public.leads DROP COLUMN IF EXISTS name;
    ELSE
      ALTER TABLE public.leads ADD COLUMN full_name text NOT NULL DEFAULT 'Lead';
      ALTER TABLE public.leads ALTER COLUMN full_name DROP DEFAULT;
    END IF;
  END IF;
END $$;

UPDATE public.company_settings
SET automation_preferences = automation_preferences::jsonb - 'ai_knowledge_website'
WHERE automation_preferences IS NOT NULL
  AND automation_preferences::jsonb ? 'ai_knowledge_website'
  AND (
    lower(coalesce(automation_preferences->>'ai_knowledge_website', '')) LIKE '%localhost%'
    OR lower(coalesce(automation_preferences->>'ai_knowledge_website', '')) LIKE '%127.0.0.1%'
    OR lower(coalesce(automation_preferences->>'ai_knowledge_website', '')) LIKE '%::1%'
  );
