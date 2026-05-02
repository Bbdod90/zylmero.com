-- Public bucket voor widget-logo uploads (chat-kop, rond).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'widget-logos',
  'widget-logos',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
