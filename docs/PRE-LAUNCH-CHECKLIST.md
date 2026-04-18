# Pre-launch checklist (v1 publiek)

Vink af wat klaar is. Doel: live gaan zonder verrassingen bij gebruikers, betaling en data.

---

## 1. Juridisch & vertrouwen

- [ ] **Privacyverklaring** live (welke data, waar opgeslagen, rechten gebruiker).
- [ ] **Algemene voorwaarden** of gebruiksregels (trial, betaling, opzeggen).
- [ ] **Cookiebanner / toestemming** als je niet-essentiële cookies of analytics gebruikt.
- [ ] Footer of login: duidelijke links naar bovenstaande pagina’s.
- [ ] Demo/testimonial-copy duidelijk als **indicatief / demo** waar van toepassing.

---

## 2. E-mail & domein

- [ ] Transactionele mail werkt in **productie** (signup, reset, uitnodiging, enz.).
- [ ] **SPF / DKIM / DMARC** voor het verzenddomein (minder spamfolder).
- [ ] `mailto:` / supportadres op de site klopt en wordt gelezen.
- [ ] Test: account aanmaken op productiedomein en mail ontvangen.

---

## 3. Betalingen (Stripe)

- [ ] **Live mode** (geen test keys op productie).
- [ ] Webhook-URL in Stripe-dashboard = jouw productie-URL + juiste secret in env.
- [ ] Prijzen/plannen in Stripe komen overeen met wat op de site staat.
- [ ] Test: kleine echte betaling of staged checkout → trial/subscription zoals bedoeld.

---

## 4. Foutpagina’s & randgevallen

- [ ] **`/404`** — pagina niet gevonden, link terug naar home (zie `app/not-found.tsx`).
- [ ] **`error` boundary** — bij onverwachte fout: vriendelijke boodschap + opnieuw proberen (zie `app/error.tsx`).
- [ ] Database/API down: gebruiker ziet geen kale stacktrace (API’s netjes fout terug).

---

## 5. Omgeving & secrets

- [ ] Alle **Railway / hosting** env vars gevuld (`OPENAI_*`, Supabase, Stripe, cron secrets, …).
- [ ] Geen secrets in Git; `.env.example` bijgewerkt waar dat helpt teammates.
- [ ] `npm run build` slaagt op CI of lokaal vóór elke deploy.

---

## 6. Performance & UX

- [ ] **Home + dashboard** op mobiel getest (scroll, knoppen, formulieren).
- [ ] **Lighthouse** (of Pagespeed): geen grove rode vlaggen op LCP/CLS waar je snel wat aan kunt doen.
- [ ] Zware pagina’s: lazy loading waar logisch (grote grafieken, kaarten).

---

## 7. Monitoring & logs

- [ ] **Hosting logs** (Railway) bekend: waar zie je build/runtime errors?
- [ ] Optioneel: **Sentry** (of gelijkwaardig) voor client/server errors met release-tag.
- [ ] Optioneel: uptime-check op `/` of health endpoint.

---

## 8. Backup & data

- [ ] **Supabase**: automated backups aan (plan afhankelijk) — weten waar restore staat beschreven.
- [ ] Export-critical: wie kan **handmatig export** van leads/offertes als dat nodig is?
- [ ] Know-how: één iemand weet hoe je **database migration** / rollback aanpakt bij problemen.

---

## Na launch (kort)

- [ ] Eén **supportkanaal** (mail of formulier) en verwachte reactietijd (zelfs intern).
- [ ] Kleine **changelog** of “wat is nieuw” voor eerste gebruikers.
