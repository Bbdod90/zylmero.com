# Waar `OPENAI_API_KEY` hoort (en waar die vaak mist)

De app leest **alleen** `process.env.OPENAI_API_KEY` op de **server** (API routes, server actions). Er is geen plek in de frontend-code waar je de sleutel hardcoded; je moet hem overal **dezelfde naam** geven als omgevingsvariabele.

## Lokaal ontwikkelen

| Bestand | Actie |
|--------|--------|
| `closerflow/.env.local` | Zet `OPENAI_API_KEY=...` en optioneel `OPENAI_MODEL=...`. Bestand staat in `.gitignore`. |
| `closerflow/.env.example` | Alleen **lege** placeholders — ter referentie voor teammates. |

Na wijziging: **`npm run dev` opnieuw starten.**

## Productie (live site, bv. zylmero.com)

`.env.local` wordt op de server **niet** gelezen. Je moet dezelfde variabelen **opnieuw** zetten in het dashboard van je host:

| Platform | Waar |
|----------|------|
| **Railway** | Project → service → **Variables** |
| **Vercel** | Project → **Settings** → **Environment Variables** (Production + eventueel Preview) |
| **Render / Fly.io / andere** | **Environment** / **Secrets** |

Minimaal voor AI-demo + app-AI:

- `OPENAI_API_KEY` — **verplicht** voor echte antwoorden (zonder key: fallback of foutmelding).
- `OPENAI_MODEL` — optioneel; default in code is `gpt-4o-mini`.

**Preview branches:** als Preview geen env heeft, werkt AI daar niet tot je `OPENAI_API_KEY` ook voor Preview invult (of alleen Production test).

## Wat je niet moet doen

- Geen `NEXT_PUBLIC_OPENAI_*` — dan zou de sleutel naar de browser gaan.
- Geen sleutel in Git, issues of screenshots.

## Code die deze env gebruikt (referentie)

- `app/api/ai/route.ts` — homepage-demo-chat  
- `lib/openai/client.ts` — overige OpenAI-calls  
- Diverse `actions/*.ts` en `lib/openai/*.ts` — dashboard-AI  

Zie ook root **`.env.example`** voor alle gerelateerde variabelen.
