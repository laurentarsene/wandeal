import type { SearchFormData } from "./types";
import { formatHolidaysForPrompt, formatPublicHolidaysForPrompt } from "./school-holidays";

export function buildPrompt(form: SearchFormData): string {
  const budgetPart = form.budgetEnabled
    ? `Budget STRICT max ${form.budget}€/personne tout compris (transport + hébergement). AUCUNE destination au-dessus de ce budget.`
    : "Pas de contrainte de budget";
  const durationPart = form.durationEnabled
    ? `Durée souhaitée : environ ${form.duration} jours (+/- 3 jours)`
    : "Pas de contrainte de durée";

  const interestHints: Record<string, string> = {
    soleil: "destinations ensoleillées, climat chaud garanti, chaleur",
    plage: "vraies plages de sable pour se baigner (mer, océan), pas de lacs ni piscines",
    ski: "stations de ski, domaines skiables avec remontées mécaniques, neige garantie aux dates",
    trek: "randonnée en montagne ou en pleine nature, sentiers de trek reconnus (GR, chemins balisés), pas de promenades urbaines",
    gastronomie: "destinations réputées pour leur cuisine locale authentique, marchés, restaurants locaux, spécialités régionales à goûter sur place",
    teuf: "vie nocturne intense, clubs, bars, fêtes, destinations connues pour sortir (Ibiza, Berlin, Bangkok…)",
    famille: "destinations adaptées aux enfants, activités familiales, parcs, sécurité, facilité logistique",
    culture: "musées majeurs, sites UNESCO, patrimoine architectural, scène artistique vivante",
    detente: "repos total, calme, déconnexion, endroits paisibles loin du tourisme de masse",
    nature: "grands espaces naturels, parcs nationaux, forêts, lacs, fjords, paysages sauvages préservés",
    citybreak: "escapade dans une grande ville, visites à pied, cafés, ambiance urbaine, 2-4 jours",
    romantique: "destinations pour couples, cadre romantique, hôtels de charme, dîners en tête-à-tête",
    aventure: "activités à sensations fortes en plein air : rafting, escalade, parapente, zip-line, via ferrata",
    surf: "spots de surf reconnus avec vagues adaptées, écoles de surf, culture surf (Biarritz, Nazaré, Bali, Hossegor…)",
    plongee: "plongée sous-marine ou snorkeling dans des eaux claires, récifs coralliens, vie marine riche, centres de plongée certifiés",
    shopping: "destinations connues pour le shopping : souks, marchés, outlets, quartiers commerçants emblématiques, bonnes affaires",
    spa: "bien-être, thermes naturels, hammams, spas réputés, sources chaudes (Islande, Budapest, Bali…)",
    roadtrip: "itinéraires en voiture avec paysages variés, routes panoramiques, liberté de s'arrêter, étapes multiples",
    photo: "paysages spectaculaires et photogéniques, lumières exceptionnelles, spots Instagram, panoramas à couper le souffle",
    safari: "VRAIS safaris animaliers dans des réserves naturelles ou parcs nationaux pour observer la faune sauvage en liberté (Big Five, grands mammifères, oiseaux). Afrique, mais aussi parcs naturels en Europe du Nord (élans en Suède, ours en Finlande…). PAS de zoos, PAS de safaris urbains, PAS de parcs d'attractions",
    histoire: "sites historiques majeurs, ruines antiques, champs de bataille, villes médiévales, patrimoine vivant",
    festival: "festivals de musique live (électro, rock, jazz, techno…) — PAS de festivals de BD, cinéma ou gastronomie",
    backpacker: "destinations budget pour voyageurs sac-à-dos, auberges de jeunesse, street food pas chère, communauté backpacker, liberté",
  };

  const interests =
    form.interests.length > 0
      ? form.interests.map((i) => interestHints[i] ?? i).join(", ")
      : "voyage général";

  const accommodationLabels: Record<string, string> = {
    hotel: "hôtel",
    hostel: "auberge de jeunesse / hostel",
    airbnb: "Airbnb / appartement",
    camping: "camping / van / tente",
  };
  const accommodations = form.accommodation?.length > 0
    ? form.accommodation.map((a) => accommodationLabels[a]).join(", ")
    : "";
  const comfortLabels: Record<string, string> = {
    budget: "budget / économique (le moins cher possible, dortoirs, camping basique)",
    standard: "standard / milieu de gamme (bon rapport qualité-prix)",
    premium: "premium / haut de gamme (hôtels 4-5 étoiles, villas, suites, expériences luxe)",
  };
  const comfortLevel = comfortLabels[form.comfort || "standard"];

  const accommodationLine = accommodations
    ? `- Logement : ${accommodations} — standing ${comfortLevel}. hotelPerNight = prix par nuit pour ce type et ce standing.`
    : `- Standing logement : ${comfortLevel}`;
  const accommodationConstraint = accommodations
    ? `CONTRAINTE LOGEMENT : Propose UNIQUEMENT des logements de type ${accommodations}, standing ${form.comfort || "standard"}. Adapte hotelPerNight au type ET au standing choisi.`
    : form.comfort !== "standard"
      ? `CONTRAINTE STANDING : Adapte le standing des logements au niveau "${form.comfort}". ${form.comfort === "budget" ? "Prix les plus bas possibles (dortoirs, camping, couchsurfing)." : "Hôtels haut de gamme, villas, suites, expériences premium."}`
      : "";

  const transportLabels: Record<string, string> = { plane: "avion", train: "train", car: "voiture", bike: "vélo" };
  const transports = form.transport.length > 0
    ? form.transport.map((t) => transportLabels[t]).join(", ")
    : "peu importe";

  const transportLine = `- Transport : ${transports}`;

  const hasBike = form.transport.includes("bike");
  const onlyBike = form.transport.length === 1 && hasBike;

  let transportConstraint: string;
  if (onlyBike) {
    transportConstraint = `CONTRAINTE TRANSPORT VÉLO : TOUTES les destinations doivent être accessibles à vélo depuis ${form.city || "le point de départ"} (max 300km). flightPrice = 0 pour toutes. Ne propose PAS de destinations nécessitant un avion ou un long trajet.`;
  } else if (form.transport.length > 0) {
    const parts: string[] = [];
    if (form.transport.includes("plane")) parts.push("avion (flightPrice = vol AR)");
    if (form.transport.includes("train")) parts.push("train (flightPrice = billet AR, destinations bien desservies)");
    if (form.transport.includes("car")) parts.push("voiture (flightPrice = carburant + péages AR)");
    if (hasBike) parts.push("vélo (flightPrice = 0, max 300km)");
    transportConstraint = `Modes de transport acceptés : ${parts.join(" / ")}. Choisir le meilleur mode pour chaque destination parmi ceux sélectionnés. flightPrice correspond au coût du transport choisi.`;
  } else {
    transportConstraint = "flightPrice = prix du transport aller-retour (avion, train ou autre selon la destination).";
  }

  const hasCity = form.city.trim().length > 0;
  const hasDates = form.dateFrom && form.dateTo;
  const hasOnlyDeparture = form.dateFrom && !form.dateTo;

  const cityLine = hasCity
    ? `- Départ depuis : ${form.city}`
    : "- Départ depuis : non précisé (propose des destinations accessibles depuis l'Europe de l'Ouest)";

  let datesLine = hasDates
    ? `- Dates : du ${form.dateFrom} au ${form.dateTo}`
    : hasOnlyDeparture
      ? `- Date de départ : ${form.dateFrom}, retour flexible`
      : "- Dates : flexibles (propose des périodes optimales)";

  // Date constraint (weekend, school holidays, etc.)
  const dc = form.dateConstraint || "any";
  let dateConstraintLine = "";
  if (dc === "weekend") {
    datesLine = "- Dates : uniquement les weekends (vendredi → dimanche, 2-3 nuits)";
    dateConstraintLine = "CONTRAINTE WEEKEND : Les dates proposées DOIVENT être un weekend (départ vendredi, retour dimanche ou lundi). nights = 2 ou 3 maximum.";
  } else if (dc === "holidays-wb") {
    const periods = formatHolidaysForPrompt("wb");
    datesLine = "- Dates : pendant les vacances scolaires belges (Wallonie/Bruxelles)";
    dateConstraintLine = `CONTRAINTE VACANCES SCOLAIRES Wallonie/Bruxelles : Les dates DOIVENT tomber dans une de ces périodes : ${periods}. Chaque destination peut utiliser une période différente.`;
  } else if (dc === "holidays-fl") {
    const periods = formatHolidaysForPrompt("fl");
    datesLine = "- Dates : pendant les vacances scolaires belges (Flandre)";
    dateConstraintLine = `CONTRAINTE VACANCES SCOLAIRES Flandre : Les dates DOIVENT tomber dans une de ces périodes : ${periods}. Chaque destination peut utiliser une période différente.`;
  } else if (dc === "off-holidays") {
    const periodsWB = formatHolidaysForPrompt("wb");
    const periodsFL = formatHolidaysForPrompt("fl");
    datesLine = "- Dates : HORS vacances scolaires belges (ni Wallonie ni Flandre)";
    dateConstraintLine = `CONTRAINTE HORS VACANCES : Les dates NE DOIVENT PAS tomber dans ces périodes de vacances scolaires belges — Wallonie/BXL: ${periodsWB} — Flandre: ${periodsFL}. Propose des dates en dehors de toutes ces périodes (moins cher, moins de monde).`;
  } else if (dc === "bridge") {
    const holidays = formatPublicHolidaysForPrompt();
    datesLine = "- Dates : profiter d'un jour férié belge pour faire un pont (3-4 jours)";
    dateConstraintLine = `CONTRAINTE PONT / JOUR FÉRIÉ : Propose des voyages de 3-4 jours autour d'un jour férié belge pour maximiser les jours off. Jours fériés à venir : ${holidays}. Si le férié tombe un jeudi → pont jeudi-dimanche. Si mardi → pont samedi-mardi. Si lundi → samedi-lundi. Si mercredi → mercredi-dimanche ou samedi-mercredi. Chaque destination peut utiliser un férié différent. nights = 3 ou 4.`;
  }

  const weatherRule = hasDates
    ? "7. Météo cohérente avec la saison réelle aux dates données"
    : "7. Météo cohérente avec la meilleure période pour chaque destination";

  const today = new Date().toISOString().slice(0, 10);
  let datesRule: string;
  if (hasDates) {
    datesRule = `12. dateFrom et dateTo : utilise les dates du voyageur (${form.dateFrom} / ${form.dateTo}) pour TOUTES les destinations. Ajuste "nights" en conséquence.`;
  } else if (hasOnlyDeparture) {
    datesRule = `12. dateFrom : utilise ${form.dateFrom} pour toutes. dateTo : calcule en fonction de "nights". Chaque destination peut avoir une durée différente.`;
  } else {
    datesRule = `12. AUJOURD'HUI = ${today}. dateFrom et dateTo : suggère les MEILLEURES dates pour chaque destination (période la moins chère, meilleure saison, événements…). Chaque destination peut avoir des dates DIFFÉRENTES. Les dates DOIVENT être dans le futur (entre maintenant et les 12 prochains mois). Format YYYY-MM-DD.`;
  }
  if (dateConstraintLine) {
    datesRule += `\n${dateConstraintLine}`;
  }
  const periodLabelRule = dc !== "any"
    ? `\n13. datePeriodLabel : OBLIGATOIRE — indique le nom de la période choisie pour chaque destination. Exemples : "Weekend (ven→dim)", "Pont de l'Ascension", "Toussaint 2026", "Été 2026", "Hors vacances". Court et clair.`
    : `\n13. datePeriodLabel : optionnel — si tu suggères des dates pendant une période notable (vacances, pont, été…), indique-le. Sinon omets ce champ.`;

  const localRule = hasCity
    ? `4. TOUJOURS exactement 1 destination avec isLocal: true → rester dans ou près de ${form.city}, proposer un hôtel ou hébergement pas cher + expériences locales`
    : "4. TOUJOURS exactement 1 destination avec isLocal: true → proposer un séjour local dans une grande ville européenne avec hébergement pas cher";

  const budgetFilter = form.budgetEnabled
    ? `\n11. VÉRIFICATION BUDGET : totalPerPerson DOIT être ≤ ${form.budget}€ pour CHAQUE destination. Si le budget est très serré (< 200€), propose camping, auberges de jeunesse, couchsurfing. Si budget = 100€, propose uniquement des destinations très proches et gratuites ou quasi-gratuites.`
    : "";

  return `Tu es un expert en voyages et en bons plans. Génère des recommandations de vacances personnalisées et réalistes.

Voyageur :
${cityLine}
${datesLine}
- Nombre de voyageurs : ${form.travelers}
${transportLine}
${accommodationLine ? accommodationLine + "\n" : ""}- Contrainte : ${budgetPart}. ${durationPart}
- Envies : ${interests}

${transportConstraint}

Retourne UNIQUEMENT un objet JSON valide (sans backticks markdown), avec exactement 8 destinations dans ce format :

{
  "destinations": [{
    "name": "Lisbonne",
    "country": "Portugal",
    "flag": "🇵🇹",
    "colorTheme": "amber",
    "flightPrice": 89,
    "hotelPerNight": 65,
    "totalPerPerson": 414,
    "nights": 5,
    "dateFrom": "2026-06-15",
    "dateTo": "2026-06-20",
    "datePeriodLabel": "Weekend (ven→dim)",
    "tempMin": 22,
    "tempMax": 28,
    "weatherIcon": "sun",
    "matchScore": 92,
    "matchedInterests": ["soleil", "gastronomie", "culture"],
    "why": "Les souks de Marrakech sont un paradis du shopping : cuir artisanal, épices, tapis berbères à prix négociables. La médina est un labyrinthe de bonnes affaires.",
    "mealPrice": 12,
    "fritesPrice": 3.5,
    "activities": ["Pastéis de Belém", "Tramway 28", "Plage de Cascais", "Quartier de l'Alfama"],
    "isLocal": false,
    "isSurprise": false
  }]
}

Règles STRICTES :
1. colorTheme = teal | amber | blue | coral | purple | green | slate
2. weatherIcon = sun | cloud | snow | rain
3. matchScore entre 65 et 99
${localRule}
5. TOUJOURS exactement 1 destination avec isSurprise: true → destination vraiment inattendue et originale
6. Prix RÉALISTES — totalPerPerson = flightPrice + (hotelPerNight × nights)
${weatherRule}
8. Varier les types de voyage
9. Si budget serré (< 400€), proposer des destinations vraiment accessibles (proches, low-cost, auberges)
10. JSON UNIQUEMENT — aucun texte avant ou après
11. IMPORTANT "why" : Le champ "why" doit être SPÉCIFIQUE et CONCRET — explique POURQUOI cette destination est parfaite pour les envies sélectionnées. Cite des lieux précis, des spécialités, des expériences uniques. PAS de phrases génériques. Ex: pour "shopping" à Marrakech → parle des souks, du cuir, des épices. Pour "surf" à Biarritz → parle de la Côte des Basques, des vagues.
${datesRule}${periodLabelRule}${accommodationConstraint ? "\n" + accommodationConstraint : ""}${budgetFilter}`;
}
