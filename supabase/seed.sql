-- Seed realistic data for the first auth user (run in Supabase SQL editor after signup)
-- Safe to re-run: only fills when the company has no leads yet.

do $$
declare
  uid uuid;
  cid uuid;
  conv uuid;
  i int;
  lead_ids uuid[] := array[
    'b1111111-1111-4111-8111-111111111101'::uuid,
    'b1111111-1111-4111-8111-111111111102'::uuid,
    'b1111111-1111-4111-8111-111111111103'::uuid,
    'b1111111-1111-4111-8111-111111111104'::uuid,
    'b1111111-1111-4111-8111-111111111105'::uuid,
    'b1111111-1111-4111-8111-111111111106'::uuid,
    'b1111111-1111-4111-8111-111111111107'::uuid,
    'b1111111-1111-4111-8111-111111111108'::uuid
  ];
  conv_ids uuid[] := array[
    'c2222222-2222-4222-8222-222222222201'::uuid,
    'c2222222-2222-4222-8222-222222222202'::uuid,
    'c2222222-2222-4222-8222-222222222203'::uuid,
    'c2222222-2222-4222-8222-222222222204'::uuid,
    'c2222222-2222-4222-8222-222222222205'::uuid,
    'c2222222-2222-4222-8222-222222222206'::uuid,
    'c2222222-2222-4222-8222-222222222207'::uuid,
    'c2222222-2222-4222-8222-222222222208'::uuid
  ];
