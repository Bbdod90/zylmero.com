import { DEMO_COMPANY_ID } from "@/lib/demo/company";
import { buildGarageDemoDataset } from "@/lib/demo/garage-dataset";
import type { Appointment, Lead, Message, Quote } from "@/lib/types";
import type { NicheId } from "@/lib/niches";

const now = Date.now();

function iso(mins: number) {
  return new Date(now - mins * 60 * 1000).toISOString();
}

function isoFuture(hours: number) {
  return new Date(now + hours * 3600000).toISOString();
}

export type DemoDataset = {
  leads: Lead[];
  messages: Message[];
  quotes: Quote[];
  appointments: Appointment[];
};

function garage(): DemoDataset {
  return buildGarageDemoDataset();
}

function hairSalon(): DemoDataset {
  const leads: Lead[] = [
    {
      id: "demo-h-l1",
      company_id: DEMO_COMPANY_ID,
      full_name: "Emma van Dijk",
      email: "emma@email.nl",
      phone: "+31611112222",
      source: "Instagram",
      status: "active",
      score: 86,
      summary: "Balayage + knippen — wil prijs en datum.",
      intent: "Kleur + knippen",
      estimated_value: 185,
      suggested_next_action: "Voorbeeldfoto tonen en slot voorstellen.",
      status_recommendation: "active",
      last_message_at: iso(40),
      notes: null,
      created_at: iso(60 * 24 * 2),
      updated_at: iso(40),
    },
    {
      id: "demo-h-l2",
      company_id: DEMO_COMPANY_ID,
      full_name: "Noah Jansen",
      email: "noah@werk.nl",
      phone: "+31633334444",
      source: "Website",
      status: "quote_sent",
      score: 72,
      summary: "Herenkleur + baard bijwerken.",
      intent: "Kleur heren",
      estimated_value: 95,
      suggested_next_action: "Allergietest kleur + offerte bevestigen.",
      status_recommendation: "quote_sent",
      last_message_at: iso(180),
      notes: null,
      created_at: iso(60 * 48),
      updated_at: iso(180),
    },
    {
      id: "demo-h-l3",
      company_id: DEMO_COMPANY_ID,
      full_name: "Mila Smit",
      email: "mila@gmail.com",
      phone: "+31655556666",
      source: "WhatsApp",
      status: "appointment_booked",
      score: 90,
      summary: "Extensions op donderdag 10:00.",
      intent: "Extensions",
      estimated_value: 420,
      suggested_next_action: "Aanbetaling en herinnering 24u.",
      status_recommendation: "appointment_booked",
      last_message_at: iso(25),
      notes: null,
      created_at: iso(60 * 15),
      updated_at: iso(25),
    },
    {
      id: "demo-h-l4",
      company_id: DEMO_COMPANY_ID,
      full_name: "Sara K.",
      email: null,
      phone: "+31677778888",
      source: "Google Maps",
      status: "new",
      score: 38,
      summary: "Vraag over permanent — nog niet geantwoord.",
      intent: "Permanente",
      estimated_value: 120,
      suggested_next_action: "Bel terug met huidige wachttijd.",
      status_recommendation: "new",
      last_message_at: iso(60 * 35),
      notes: null,
      created_at: iso(60 * 34),
      updated_at: iso(60 * 35),
    },
    {
      id: "demo-h-l5",
      company_id: DEMO_COMPANY_ID,
      full_name: "Iris de Boer",
      email: "iris@email.nl",
      phone: "+31699990000",
      source: "Referral",
      status: "won",
      score: 92,
      summary: "Bruidspakket geboekt.",
      intent: "Proefsessie + bruiloft",
      estimated_value: 350,
      suggested_next_action: "Aanbetaling ontvangen.",
      status_recommendation: "won",
      last_message_at: iso(60 * 60),
      notes: null,
      created_at: iso(60 * 200),
      updated_at: iso(60 * 60),
    },
  ];

  const messages: Message[] = [
    {
      id: "demo-h-m1",
      conversation_id: "demo-h-c0",
      role: "user",
      content:
        "Hoi! Ik wil graag balayage en een stukje knippen. Wat kost dat ongeveer?",
      created_at: iso(100),
    },
    {
      id: "demo-h-m2",
      conversation_id: "demo-h-c0",
      role: "staff",
      content:
        "Hi Emma — balayage + knippen zit meestal rond €165–195 afhankelijk van lengte. Mag ik een foto van je haar nu?",
      created_at: iso(70),
    },
    {
      id: "demo-h-m3",
      conversation_id: "demo-h-c0",
      role: "user",
      content: "Zit ik op donderdagmiddag ergens?",
      created_at: iso(40),
    },
    {
      id: "demo-h-m4",
      conversation_id: "demo-h-c1",
      role: "user",
      content: "Kunnen jullie mijn kleur bijwerken en baard trimmen?",
      created_at: iso(300),
    },
    {
      id: "demo-h-m5",
      conversation_id: "demo-h-c1",
      role: "staff",
      content:
        "Doe ik graag — ik stuur een offerte met kleurkuur en prijs. Heb je eerder kleur bij ons?",
      created_at: iso(250),
    },
    {
      id: "demo-h-m6",
      conversation_id: "demo-h-c2",
      role: "user",
      content: "Top, tot donderdag!",
      created_at: iso(20),
    },
    {
      id: "demo-h-m7",
      conversation_id: "demo-h-c3",
      role: "user",
      content:
        "Kan ik permanent laten doen? Heb gevoelige hoofdhuid.",
      created_at: iso(60 * 40),
    },
  ];

  const quotes: Quote[] = [
    {
      id: "demo-h-q1",
      company_id: DEMO_COMPANY_ID,
      lead_id: "demo-h-l2",
      title: "Herenkleur + baard",
      description: "Kleur, toner, baard bijwerken.",
      status: "sent",
      currency: "EUR",
      subtotal: 78.51,
      vat_rate: 0.21,
      vat_amount: 16.49,
      total: 95,
      line_items: [
        {
          id: "li-h1",
          description: "Behandeling kleur (heren)",
          quantity: 1,
          unit_price: 55,
          line_total: 55,
        },
        {
          id: "li-h2",
          description: "Baard trimmen",
          quantity: 1,
          unit_price: 23.51,
          line_total: 23.51,
        },
      ],
      internal_notes: null,
      created_at: iso(60 * 8),
      updated_at: iso(60 * 8),
    },
  ];

  const appointments: Appointment[] = [
    {
      id: "demo-h-a1",
      company_id: DEMO_COMPANY_ID,
      lead_id: "demo-h-l3",
      starts_at: isoFuture(30),
      ends_at: isoFuture(31.5),
      status: "confirmed",
      notes: "Extensions + consult",
      created_at: iso(60 * 4),
      updated_at: iso(60 * 4),
    },
  ];

  return { leads, messages, quotes, appointments };
}

