export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_CLOSERFLOW_DEMO === "true";
}

export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function hasOpenAIKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}
