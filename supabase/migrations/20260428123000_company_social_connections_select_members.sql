-- Teamleden mogen status/metadata van social-koppelingen zien (geen server-side token-lek;
-- encrypted_token wordt door de app niet naar de client geselecteerd). Alleen eigenaar blijft
-- insert/update/delete via bestaande policies.

drop policy if exists company_social_connections_select_own
  on public.company_social_connections;

create policy company_social_connections_select_company
  on public.company_social_connections for select to authenticated
  using (
    company_id in (
      select id from public.companies where owner_user_id = auth.uid()
    )
    or exists (
      select 1 from public.company_members cm
      where cm.company_id = company_social_connections.company_id
        and cm.user_id = auth.uid()
    )
  );