function plumber(): DemoDataset {
  const leads: Lead[] = [
    {
      id: "demo-p-l1",
      company_id: DEMO_COMPANY_ID,
      full_name: "Rick Vermeulen",
      email: "rick@home.nl",
      phone: "+31622223333",
      source: "Website",
      status: "active",
      score: 88,
      summary: "Lekkage onder keuken — spoed.",
      intent: "Lekkage spoed",
      estimated_value: 245,
      suggested_next_action: "Voor vandaag monteur voorstellen.",
      status_recommendation: "active",
      last_message_at: iso(50),
      notes: null,
      created_at: iso(60 * 10),
      updated_at: iso(50),
    },
    {
      id: "demo-p-l2",
      company_id: DEMO_COMPANY_ID,
      full_name: "VvE Hoogstraat",
      email: "beheer@vve.nl",
      phone: "+31644445555",
      source: "E-mail",
      status: "quote_sent",
      score: 74,
      summary: "CV-onderhoud + ontluchten 12 appartementen.",
      intent: "Vloerverwarming + ontluchten",
      estimated_value: 1800,
      suggested_next_action: "Offerte akkoord met 3 opties.",
      status_recommendation: "quote_sent",
      last_message_at: iso(220),
      notes: null,
      created_at: iso(60 * 96),
      updated_at: iso(220),
    },
    {
      id: "demo-p-l3",
      company_id: DEMO_COMPANY_ID,
      full_name: "Linda Post",
      email: "linda@gmail.com",
      phone: "+31666667777",
      source: "WhatsApp",
      status: "appointment_booked",
      score: 91,
      summary: "Verstopping badkamer — vrijdag 09:00.",
      intent: "Verstopping",
      estimated_value: 165,
      suggested_next_action: "Route + parkeerinfo sturen.",
      status_recommendation: "appointment_booked",
      last_message_at: iso(28),
      notes: null,
      created_at: iso(60 * 18),
      updated_at: iso(28),
    },
    {
      id: "demo-p-l4",
      company_id: DEMO_COMPANY_ID,
      full_name: "Bas Koning",
      email: null,
      phone: "+31688889999",
      source: "Google Maps",
      status: "new",
      score: 41,
      summary: "Radiator niet warm — wacht op reactie.",
      intent: "Storing CV",
      estimated_value: 190,
      suggested_next_action: "Terugbellen met uurtarief.",
      status_recommendation: "new",
      last_message_at: iso(60 * 40),
      notes: null,
      created_at: iso(60 * 39),
      updated_at: iso(60 * 40),
    },
    {
      id: "demo-p-l5",
      company_id: DEMO_COMPANY_ID,
      full_name: "Studio Noord",
      email: "hallo@studio.nl",
      phone: "+31612345600",
      source: "Referral",
      status: "won",
      score: 93,
      summary: "Badkamerrenovatie — offerte geaccepteerd.",
      intent: "Renovatie",
      estimated_value: 8900,
      suggested_next_action: "Startdatum plannen.",
      status_recommendation: "won",
      last_message_at: iso(60 * 120),
      notes: null,
      created_at: iso(60 * 400),
      updated_at: iso(60 * 120),
    },
  ];

  const messages: Message[] = [
    {
      id: "demo-p-m1",
      conversation_id: "demo-p-c0",
      role: "user",
      content:
        "Er ligt water onder mijn keukenkast. Kunnen jullie vandaag nog komen?",
      created_at: iso(110),
    },
    {
      id: "demo-p-m2",
      conversation_id: "demo-p-c0",
      role: "staff",
      content:
        "Hi Rick — ik plan een monteur tussen 16:00–18:00. Voorrijden €49,95 + €72/u. Mag ik je postcode?",
      created_at: iso(80),
    },
    {
      id: "demo-p-m3",
      conversation_id: "demo-p-c0",
      role: "user",
      content: "5621 AB Eindhoven, 2e verdieping.",
      created_at: iso(50),
    },
    {
      id: "demo-p-m4",
      conversation_id: "demo-p-c1",
      role: "user",
      content:
        "We willen de cv-ketel laten ontluchten voor alle leidingen.",
      created_at: iso(350),
    },
    {
      id: "demo-p-m5",
      conversation_id: "demo-p-c1",
      role: "staff",
      content:
        "Dank — offerte met drie scenario's staat klaar. Akkoord voor optie B?",
      created_at: iso(280),
    },
    {
      id: "demo-p-m6",
      conversation_id: "demo-p-c2",
      role: "user",
      content: "Badkamer loopt niet door — vrijdag ochtend ok?",
      created_at: iso(120),
    },
    {
      id: "demo-p-m7",
      conversation_id: "demo-p-c3",
      role: "user",
      content:
        "Radiator boven blijft koud — wat zijn jullie tarieven?",
      created_at: iso(60 * 45),
    },
  ];

  const quotes: Quote[] = [
    {
      id: "demo-p-q1",
      company_id: DEMO_COMPANY_ID,
      lead_id: "demo-p-l2",
      title: "CV-onderhoud + ontluchten (VvE)",
      description: "Werkzaamheden volgens offerte-optie B.",
      status: "sent",
      currency: "EUR",
      subtotal: 1487.6,
      vat_rate: 0.21,
      vat_amount: 312.4,
      total: 1800,
      line_items: [
        {
          id: "li-p1",
          description: "Arbeid monteur (uren)",
          quantity: 12,
          unit_price: 72,
          line_total: 864,
        },
        {
          id: "li-p2",
          description: "Materiaal en onderdelen",
          quantity: 1,
          unit_price: 623.6,
          line_total: 623.6,
        },
      ],
      internal_notes: null,
      created_at: iso(60 * 12),
      updated_at: iso(60 * 12),
    },
  ];

  const appointments: Appointment[] = [
    {
      id: "demo-p-a1",
      company_id: DEMO_COMPANY_ID,
      lead_id: "demo-p-l3",
      starts_at: isoFuture(22),
      ends_at: isoFuture(23),
      status: "confirmed",
      notes: "Verstopping + camera-inspectie",
      created_at: iso(60 * 6),
      updated_at: iso(60 * 6),
    },
  ];

  return { leads, messages, quotes, appointments };
}

export function getDatasetForNiche(nicheId: NicheId): DemoDataset {
  if (nicheId === "hair_salon") return hairSalon();
  if (nicheId === "plumber") return plumber();
  return garage();
}