begin
  select id into uid from auth.users order by created_at asc limit 1;
  if uid is null then
    raise notice 'Seed skipped: no auth.users yet.';
    return;
  end if;

  select id into cid from public.companies where owner_user_id = uid limit 1;
  if cid is null then
    insert into public.companies (name, owner_user_id, onboarding_completed, contact_email, contact_phone, niche)
    values (
      'Van Dijk AutoService',
      uid,
      true,
      'planning@vandijk-autoservice.nl',
      '+31 297 820 014',
      'garage'
    )
    returning id into cid;
  end if;

  insert into public.company_settings (company_id, niche, services, faq, pricing_hints, business_hours, booking_link, tone, reply_style, language, automation_preferences)
  values (
    cid,
    'Van Dijk AutoService — onafhankelijk autobedrijf in Mijdrecht: APK, onderhoud, diagnose en banden.',
    array[
      'APK-keuring',
      'Kleine en grote beurt',
      'Banden wisselen en uitlijnen',
      'Remmen en diagnose',
      'Airco service',
      'Accu en elektronica',
      'Onderhoud zakelijke voertuigen'
    ],
    '[
      {"q":"Hoe snel kan ik terecht?","a":"Meestal binnen 3–5 werkdagen; spoed in overleg."},
      {"q":"Hebben jullie een leenauto?","a":"Ja, op aanvraag (€25–€45/dag)."}
    ]'::jsonb,
    'APK €49–€69. Kleine beurt vanaf €189. Remblokken vooras indicatief €220–€380 incl. arbeid.',
    '{"mon":"07:30–18:00","tue":"07:30–18:00","wed":"07:30–18:00","thu":"07:30–18:00","fri":"07:30–18:00","sat":"08:00–13:00","sun":"Gesloten"}'::jsonb,
    'https://vandijk-autoservice.nl/plan',
    'Professioneel, warm, direct. Geen onnodig jargon.',
    'Kort, duidelijk, altijd met concrete vervolgstap (inspectie/offerte/afspraak).',
    'nl',
    '{"niche_key": "garage"}'::jsonb
  )
  on conflict (company_id) do update set
    niche = excluded.niche,
    services = excluded.services,
    faq = excluded.faq,
    pricing_hints = excluded.pricing_hints,
    business_hours = excluded.business_hours,
    booking_link = excluded.booking_link,
    tone = excluded.tone,
    reply_style = excluded.reply_style,
    automation_preferences = coalesce(public.company_settings.automation_preferences, '{}'::jsonb) || '{"niche_key": "garage"}'::jsonb;

  if (select count(*)::int from public.leads where company_id = cid) > 0 then
    raise notice 'Seed skipped: leads already exist for company %', cid;
    return;
  end if;

  insert into public.leads (id, company_id, full_name, email, phone, source, status, score, summary, intent, estimated_value, suggested_next_action, status_recommendation, last_message_at, notes)
  values
    (lead_ids[1], cid, 'Sophie de Vries', 'sophie.devries@email.nl', '+31 6 12 34 56 78', 'Website', 'active', 78,
     'APK + remcheck; wil woensdag ochtend.', 'APK + remmen', 420, 'Bevestig 45 min werkplaats en kenteken.', 'active', now() - interval '35 minutes', 'Terugbel 12:00–14:00'),
    (lead_ids[2], cid, 'Mark Janssen', 'mark.j@werk.nl', '+31 6 98 76 54 32', 'Google Maps', 'quote_sent', 64,
     'Fleet 3 voertuigen; vraagt jaarplan.', 'Fleet onderhoud', 2400, 'Stuur pakketofferte met vaste jaarprijs.', 'quote_sent', now() - interval '6 hours', null),
    (lead_ids[3], cid, 'Aya El-Khatib', 'aya.elkhatib@gmail.com', '+31 6 55 44 33 22', 'WhatsApp', 'appointment_booked', 88,
     'Airco ruikt muf; wil dinsdag 14:30.', 'Airco reiniging', 185, 'Bevestig afspraak + kenteken.', 'appointment_booked', now() - interval '50 minutes', 'Afspraak bevestigd'),
    (lead_ids[4], cid, 'Tom Vermeulen', 'tom.vermeulen@outlook.com', '+31 6 22 11 00 99', 'Referral', 'new', 52,
     'Gekraak voorwiel; twijfelt nog.', 'Diagnose vering', 320, 'Bied gratis visuele check.', 'active', now() - interval '2 hours', null),
    (lead_ids[5], cid, 'Lisa Hoekstra', 'lisa.h@email.nl', '+31 6 77 88 99 00', 'Facebook', 'won', 92,
     'Grote beurt + distributie geaccepteerd.', 'Onderhoud pakket', 980, 'Werkorder openen + onderdelen.', 'won', now() - interval '20 hours', 'Foto''s oude onderdelen'),
    (lead_ids[6], cid, 'Daan Bakker', 'daan.bakker@zzp.nl', '+31 6 44 33 22 11', 'Website', 'active', 71,
     'Elektronica storing intermitterend.', 'Diagnose OBD', 150, 'Plan diagnose 60 min.', 'active', now() - interval '4 hours', null),
    (lead_ids[7], cid, 'Emma van Dijk', 'emma.vandijk@mail.nl', '+31 6 10 20 30 40', 'Instagram', 'quote_sent', 58,
     'Ruitschade klein; verzekering wil offerte.', 'Schade spot repair', 310, 'Maak foto-offerte + uitleg polis.', 'quote_sent', now() - interval '30 hours', null),
    (lead_ids[8], cid, 'Jeroen Smits', 'jeroon.smits@werk.nl', '+31 6 90 80 70 60', 'Cold call', 'lost', 33,
     'Prijs te hoog; gaat naar concurrent.', 'APK alleen', 69, 'Nurture na 30 dagen.', 'lost', now() - interval '5 days', 'Closed lost');

  for i in 1..8 loop
    insert into public.conversations (id, company_id, lead_id, channel, title, last_message_at)
    values (
      conv_ids[i],
      cid,
      lead_ids[i],
      'inbox',
      'Thread ' || i::text,
      now() - (i * interval '17 minutes')
    );
  end loop;

  -- ~30 messages
  insert into public.messages (conversation_id, role, content, created_at) values
    (conv_ids[1], 'user', 'Hi! APK volgende week voor Golf 2018. Kunnen jullie remmen checken? Ik hoor piepen.', now() - interval '26 hours'),
    (conv_ids[1], 'staff', 'Hi Sophie, dank je. Ja, combineren we graag. Mag ik kenteken + km?', now() - interval '25 hours 40 minutes'),
    (conv_ids[1], 'user', 'XX-123-G, 118.400 km.', now() - interval '20 hours'),
    (conv_ids[1], 'staff', 'Top. Reken op ~45 min. Woensdag ochtend past?', now() - interval '19 hours 50 minutes'),
    (conv_ids[1], 'user', 'Ja. Wat kost het als er niks geks is?', now() - interval '35 minutes'),

    (conv_ids[2], 'user', 'We hebben 3 leasebakken. Vaste jaarprijs mogelijk incl. APK?', now() - interval '72 hours'),
    (conv_ids[2], 'staff', 'Zeker. Stuur kentekens + km + laatste beurt.', now() - interval '71 hours'),
    (conv_ids[2], 'user', 'Zie mail met kentekens. Graag fabrieksschema.', now() - interval '6 hours'),

    (conv_ids[3], 'user', 'Airco ruikt muf en koelt minder.', now() - interval '18 hours'),
    (conv_ids[3], 'staff', 'Dinsdag 14:30 vrij — past dat?', now() - interval '17 hours 40 minutes'),
    (conv_ids[3], 'user', 'Ja. BMW 320i, YY-999-Z.', now() - interval '50 minutes'),

    (conv_ids[4], 'user', 'Krakend geluid bij sturen. Geen idee van prijs.', now() - interval '2 hours'),

    (conv_ids[5], 'user', 'Offerte akkoord — wanneer kan de grote beurt?', now() - interval '24 hours'),
    (conv_ids[5], 'staff', 'Mooi! Ik plan woensdag 09:00, past dat?', now() - interval '23 hours'),

    (conv_ids[6], 'user', 'Storing motorlampje + rare trek bij acceleratie.', now() - interval '8 hours'),
    (conv_ids[6], 'staff', 'We starten met uitlezen. Mag ik kenteken?', now() - interval '7 hours 50 minutes'),
    (conv_ids[6], 'user', 'ZZ-404-F.', now() - interval '4 hours'),

    (conv_ids[7], 'user', 'Steenslag ruit — verzekering vraagt offerte.', now() - interval '40 hours'),
    (conv_ids[7], 'staff', 'Stuur foto''s + polisnummer, dan maken we een voorstel.', now() - interval '39 hours'),

    (conv_ids[8], 'user', 'APK prijs?', now() - interval '6 days'),
    (conv_ids[8], 'staff', 'APK vanaf €59 afhankelijk van voertuig. Wanneer laten we hem komen?', now() - interval '6 days' + interval '10 minutes'),
    (conv_ids[8], 'user', 'Te duur, andere garage goedkoper. Bedankt.', now() - interval '5 days');

  insert into public.messages (conversation_id, role, content, created_at)
  select conv_ids[1], 'staff', 'Voor APK + inspectie remmen zit je meestal rond €180–€240 als er geen onderdelen nodig zijn. Wil je dat ik woensdag 09:10 inplan?', now() - interval '30 minutes'
  where true;

  insert into public.messages (conversation_id, role, content, created_at)
  select conv_ids[4], 'staff', 'We kunnen eerst gratis visueel kijken. Wil je donderdag langs?', now() - interval '90 minutes'
  where true;

  insert into public.messages (conversation_id, role, content, created_at)
  select conv_ids[6], 'user', 'Liever vrijdag als het kan.', now() - interval '3 hours'
  where true;

  insert into public.messages (conversation_id, role, content, created_at)
  select conv_ids[7], 'user', 'Foto''s staan in de mail.', now() - interval '30 hours'
  where true;

  insert into public.quotes (company_id, lead_id, title, description, status, currency, subtotal, vat_rate, vat_amount, total, line_items, internal_notes)
  values
    (cid, lead_ids[2], 'Fleet onderhoud — jaarplan (3 voertuigen)', 'Jaarplan volgens fabriek + APK-termijnen.', 'sent', 'EUR', 2100, 0.21, 441, 2541,
     '[{"id":"1","description":"Jaaronderhoud pakket (per voertuig)","quantity":3,"unit_price":600,"line_total":1800},{"id":"2","description":"APK + admin","quantity":3,"unit_price":90,"line_total":270},{"id":"3","description":"Planning prioriteit","quantity":1,"unit_price":30,"line_total":30}]'::jsonb,
     'Check lease parts policy.'),
    (cid, lead_ids[1], 'APK + reminspectie (VW Golf)', 'APK + visuele reminspectie.', 'draft', 'EUR', 189, 0.21, 40, 229,
     '[{"id":"1","description":"APK","quantity":1,"unit_price":59,"line_total":59},{"id":"2","description":"Reminspectie","quantity":1,"unit_price":85,"line_total":85},{"id":"3","description":"Materialen","quantity":1,"unit_price":45,"line_total":45}]'::jsonb,
     'Als remblokken: foto + offerte deel 2.'),
    (cid, lead_ids[7], 'Spot repair voorruit (klein)', 'Reparatie kleine steenslag.', 'sent', 'EUR', 95, 0.21, 20, 115,
     '[{"id":"1","description":"Spot repair","quantity":1,"unit_price":95,"line_total":95}]'::jsonb,
     'Wacht op polis akkoord.');

  insert into public.appointments (company_id, lead_id, starts_at, ends_at, status, notes)
  values
    (cid, lead_ids[3], now() + interval '1 day', now() + interval '1 day' + interval '45 minutes', 'confirmed', 'Airco — BMW YY-999-Z'),
    (cid, lead_ids[1], now() + interval '3 days', now() + interval '3 days' + interval '45 minutes', 'tentative', 'APK + rem — nog bevestigen'),
    (cid, lead_ids[5], now() + interval '7 days', now() + interval '7 days' + interval '4 hours', 'scheduled', 'Grote beurt + distributie');

  insert into public.automations (company_id, name, trigger_type, delay_minutes, template_text, enabled)
  values
    (cid, 'Follow-up na lead', 'lead_created', 10, 'Hi {{name}}, bedankt voor je bericht. Kunnen we vandaag nog 10 minuten afstemmen over je APK/onderhoud?', true),
    (cid, 'Reminder offerte', 'quote_sent', 1440, 'Hi {{name}}, even checken: heb je de offerte kunnen bekijken? Ik kan morgen kort bellen als je wilt.', true),
    (cid, 'Laatste duw', 'no_reply', 4320, 'Hi {{name}}, ik sluit je dossier bij geen reactie. Zal ik je over 2 weken een seintje geven voor APK?', true);

  raise notice 'Seed complete for company %', cid;
end $$;
