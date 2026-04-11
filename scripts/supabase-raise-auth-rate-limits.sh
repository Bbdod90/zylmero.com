#!/usr/bin/env bash
# Verhoogt Auth rate limits via Supabase Management API (niet via deze app).
#
# 1) Maak een token: https://supabase.com/dashboard/account/tokens
# 2) Project-ref = subdomain in je URL, bv. https://ABCxyz...supabase.co → ABCxyz...
#
# Gebruik:
#   export SUPABASE_ACCESS_TOKEN="sbp_..."
#   export SUPABASE_PROJECT_REF="acjwzwmzcqibhwjabqmz"   # jouw ref
#   npm run supabase:raise-rate-limits
#
# Op FREE/plan-limieten kan Supabase waarden alsnog begrenzen. "2 emails/h" met
# ingebouwde mail los je alleen met Custom SMTP in het dashboard.
#
# `rate_limit_email_sent` mag Supabase vaak pas wijzigen als Custom SMTP staat ingesteld.
# Standaard stuurt dit script die key niet mee. Wil je die wél patchen: zet eerst SMTP in
# het dashboard, daarna: INCLUDE_EMAIL_RATE_LIMIT=1 npm run supabase:raise-rate-limits

set -euo pipefail

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "Zet SUPABASE_ACCESS_TOKEN (Supabase → Account → Access tokens)." >&2
  exit 1
fi
if [[ -z "${SUPABASE_PROJECT_REF:-}" ]]; then
  echo "Zet SUPABASE_PROJECT_REF (20 tekens, zie Project Settings → General)." >&2
  exit 1
fi

API="https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/config/auth"

echo "Huidige rate_limit_* (vooraf):"
curl -sS -X GET "$API" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  | (command -v jq >/dev/null && jq 'to_entries | map(select(.key | startswith("rate_limit_"))) | from_entries' || cat)

echo ""
echo "PATCH met hogere waarden (zonder rate_limit_email_sent tenzij INCLUDE_EMAIL_RATE_LIMIT=1)…"

# Waarden: ruimer dan typische defaults; Supabase kan op FREE een maximum afdwingen.
EMAIL_JSON=""
if [[ "${INCLUDE_EMAIL_RATE_LIMIT:-}" == "1" ]]; then
  EMAIL_JSON=', "rate_limit_email_sent": 100'
fi

BODY="{
  \"rate_limit_anonymous_users\": 120,
  \"rate_limit_sms_sent\": 60,
  \"rate_limit_verify\": 120,
  \"rate_limit_token_refresh\": 500,
  \"rate_limit_otp\": 100,
  \"rate_limit_web3\": 120${EMAIL_JSON}
}"

curl -sS -X PATCH "$API" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$BODY" \
  | (command -v jq >/dev/null && jq . || cat)

echo ""
echo "Klaar. Controleer in het dashboard onder Authentication → Rate limits."
