import { DEMO_COMPANY_ID } from "@/lib/demo/company";
import type { Appointment, Lead, Message, Quote } from "@/lib/types";

const now = Date.now();

function iso(mins: number) {
  return new Date(now - mins * 60 * 1000).toISOString();
}

function isoFuture(hours: number) {
  return new Date(now + hours * 3600000).toISOString();
}

function isoFutureDays(days: number, hourFloat = 10) {
  const d = new Date(now + days * 86400000);
  const h = Math.floor(hourFloat);
  const m = Math.round((hourFloat - h) * 60);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

type Msg = Omit<Message, "conversation_id"> & { c: number };

function expand(messages: Msg[]): Message[] {
  return messages.map((m) => {
    const { c, ...rest } = m;
    return { ...rest, conversation_id: `demo-c${c}` };
  });
}

/** 16 leads — index i ↔ demo-c{i} */
const leads: Lead[] = [
  {
    id: "demo-l1",
    company_id: DEMO_COMPANY_ID,
    full_name: "Kevin Jansen",
    email: "kevin.jansen@outlook.nl",
    phone: "+31 6 24 18 90 33",
    source: "WhatsApp",
    status: "active",
    score: 91,
    summary:
      "Tikkend geluid bij remmen Golf 8 — wil inspectie en prijs voor blokken.",
    intent: "Remmen vooras",
    estimated_value: 340,
    suggested_next_action:
      "Inspectieslot morgenochtend voorstellen + kenteken bevestigen.",
    status_recommendation: "active",
    last_message_at: iso(38),
    notes: null,
    ai_tags: ["spoed", "prijsvraag"],
    created_at: iso(60 * 72),
    updated_at: iso(38),
  },
  {
    id: "demo-l2",
    company_id: DEMO_COMPANY_ID,
    full_name: "Samira El Idrissi",
    email: "samira.elidrissi@gmail.com",
    phone: "+31 6 51 44 77 02",
    source: "Website",
    status: "quote_sent",
    score: 86,
    summary:
      "4 zomerbanden 225/45 R17 — montage deze week als het kan.",
    intent: "Banden + montage",
    estimated_value: 580,
    suggested_next_action:
      "Offerte akkoord — banden reserveren en leverdatum bevestigen.",
    status_recommendation: "quote_sent",
    last_message_at: iso(155),
    notes: null,
    ai_tags: ["hoge_waarde"],
    created_at: iso(60 * 96),
    updated_at: iso(155),
  },
  {
    id: "demo-l3",
    company_id: DEMO_COMPANY_ID,
    full_name: "Mark van Loon",
    email: "mark.vanloon@werk.nl",
    phone: "+31 6 88 12 04 56",
    source: "Instagram",
    status: "appointment_booked",
    score: 89,
    summary: "Airco blaast lauw — afspraak do 10:30 bevestigd.",
    intent: "Airco service",
    estimated_value: 210,
    suggested_next_action: "Herinnering 24u + kenteken XX-882-J dubbelcheck.",
    status_recommendation: "appointment_booked",
    last_message_at: iso(22),
    notes: null,
    created_at: iso(60 * 48),
    updated_at: iso(22),
  },
  {
    id: "demo-l4",
    company_id: DEMO_COMPANY_ID,
    full_name: "Denise Bakker",
    email: "denise.bakker@ziggo.nl",
    phone: "+31 6 39 77 21 08",
    source: "E-mail",
    status: "new",
    score: 58,
    summary:
      "Radiator voor links koud — Polo 2019 — wacht op terugbelmoment.",
    intent: "Koeling / CV auto",
    estimated_value: 195,
    suggested_next_action:
      "Terugbellen vóór 17:00 — anders lead koud naar concurrent.",
    status_recommendation: "new",
    last_message_at: iso(60 * 26),
    notes: null,
    created_at: iso(60 * 25),
    updated_at: iso(60 * 26),
  },
  {
    id: "demo-l5",
    company_id: DEMO_COMPANY_ID,
    full_name: "Omar Kaddouri",
    email: "omar.k@icloud.com",
    phone: "+31 6 92 01 88 44",
    source: "WhatsApp",
    status: "won",
    score: 96,
    summary: "Grote beurt + distributieriem pakket geaccepteerd — onderdelen besteld.",
    intent: "Grote beurt",
    estimated_value: 1180,
    suggested_next_action: "Werkorder klaarzetten maandag 07:45.",
    status_recommendation: "won",
    last_message_at: iso(60 * 18),
    notes: null,
    created_at: iso(60 * 400),
    updated_at: iso(60 * 18),
  },
  {
    id: "demo-l6",
    company_id: DEMO_COMPANY_ID,
    full_name: "Lisa de Vries",
    email: "lisa.de.vries@kpnmail.nl",
    phone: "+31 6 14 55 90 11",
    source: "Google Maps",
    status: "active",
    score: 82,
    summary: "APK verloopt volgende week — zo snel mogelijk tussendoor.",
    intent: "APK spoed",
    estimated_value: 89,
    suggested_next_action: "Donderdag 11:20 slot — kenteken bevestigen.",
    status_recommendation: "active",
    last_message_at: iso(112),
    notes: null,
    created_at: iso(60 * 36),
    updated_at: iso(112),
  },
  {
    id: "demo-l7",
    company_id: DEMO_COMPANY_ID,
    full_name: "Brian Smit",
    email: null,
    phone: "+31 6 70 33 44 99",
    source: "Telefoon → inbox",
    status: "quote_sent",
    score: 74,
    summary:
      "Motorlampje + trillen bij 2000 toeren — diagnose gewenst.",
    intent: "Diagnose EOBD",
    estimated_value: 125,
    suggested_next_action: "Uitlezen plannen — offerte diagnose 60 min.",
    status_recommendation: "quote_sent",
    last_message_at: iso(340),
    notes: "Terugbelnotitie: voorkeur vroege ochtend.",
    created_at: iso(60 * 120),
    updated_at: iso(340),
  },
  {
    id: "demo-l8",
    company_id: DEMO_COMPANY_ID,
    full_name: "Youssef Amrani",
    email: "y.amrani@hotmail.nl",
    phone: "+31 6 22 90 77 61",
    source: "WhatsApp",
    status: "appointment_booked",
    score: 88,
    summary: "Accu zwak — start soms niet — vrijdag 08:00 inplanning.",
    intent: "Accu vervangen",
    estimated_value: 220,
    suggested_next_action: "Accu op voorraad leggen 74 Ah AGM.",
    status_recommendation: "appointment_booked",
    last_message_at: iso(51),
    notes: null,
    created_at: iso(60 * 60),
    updated_at: iso(51),
  },
  {
    id: "demo-l9",
    company_id: DEMO_COMPANY_ID,
    full_name: "Noa Peters",
    email: "noa@petersinstallatie.nl",
    phone: "+31 6 45 88 12 30",
    source: "Website",
    status: "active",
    score: 93,
    summary:
      "2 bedrijfsbussen jaarlijks onderhoud — vaste prijs per bus gewenst.",
    intent: "Vlootonderhoud",
    estimated_value: 4200,
    suggested_next_action:
      "Kentekens + km-standen opvragen — accountmanager belt woensdag.",
    status_recommendation: "active",
    last_message_at: iso(67),
    notes: null,
    created_at: iso(60 * 52),
    updated_at: iso(67),
  },
  {
    id: "demo-l10",
    company_id: DEMO_COMPANY_ID,
    full_name: "Wesley de Graaf",
    email: "wesley.dg@email.nl",
    phone: "+31 6 81 20 55 77",
    source: "Facebook",
    status: "lost",
    score: 34,
    summary: "Kiest voor goedkopere APK bij keten — prijs gevoelig.",
    intent: "APK alleen",
    estimated_value: 450,
    suggested_next_action: "Nurture over 90 dagen — bandenwissel aanbieden.",
    status_recommendation: "lost",
    last_message_at: iso(60 * 220),
    notes: null,
    created_at: iso(60 * 300),
    updated_at: iso(60 * 220),
  },
  {
    id: "demo-l11",
    company_id: DEMO_COMPANY_ID,
    full_name: "Fleur van der Meer",
    email: "fleur.vdmeer@live.nl",
    phone: "+31 6 33 66 99 00",
    source: "Instagram",
    status: "new",
    score: 48,
    summary: "Vraag over leenauto bij reparatie — nog geen reactie team.",
      intent: "Leenauto",
      estimated_value: 85,
    suggested_next_action: "Standaard leenauto-policy sturen + beschikbaarheid.",
    status_recommendation: "new",
    last_message_at: iso(60 * 42),
    notes: null,
    created_at: iso(60 * 41),
    updated_at: iso(60 * 42),
  },
  {
    id: "demo-l12",
    company_id: DEMO_COMPANY_ID,
    full_name: "Thomas de Wit",
    email: "thomas.dewit@ziggo.nl",
    phone: "+31 6 19 44 22 88",
    source: "E-mail",
    status: "quote_sent",
    score: 79,
    summary: "APK + kleine beurt Polo — offerte ontvangen, twijfelt op datum.",
    intent: "APK + kleine beurt",
    estimated_value: 320,
    suggested_next_action: "Bel kort — donderdag of vrijdag voorstellen.",
    status_recommendation: "quote_sent",
    last_message_at: iso(410),
    notes: null,
    created_at: iso(60 * 500),
    updated_at: iso(410),
  },
  {
    id: "demo-l13",
    company_id: DEMO_COMPANY_ID,
    full_name: "Renée Mulders",
    email: "renee.mulders@gmail.com",
    phone: "+31 6 58 77 21 09",
    source: "WhatsApp",
    status: "won",
    score: 94,
    summary: "Remblokken voor + schijven — offerte geaccepteerd, komt maandag.",
    intent: "Remmen voor",
    estimated_value: 385,
    suggested_next_action: "Onderdelen binnen — lift reserveren.",
    status_recommendation: "won",
    last_message_at: iso(60 * 8),
    notes: null,
    created_at: iso(60 * 180),
    updated_at: iso(60 * 8),
  },
  {
    id: "demo-l14",
    company_id: DEMO_COMPANY_ID,
    full_name: "Jordy van Hout",
    email: "jordy.vanhout@outlook.com",
    phone: "+31 6 77 01 44 92",
    source: "Website",
    status: "appointment_booked",
    score: 87,
    summary: "Zomerbanden + uitlijnen — woensdag 15:00 vastgelegd.",
    intent: "Banden + uitlijnen",
    estimated_value: 740,
    suggested_next_action: "Banden binnen — uitlijncheck na montage.",
    status_recommendation: "appointment_booked",
    last_message_at: iso(95),
    notes: null,
    created_at: iso(60 * 140),
    updated_at: iso(95),
  },
  {
    id: "demo-l15",
    company_id: DEMO_COMPANY_ID,
    full_name: "Charlotte Brouwer",
    email: null,
    phone: "+31 6 11 22 33 44",
    source: "WhatsApp",
    status: "active",
    score: 84,
    summary: "Storingslampje + motor slaat af bij koude start — spoedintake.",
    intent: "Diagnose motor",
    estimated_value: 165,
    suggested_next_action: "Vandaag nog leesbeurt 45 min aanbieden.",
    status_recommendation: "active",
    last_message_at: iso(19),
    notes: null,
    created_at: iso(60 * 8),
    updated_at: iso(19),
  },
  {
    id: "demo-l16",
    company_id: DEMO_COMPANY_ID,
    full_name: "Daan van der Wal",
    email: "daan.vdwal@bedrijf.nl",
    phone: "+31 6 90 55 44 11",
    source: "Referral",
    status: "quote_sent",
    score: 81,
    summary: "Airco reinigen + vullen — offerte verstuurd, wacht op akkoord.",
    intent: "Airco onderhoud",
    estimated_value: 285,
    suggested_next_action: "Zachte follow-up: vrijdag als geen reactie.",
    status_recommendation: "quote_sent",
    last_message_at: iso(265),
    notes: null,
    created_at: iso(60 * 200),
    updated_at: iso(265),
  },
];

const rawMessages: Msg[] = [
  // c0 Kevin — remmen
  {
    id: "demo-gm-0001",
    c: 0,
    role: "user",
    content:
      "Hoi, mijn auto maakt een tikkend geluid bij het remmen. Golf 8 uit 2021. Wat denken jullie?",
    created_at: iso(400),
  },
  {
    id: "demo-gm-0002",
    c: 0,
    role: "staff",
    content:
      "Hi Kevin, dat klinkt als slijtage remblokken of een roestlip. We kunnen vrijblijvend kijken. Mag ik je kenteken?",
    created_at: iso(395),
  },
  {
    id: "demo-gm-0003",
    c: 0,
    role: "user",
    content: "K-451-GH, 48.200 km. Liever niet te lang wachten.",
    created_at: iso(360),
  },
  {
    id: "demo-gm-0004",
    c: 0,
    role: "staff",
    content:
      "Top. Voor vooras remwerk rekenen we vaak €240–380 incl. arbeid en onderdelen, pas na inspectie echt vast. Morgen 08:00 of 10:30 vrij?",
    created_at: iso(340),
  },
  {
    id: "demo-gm-0005",
    c: 0,
    role: "user",
    content: "08:00 is top. Moet ik reserveren of kom ik gewoon langs?",
    created_at: iso(120),
  },
  {
    id: "demo-gm-0006",
    c: 0,
    role: "staff",
    content:
      "Ik zet je vast op 08:00 — je krijgt een bevestiging per mail. Rijd rustig door, bij nood harder remmen mag even.",
    created_at: iso(90),
  },
  {
    id: "demo-gm-0007",
    c: 0,
    role: "user",
    content: "Helder. Zie ik jullie morgen.",
    created_at: iso(38),
  },
  // c1 Samira — banden
  {
    id: "demo-gm-0008",
    c: 1,
    role: "user",
    content:
      "Goedemiddag, kunnen jullie vier nieuwe zomerbanden monteren? Maat 225/45 R17, voor een Audi A4.",
    created_at: iso(500),
  },
  {
    id: "demo-gm-0009",
    c: 1,
    role: "staff",
    content:
      "Hi Samira, doen we graag. Heb je voorkeur voor merk of mogen wij een middenklasse voorstel doen?",
    created_at: iso(480),
  },
  {
    id: "demo-gm-0010",
    c: 1,
    role: "user",
    content:
      "Geen vaste voorkeur, wel label A op nat wegdek als het kan. Deze week nog?",
    created_at: iso(460),
  },
  {
    id: "demo-gm-0011",
    c: 1,
    role: "staff",
    content:
      "Prima — ik stuur een offerte met montage, balanceren en oude banden milieuvrij. Levering banden meestal 24–48u.",
    created_at: iso(440),
  },
  {
    id: "demo-gm-0012",
    c: 1,
    role: "user",
    content:
      "Offerte gezien. Mag ik woensdag na 15:00 als het binnen is?",
    created_at: iso(155),
  },
  // c2 Mark — airco
  {
    id: "demo-gm-0013",
    c: 2,
    role: "user",
    content:
      "Airco blaast niet meer koud. BMW 320d, XX-882-J. Kunnen jullie kijken?",
    created_at: iso(280),
  },
  {
    id: "demo-gm-0014",
    c: 2,
    role: "staff",
    content:
      "Hi Mark — plannen we. Vaak lek of vocht in systeem. Donderdag 10:30 past bij ons?",
    created_at: iso(260),
  },
  {
    id: "demo-gm-0015",
    c: 2,
    role: "user",
    content: "Doet me denken: ik bedoelde donderdag inderdaad. Zelfde prijs als vorig jaar rond €185?",
    created_at: iso(240),
  },
  {
    id: "demo-gm-0016",
    c: 2,
    role: "staff",
    content:
      "Richting ja — na test eventueel bijvullen apart. Je staat op do 10:30, bevestiging volgt.",
    created_at: iso(220),
  },
  {
    id: "demo-gm-0017",
    c: 2,
    role: "user",
    content: "Top, tot donderdag.",
    created_at: iso(22),
  },
  // c3 Denise — radiator (stale)
  {
    id: "demo-gm-0018",
    c: 3,
    role: "user",
    content:
      "Mijn Polo trekt naar rechts en de radiator links voelt koud aan na rit. Kunnen jullie bellen?",
    created_at: iso(60 * 26),
  },
  // c4 Omar — grote beurt won
  {
    id: "demo-gm-0019",
    c: 4,
    role: "user",
    content:
      "Offerte grote beurt + riem ontvangen. Als ik nu ja zeg, wanneer kunnen jullie?",
    created_at: iso(60 * 30),
  },
  {
    id: "demo-gm-0020",
    c: 4,
    role: "staff",
    content:
      "Mooi Omar — maandag 07:45 inloop, we rekenen op de hele ochtend. Onderdelen liggen klaar.",
    created_at: iso(60 * 28),
  },
  {
    id: "demo-gm-0021",
    c: 4,
    role: "user",
    content: "Perfect. Zie ik Rick aan de balie?",
    created_at: iso(60 * 20),
  },
  {
    id: "demo-gm-0022",
    c: 4,
    role: "staff",
    content: "Ja, die zet je auto op de brug. Tot maandag!",
    created_at: iso(60 * 18),
  },
  // c5 Lisa APK
  {
    id: "demo-gm-0023",
    c: 5,
    role: "user",
    content:
      "Kunnen jullie deze week nog een APK doen? Kaart loopt af vrijdag.",
    created_at: iso(200),
  },
  {
    id: "demo-gm-0024",
    c: 5,
    role: "staff",
    content:
      "Hi Lisa — donderdag 11:20 of vrijdag 08:30 nog vrij. Kenteken?",
    created_at: iso(180),
  },
  {
    id: "demo-gm-0025",
    c: 5,
    role: "user",
    content: "J-204-FK. Donderdag 11:20 graag.",
    created_at: iso(160),
  },
  {
    id: "demo-gm-0026",
    c: 5,
    role: "staff",
    content:
      "Staat genoteerd. APK €89 als alles door de keuring komt — anders bellen we vooraf.",
    created_at: iso(140),
  },
  {
    id: "demo-gm-0027",
    c: 5,
    role: "user",
    content: "👍",
    created_at: iso(112),
  },
  // c6 Brian diagnose
  {
    id: "demo-gm-0028",
    c: 6,
    role: "user",
    content:
      "Motorlampje brandt en bij 2000 tpm trilt hij. Passat 2017. Kan ik langskomen voor diagnose?",
    created_at: iso(400),
  },
  {
    id: "demo-gm-0029",
    c: 6,
    role: "staff",
    content:
      "Brian, dat plannen we. Diagnose 60 min is €95 incl. uitlezen — reparatie apart besproken.",
    created_at: iso(380),
  },
  {
    id: "demo-gm-0030",
    c: 6,
    role: "user",
    content: "Akkoord. Stuur offerte, ik wil woensdag vroeg.",
    created_at: iso(360),
  },
  {
    id: "demo-gm-0031",
    c: 6,
    role: "staff",
    content: "Offerte staat klaar in je mail — wo 07:45 is vrij.",
    created_at: iso(340),
  },
  // c7 Youssef accu
  {
    id: "demo-gm-0032",
    c: 7,
    role: "user",
    content:
      "Ik heb waarschijnlijk een kapotte accu — start traag. Golf 7.",
    created_at: iso(180),
  },
  {
    id: "demo-gm-0033",
    c: 7,
    role: "staff",
    content:
      "Hi Youssef — we testen eerst gratis. Nieuwe AGM vanaf ca. €185 incl. montage.",
    created_at: iso(160),
  },
  {
    id: "demo-gm-0034",
    c: 7,
    role: "user",
    content: "Vrijdagochtend vroeg past goed.",
    created_at: iso(140),
  },
  {
    id: "demo-gm-0035",
    c: 7,
    role: "staff",
    content: "Kom maar om 08:00 — dan staat er iemand klaar.",
    created_at: iso(120),
  },
  {
    id: "demo-gm-0036",
    c: 7,
    role: "user",
    content: "Top.",
    created_at: iso(51),
  },
  // c8 Noa vloot
  {
    id: "demo-gm-0037",
    c: 8,
    role: "user",
    content:
      "Ik zoek onderhoud voor 2 bedrijfsbussen — vaste prijs per jaar mogelijk?",
    created_at: iso(120),
  },
  {
    id: "demo-gm-0038",
    c: 8,
    role: "staff",
    content:
      "Hi Noa — dat doen we voor kleine vloten. Mag ik kentekens en km-standen?",
    created_at: iso(100),
  },
  {
    id: "demo-gm-0039",
    c: 8,
    role: "user",
    content:
      "V-901-BB en V-902-BB, beide rond 140k km. Graag APK inbegrepen in voorstel.",
    created_at: iso(85),
  },
  {
    id: "demo-gm-0040",
    c: 8,
    role: "staff",
    content:
      "Ontvangen — accountmanager belt woensdag om het pakket af te stemmen.",
    created_at: iso(75),
  },
  {
    id: "demo-gm-0041",
    c: 8,
    role: "user",
    content: "Prima, dan wacht ik het telefoontje af.",
    created_at: iso(67),
  },
  // c9 Wesley lost
  {
    id: "demo-gm-0042",
    c: 9,
    role: "user",
    content: "Wat kost een APK voor een Clio 2019 bij jullie?",
    created_at: iso(400),
  },
  {
    id: "demo-gm-0043",
    c: 9,
    role: "staff",
    content:
      "Hoi Wesley — €89 bij goedkeuring, kleine reparaties vooraf besproken.",
    created_at: iso(380),
  },
  {
    id: "demo-gm-0044",
    c: 9,
    role: "user",
    content:
      "Oké, bij de keten om de hoek €69. Dan ga ik daarheen. Thanks.",
    created_at: iso(360),
  },
  {
    id: "demo-gm-0045",
    c: 9,
    role: "staff",
    content:
      "Helder — mocht je later banden of remmen willen, we helpen graag alsnog.",
    created_at: iso(220),
  },
  // c10 Fleur leenauto
  {
    id: "demo-gm-0046",
    c: 10,
    role: "user",
    content: "Hebben jullie een leenauto als de auto een dag blijft?",
    created_at: iso(60 * 42),
  },
  // c11 Thomas APK kleine beurt
  {
    id: "demo-gm-0047",
    c: 11,
    role: "user",
    content:
      "Graag APK + kleine beurt Polo 2018. Wat kost dat ongeveer samen?",
    created_at: iso(500),
  },
  {
    id: "demo-gm-0048",
    c: 11,
    role: "staff",
    content:
      "Hi Thomas — kleine beurt richting €265–310 incl. olie en filter, APK €89. Offerte volgt.",
    created_at: iso(480),
  },
  {
    id: "demo-gm-0049",
    c: 11,
    role: "user",
    content: "Offerte oké — ik twijfel nog tussen do en vr.",
    created_at: iso(410),
  },
  // c12 Renée remmen won
  {
    id: "demo-gm-0050",
    c: 12,
    role: "user",
    content:
      "Remmen voelen zacht en auto trekt naar links bij hard remmen.",
    created_at: iso(250),
  },
  {
    id: "demo-gm-0051",
    c: 12,
    role: "staff",
    content:
      "Renée — klinkt als blokken + schijven voor. Ik stuur offerte met OEM-onderdelen.",
    created_at: iso(230),
  },
  {
    id: "demo-gm-0052",
    c: 12,
    role: "user",
    content: "Akkoord, plan maandag als jullie onderdelen binnen hebben.",
    created_at: iso(200),
  },
  {
    id: "demo-gm-0053",
    c: 12,
    role: "staff",
    content: "Staat klaar — tot maandag 09:00!",
    created_at: iso(60 * 8),
  },
  // c13 Jordy banden
  {
    id: "demo-gm-0054",
    c: 13,
    role: "user",
    content:
      "Kunnen jullie vier nieuwe banden monteren en uitlijnen? Caddy 2020.",
    created_at: iso(300),
  },
  {
    id: "demo-gm-0055",
    c: 13,
    role: "staff",
    content:
      "Jordy — ja. Woensdag 15:00 is vrij op de brug. Bandenmaat?",
    created_at: iso(280),
  },
  {
    id: "demo-gm-0056",
    c: 13,
    role: "user",
    content: "215/55 R17. Akkoord met woensdag.",
    created_at: iso(260),
  },
  {
    id: "demo-gm-0057",
    c: 13,
    role: "staff",
    content: "Top — afspraak staat vast. Tot woensdag.",
    created_at: iso(95),
  },
  // c14 Charlotte motor
  {
    id: "demo-gm-0058",
    c: 14,
    role: "user",
    content:
      "Storing motorlampje brandt en hij slaat soms af na start. Kan vandaag nog?",
    created_at: iso(45),
  },
  {
    id: "demo-gm-0059",
    c: 14,
    role: "staff",
    content:
      "Hi Charlotte — we hebben om 16:30 nog 45 min. Kenteken even door?",
    created_at: iso(35),
  },
  {
    id: "demo-gm-0060",
    c: 14,
    role: "user",
    content: "P-882-RR. Kom eraan.",
    created_at: iso(19),
  },
  // c15 Daan airco offerte
  {
    id: "demo-gm-0061",
    c: 15,
    role: "user",
    content:
      "Airco ruikt muf en koelt zwak — graag reinigen en vullen. Zakelijke lease.",
    created_at: iso(400),
  },
  {
    id: "demo-gm-0062",
    c: 15,
    role: "staff",
    content:
      "Daan — stuur ik offerte voor behandeling + vullen. Leasegoedkeuring nodig?",
    created_at: iso(380),
  },
  {
    id: "demo-gm-0063",
    c: 15,
    role: "user",
    content: "Nee, mag direct. Offerte naar daan.vdwal@bedrijf.nl.",
    created_at: iso(360),
  },
  {
    id: "demo-gm-0064",
    c: 15,
    role: "staff",
    content: "Verstuurd — laat weten als we mogen inplannen.",
    created_at: iso(265),
  },
];

const messages = expand(rawMessages);

function qLine(
  id: string,
  desc: string,
  qty: number,
  unit: number,
): import("@/lib/types").QuoteLineItem {
  const line_total = Math.round(qty * unit * 100) / 100;
  return { id, description: desc, quantity: qty, unit_price: unit, line_total };
}

function withVat(subtotal: number) {
  const vat_rate = 0.21;
  const vat_amount = Math.round(subtotal * vat_rate * 100) / 100;
  const total = Math.round((subtotal + vat_amount) * 100) / 100;
  return { subtotal, vat_rate, vat_amount, total };
}

const quotes: Quote[] = [
  {
    id: "demo-q1",
    company_id: DEMO_COMPANY_ID,
    lead_id: "demo-l2",
    title: "4 zomerbanden + montage + balanceren",
    description:
      "Middenklasse banden label A, milieuvrij afvoeren oude set, ventieldoppen nieuw.",
    status: "sent",
    currency: "EUR",
    ...withVat(478.5),
    line_items: [
      qLine("li-1", "Banden 225/45 R17 (×4)", 4, 98.5),
      qLine("li-2", "Demontage / montage / balanceren", 1, 60),
      qLine("li-3", "TPMS reset en controle", 1, 24.5),
    ],
    internal_notes: "Leverancier: banden wo ochtend binnen.",
    created_at: iso(170),
    updated_at: iso(155),
  },
  {
    id: "demo-q2",
    company_id: DEMO_COMPANY_ID,
    lead_id: "demo-l7",
    title: "Diagnose storingslamp + uitlezen EOBD",
    description: "Uitlezen, rapport, eerste inschatting reparatie.",
    status: "sent",
    currency: "EUR",
    ...withVat(78.51),
    line_items: [qLine("li-4", "Arbeid diagnose (60 min)", 1, 78.51)],
    internal_notes: null,
    created_at: iso(350),
    updated_at: iso(340),
  },
  {
    id: "demo-q3",
    company_id: DEMO_COMPANY_ID,
    lead_id: "demo-l12",
    title: "APK + kleine beurt Polo",
    description: "Olie, filter, algemene controle, APK afmelden RDW.",
    status: "sent",
    currency: "EUR",
    ...withVat(308.51),
    line_items: [
      qLine("li-5", "Kleine beurt (arbeid + materialen)", 1, 235),
      qLine("li-6", "APK-keuring", 1, 73.51),
    ],
    internal_notes: "Klant twijfelt do/vr.",
    created_at: iso(420),
    updated_at: iso(410),
  },
  {
    id: "demo-q4",
    company_id: DEMO_COMPANY_ID,
    lead_id: "demo-l9",
    title: "Vlootonderhoud jaar (2× bedrijfsbus)",
    description:
      "Jaarlijkse inspectie, kleine beurt, APK-planning, pezen vloeistoffen.",
    status: "sent",
    currency: "EUR",
    ...withVat(2860),
    line_items: [
      qLine("li-7", "Arbeid onderhoud per voertuig", 2, 520),
      qLine("li-8", "Onderdelen, filters en APK per bus", 2, 910),
    ],
    internal_notes: "Akkoord intern — wacht op PO klant.",
    created_at: iso(80),
    updated_at: iso(75),
  },
  {
    id: "demo-q5",
    company_id: DEMO_COMPANY_ID,
    lead_id: "demo-l5",
    title: "Grote beurt + distributieriem kit",
    description: "Inclusief waterpomp, koelvloeistof, kleine inspecties.",
    status: "accepted",
    currency: "EUR",
    ...withVat(806),
    line_items: [
      qLine("li-10", "Arbeid (grote beurt + riem)", 1, 520),
      qLine("li-11", "Onderdelen OEM kit", 1, 286),
    ],
    internal_notes: "Geaccepteerd — ma 07:45.",
    created_at: iso(60 * 32),
    updated_at: iso(60 * 30),
  },
  {
    id: "demo-q6",
    company_id: DEMO_COMPANY_ID,
    lead_id: "demo-l13",
    title: "Remblokken + schijven voorzijde",
    description: "OEM-kwaliteit, reinigen remklauw, remvloeistof aanvullen.",
    status: "accepted",
    currency: "EUR",
    ...withVat(348),
    line_items: [
      qLine("li-12", "Remblokken voor (set)", 1, 118),
      qLine("li-13", "Remschijven voor (paar)", 1, 145),
      qLine("li-14", "Arbeid montage en test", 1, 85),
    ],
    internal_notes: "Onderdelen besteld bij leverancier.",
    created_at: iso(220),
    updated_at: iso(200),
  },
  {
    id: "demo-q7",
    company_id: DEMO_COMPANY_ID,
    lead_id: "demo-l16",
    title: "Airco reinigen + vullen R134a",
    description: "Desinfectie verdeler, lektest, vullen volgens fabrieksvoorschrift.",
    status: "sent",
    currency: "EUR",
    ...withVat(194.51),
    line_items: [
      qLine("li-15", "Behandeling en vloeistoffen", 1, 142),
      qLine("li-16", "Arbeid (90 min)", 1, 52.51),
    ],
    internal_notes: "Zakelijk — betaling op rekening.",
    created_at: iso(280),
    updated_at: iso(265),
  },
  {
    id: "demo-q8",
    company_id: DEMO_COMPANY_ID,
    lead_id: "demo-l14",
    title: "Zomerbanden + uitlijning",
    description: "4× banden 215/55 R17, montage, balanceren, uitlijnen voor+achter.",
    status: "sent",
    currency: "EUR",
    ...withVat(611.57),
    line_items: [
      qLine("li-17", "Banden (×4)", 4, 112),
      qLine("li-18", "Montage, balanceren, uitlijnen", 1, 163.57),
    ],
    internal_notes: "Afspraak wo 15:00.",
    created_at: iso(120),
    updated_at: iso(95),
  },
];

const appointments: Appointment[] = [
  {
    id: "demo-a1",
    company_id: DEMO_COMPANY_ID,
    lead_id: "demo-l1",
    starts_at: isoFuture(14),
    ends_at: isoFuture(15),
    status: "confirmed",
    notes: "Kevin Jansen — remmen inspectie 08:00",
    created_at: iso(400),
    updated_at: iso(38),
  },
  {
    id: "demo-a2",
    company_id: DEMO_COMPANY_ID,
    lead_id: "demo-l3",
    starts_at: isoFutureDays(2, 10.5),
    ends_at: isoFutureDays(2, 11.5),
    status: "confirmed",
    notes: "Mark van Loon — airco BMW",
    created_at: iso(300),
    updated_at: iso(22),
  },
  {
    id: "demo-a3",
    company_id: DEMO_COMPANY_ID,
    lead_id: "demo-l8",
    starts_at: isoFutureDays(1, 8),
    ends_at: isoFutureDays(1, 9),
    status: "confirmed",
    notes: "Youssef — accu test + vervang",
    created_at: iso(200),
    updated_at: iso(51),
  },
  {
    id: "demo-a4",
    company_id: DEMO_COMPANY_ID,
    lead_id: "demo-l14",
    starts_at: isoFutureDays(3, 15),
    ends_at: isoFutureDays(3, 16.25),
    status: "confirmed",
    notes: "Jordy — banden + uitlijnen",
    created_at: iso(150),
    updated_at: iso(95),
  },
  {
    id: "demo-a5",
    company_id: DEMO_COMPANY_ID,
    lead_id: "demo-l6",
    starts_at: isoFutureDays(1, 11.33),
    ends_at: isoFutureDays(1, 12.25),
    status: "planned",
    notes: "Lisa — APK",
    created_at: iso(180),
    updated_at: iso(112),
  },
  {
    id: "demo-a6",
    company_id: DEMO_COMPANY_ID,
    lead_id: "demo-l5",
    starts_at: isoFutureDays(-2, 7.75),
    ends_at: isoFutureDays(-2, 12),
    status: "completed",
    notes: "Omar — grote beurt afgerond",
    created_at: iso(60 * 400),
    updated_at: iso(60 * 18),
  },
  {
    id: "demo-a7",
    company_id: DEMO_COMPANY_ID,
    lead_id: "demo-l12",
    starts_at: isoFutureDays(4, 9),
    ends_at: isoFutureDays(4, 11),
    status: "cancelled",
    notes: "Thomas — geannuleerd, klant verplaatst naar andere week",
    created_at: iso(500),
    updated_at: iso(410),
  },
  {
    id: "demo-a8",
    company_id: DEMO_COMPANY_ID,
    lead_id: "demo-l9",
    starts_at: isoFutureDays(5, 10),
    ends_at: isoFutureDays(5, 11),
    status: "planned",
    notes: "Noa — vloot intake telefonisch",
    created_at: iso(90),
    updated_at: iso(67),
  },
  {
    id: "demo-a9",
    company_id: DEMO_COMPANY_ID,
    lead_id: "demo-l13",
    starts_at: isoFutureDays(0, 9),
    ends_at: isoFutureDays(0, 11.5),
    status: "confirmed",
    notes: "Renée — remmen voor",
    created_at: iso(200),
    updated_at: iso(60 * 8),
  },
  {
    id: "demo-a10",
    company_id: DEMO_COMPANY_ID,
    lead_id: "demo-l15",
    starts_at: isoFuture(6),
    ends_at: isoFuture(6.75),
    status: "planned",
    notes: "Charlotte — diagnose motor",
    created_at: iso(40),
    updated_at: iso(19),
  },
];

export function buildGarageDemoDataset(): {
  leads: Lead[];
  messages: Message[];
  quotes: Quote[];
  appointments: Appointment[];
} {
  return { leads, messages, quotes, appointments };
}
