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
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "Er bestaat al een account met dit e-mailadres. Log in of gebruik wachtwoord vergeten.";
  }
  if (m.includes("password should be at least") || m.includes("password is too short")) {
    return "Wachtwoord is te kort. Kies minimaal 8 tekens.";
  }
  if (m.includes("signup_disabled") || m.includes("signups not allowed")) {
    return "Registratie is tijdelijk niet mogelijk. Probeer het later opnieuw.";
  }
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "Te veel pogingen. Wacht even en probeer het opnieuw.";
  }
  if (m.includes("invalid email")) {
    return "Voer een geldig e-mailadres in.";
  }

  return message;
}
