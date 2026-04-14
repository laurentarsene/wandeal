import type { SearchFormData } from "./types";
import { formatHolidaysForPrompt, formatPublicHolidaysForPrompt } from "./school-holidays";

const localeNames: Record<string, string> = {
  fr: "français",
  en: "English",
  nl: "Nederlands",
  de: "Deutsch",
  es: "español",
  it: "italiano",
  pt: "português",
  hi: "English",
};

export function buildPrompt(form: SearchFormData & { locale?: string }): string {
  const lang = localeNames[form.locale || "fr"] || "français";
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

  const hasCar = form.transport.includes("car");
  const hasTrain = form.transport.includes("train");
  const hasPlane = form.transport.includes("plane");
  const origin = form.city || "le point de départ";

  let transportConstraint: string;
  if (onlyBike) {
    transportConstraint = `CONTRAINTE TRANSPORT VÉLO : TOUTES les destinations doivent être accessibles à vélo depuis ${origin} (max 300km). flightPrice = 0 pour toutes. Ne propose PAS de destinations nécessitant un avion ou un long trajet. OBLIGATOIRE : ajoute "distanceKm" (distance en km) et "travelHours" (temps estimé en heures) pour chaque destination.`;
  } else if (form.transport.length > 0 && !hasPlane) {
    // No plane selected — strict distance limits
    const parts: string[] = [];
    let maxKm = 2000;
    if (hasCar && !hasTrain) {
      parts.push("voiture uniquement (flightPrice = carburant + péages AR)");
      maxKm = 1500;
    } else if (hasTrain && !hasCar) {
      parts.push("train uniquement (flightPrice = billet AR, gares bien desservies)");
      maxKm = 1500;
    } else {
      if (hasCar) parts.push("voiture (flightPrice = carburant + péages AR)");
      if (hasTrain) parts.push("train (flightPrice = billet AR)");
      if (hasBike) parts.push("vélo (flightPrice = 0, max 300km)");
    }
    transportConstraint = `CONTRAINTE TRANSPORT TERRESTRE : ${parts.join(" / ")}. TOUTES les destinations doivent être accessibles par route/rail depuis ${origin} (max ${maxKm}km). PAS de destinations sur d'autres continents, PAS d'îles inaccessibles en voiture/train. Pense Europe accessible : France, Pays-Bas, Allemagne, Suisse, Italie du Nord, Espagne, etc. flightPrice = coût du trajet terrestre AR. OBLIGATOIRE : ajoute "distanceKm" (distance aller en km depuis ${origin}) et "travelHours" (temps de trajet aller estimé en heures, ex: 4.5 pour 4h30) pour chaque destination.`;
  } else if (form.transport.length > 0) {
    // Plane is included
    const parts: string[] = [];
    if (hasPlane) parts.push("avion (flightPrice = vol AR)");
    if (hasTrain) parts.push("train (flightPrice = billet AR, destinations bien desservies)");
    if (hasCar) parts.push("voiture (flightPrice = carburant + péages AR)");
    if (hasBike) parts.push("vélo (flightPrice = 0, max 300km)");
    transportConstraint = `Modes de transport acceptés : ${parts.join(" / ")}. Choisir le meilleur mode pour chaque destination parmi ceux sélectionnés. flightPrice correspond au coût du transport choisi.`;
  } else {
    transportConstraint = `Aucun mode de transport imposé. Pour chaque destination, choisis le mode le plus adapté (plane, train, car ou bike) en fonction de la distance depuis ${origin}. flightPrice = prix du transport AR pour le mode choisi. Pour les destinations proches (< 400km), privilégie voiture ou train. Pour les lointaines, privilégie l'avion. Ajoute distanceKm et travelHours pour les transports terrestres.`;
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

  // Date constraints (multi-select: weekend, bridge, holidays, off-holidays)
  const dcs = form.dateConstraints || [];
  const constraintParts: string[] = [];
  const dateLabelParts: string[] = [];

  if (dcs.includes("weekend")) {
    dateLabelParts.push("weekends (ven→dim)");
    constraintParts.push("CONTRAINTE WEEKEND : Les dates proposées DOIVENT être un weekend (départ vendredi, retour dimanche ou lundi). nights = 2 ou 3 maximum.");
  }
  if (dcs.includes("bridge")) {
    const holidays = formatPublicHolidaysForPrompt();
    dateLabelParts.push("ponts / jours fériés");
    constraintParts.push(`CONTRAINTE PONT / JOUR FÉRIÉ : Propose des voyages de 3-4 jours autour d'un jour férié belge. Jours fériés à venir : ${holidays}. Si le férié tombe un jeudi → pont jeudi-dimanche. Si mardi → pont samedi-mardi. Si lundi → samedi-lundi. Si mercredi → mercredi-dimanche ou samedi-mercredi. Chaque destination peut utiliser un férié différent.`);
  }
  if (dcs.includes("holidays-wb")) {
    const periods = formatHolidaysForPrompt("wb");
    dateLabelParts.push("vacances scolaires Wallonie/BXL");
    constraintParts.push(`CONTRAINTE VACANCES SCOLAIRES Wallonie/Bruxelles : Les dates DOIVENT tomber dans une de ces périodes : ${periods}.`);
  }
  if (dcs.includes("holidays-fl")) {
    const periods = formatHolidaysForPrompt("fl");
    dateLabelParts.push("vacances scolaires Flandre");
    constraintParts.push(`CONTRAINTE VACANCES SCOLAIRES Flandre : Les dates DOIVENT tomber dans une de ces périodes : ${periods}.`);
  }
  if (dcs.includes("off-holidays")) {
    const periodsWB = formatHolidaysForPrompt("wb");
    const periodsFL = formatHolidaysForPrompt("fl");
    dateLabelParts.push("hors vacances scolaires");
    constraintParts.push(`CONTRAINTE HORS VACANCES : Les dates NE DOIVENT PAS tomber dans ces périodes — Wallonie/BXL: ${periodsWB} — Flandre: ${periodsFL}. Propose des dates en dehors (moins cher, moins de monde).`);
  }

  if (dateLabelParts.length > 0) {
    datesLine = `- Dates : ${dateLabelParts.join(" + ")}`;
  }
  const dateConstraintLine = constraintParts.join("\n");

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
  const periodLabelRule = ""; // datePeriodLabel is now computed server-side from real calendar data

  const localRule = hasCity
    ? `4. TOUJOURS exactement 1 destination avec isLocal: true → rester dans ou près de ${form.city}, proposer un hôtel ou hébergement pas cher + expériences locales`
    : "4. TOUJOURS exactement 1 destination avec isLocal: true → proposer un séjour local dans une grande ville européenne avec hébergement pas cher";

  const budgetFilter = form.budgetEnabled
    ? `\n11. VÉRIFICATION BUDGET : totalPerPerson DOIT être ≤ ${form.budget}€ pour CHAQUE destination. Si le budget est très serré (< 200€), propose camping, auberges de jeunesse, couchsurfing. Si budget = 100€, propose uniquement des destinations très proches et gratuites ou quasi-gratuites.`
    : "";

  return `Tu es un expert en voyages et en bons plans. Génère des recommandations de vacances personnalisées et réalistes.
LANGUE : Tous les textes (why, activities) DOIVENT être en ${lang}.
IMPORTANT : Toutes les destinations et tous les prix doivent être calculés DEPUIS ${origin}. La ville de départ est ${origin}, PAS Bruxelles (sauf si c'est la ville choisie).

Voyageur :
${cityLine}
${datesLine}
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
    "dateFrom": "2026-09-15",
    "dateTo": "2026-09-20",
    "transportMode": "plane",
    "tempMin": 22,
    "tempMax": 28,
    "weatherIcon": "sun",
    "matchScore": 92,
    "matchedInterests": ["soleil", "gastronomie", "culture"],
    "why": "Le quartier de l'Alfama offre des ruelles authentiques et des miradouros avec vue sur le Tage. Les Pastéis de Belém sont un incontournable, et le Tramway 28 traverse les plus beaux quartiers.",
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
5. TOUJOURS exactement 1 destination avec isSurprise: true → destination que presque personne ne connait, un vrai secret de voyageur
6. Prix RÉALISTES depuis ${origin} — flightPrice = prix du transport DEPUIS ${origin} (pas depuis Bruxelles sauf si c'est la ville de départ). totalPerPerson = flightPrice + (hotelPerNight × nights). Les prix varient selon la ville de départ !
${weatherRule}
8. DIVERSITÉ OBLIGATOIRE dans les 8 destinations :
   - 2-3 classiques populaires (les incontournables qui matchent les envies)
   - 2-3 alternatives méconnues (petites villes, îles peu connues, régions hors des sentiers battus)
   - 1 surprise totale (isSurprise=true, un lieu que même les voyageurs réguliers ne connaissent pas)
   - 1 local (isLocal=true)
   INTERDIT de proposer uniquement des capitales ou des destinations touristiques de masse. Le champ "name" peut être une ville, un village, OU une région naturelle (ex: "Forêt Noire", "Dolomites", "Highlands", "Algarve", "Cinque Terre", "Fjords de Norvège"). Pense aux villages côtiers, aux villes secondaires, aux régions reculées, aux parcs naturels, aux pays sous-estimés (Albanie, Géorgie, Slovénie, Oman, Colombie, etc.)
9. Si budget serré (< 400€), proposer des destinations vraiment accessibles (proches, low-cost, auberges)
10. JSON UNIQUEMENT — aucun texte avant ou après
11. IMPORTANT "why" : Le champ "why" doit être SPÉCIFIQUE et CONCRET — explique POURQUOI cette destination est parfaite pour les envies sélectionnées. Cite des lieux précis, des spécialités, des expériences uniques. PAS de phrases génériques. Ex: pour "shopping" à Marrakech → parle des souks, du cuir, des épices. Pour "surf" à Biarritz → parle de la Côte des Basques, des vagues.
${datesRule}${periodLabelRule}${accommodationConstraint ? "\n" + accommodationConstraint : ""}
14. transportMode : OBLIGATOIRE — indique le mode de transport choisi pour chaque destination parmi ceux sélectionnés ("plane", "train", "car" ou "bike"). Si transport terrestre, ajoute aussi distanceKm (aller en km) et travelHours (aller en heures, ex: 4.5). Pour l'avion, omets distanceKm et travelHours.${budgetFilter}`;
}
