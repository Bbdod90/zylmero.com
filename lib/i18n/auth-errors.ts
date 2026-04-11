/** Vertaalt Supabase Auth-fouten naar begrijpelijke Nederlandse teksten. */
export function mapAuthError(message: string): string {
  const m = message.toLowerCase();

  if (
    m.includes("invalid login credentials") ||
    m.includes("invalid credentials")
  ) {
    return "Ongeldige inloggegevens. Controleer je e-mail en wachtwoord.";
  }
  if (m.includes("email not confirmed")) {
    return "Bevestig eerst je e-mailadres via de link in je inbox.";
  }
  if (
    m.includes("user already registered") ||
    m.includes("already been registered") ||
    m.includes("user already exists") ||
    m.includes("email address is already registered")
  ) {
    return "Er bestaat al een account met dit e-mailadres. Log in of gebruik ‘Wachtwoord vergeten’.";
  }
  if (m.includes("password should be at least") || m.includes("password is too short")) {
    return "Wachtwoord is te kort. Kies minimaal 8 tekens.";
  }
  if (m.includes("signup_disabled") || m.includes("signups not allowed")) {
    return "Registratie is tijdelijk niet mogelijk. Probeer het later opnieuw.";
  }
  if (
    m.includes("rate limit") ||
    m.includes("too many requests") ||
    m.includes("over_request_rate_limit") ||
    m.includes("over_email_send_rate_limit") ||
    m.includes("email rate limit") ||
    m.includes("429") ||
    m.includes("for security purposes") ||
    m.includes("only request this")
  ) {
    return "Er zijn kort geleden te veel registratiepogingen vanaf dit netwerk of dit e-mailadres (beveiliging van Supabase). Wacht 1–2 minuten zonder opnieuw te klikken. Bestaat dit account al? Ga dan naar Inloggen. Blijft dit terugkomen: probeer een ander netwerk of de live site (niet localhost).";
  }
  if (m.includes("invalid email")) {
    return "Voer een geldig e-mailadres in.";
  }
  if (m.includes("user is banned") || m.includes("banned")) {
    return "Dit account is geblokkeerd. Neem contact op met support.";
  }
  if (
    m.includes("error sending confirmation email") ||
    m.includes("sending confirmation email") ||
    m.includes("unable to send email")
  ) {
    return "De bevestigingsmail kon niet worden verstuurd (e-mailserver). Controleer in Supabase: SMTP aan, gebruikersnaam exact ‘resend’, poort 587 of 465, domein geverifieerd in Resend, en Resend-logs op fouten.";
  }

  return message;
}
