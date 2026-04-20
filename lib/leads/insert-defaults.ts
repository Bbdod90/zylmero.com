/**
 * Oude Supabase-schema's kunnen `custom_fields` / `ai_tags` als NOT NULL hebben zonder DEFAULT.
 * Altijd meesturen bij `.insert()` op `leads` voorkomt stille 500's na migraties.
 */
export const leadInsertJsonDefaults = {
  custom_fields: {} as Record<string, string>,
  ai_tags: [] as string[],
};
