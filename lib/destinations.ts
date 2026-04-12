import type { SearchFormData } from "./types";

export function buildPrompt(form: SearchFormData): string {
  const budgetPart = form.budgetEnabled
    ? `Budget STRICT max ${form.budget}€/personne tout compris (transport + hébergement). AUCUNE destination au-dessus de ce budget.`
    : "Pas de contrainte de budget";
  const durationPart = form.durationEnabled
    ? `Durée souhaitée : environ ${form.duration} jours (+/- 3 jours)`
    : "Pas de contrainte de durée";

  const interests =
    form.interests.length > 0 ? form.interests.join(", ") : "voyage général";

  const transportLabels: Record<string, string> = { plane: "avion", train: "train", car: "voiture", bike: "vélo" };

  let transportLine: string;
  let transportConstraint: string;
  if (form.transport === "bike") {
    transportLine = "- Transport : vélo uniquement";
    transportConstraint = `CONTRAINTE TRANSPORT VÉLO : TOUTES les destinations doivent être accessibles à vélo depuis ${form.city || "le point de départ"} (max 300km). flightPrice = 0 pour toutes. Ne propose PAS de destinations nécessitant un avion ou un long trajet.`;
  } else if (form.transport === "car") {
    transportLine = "- Transport : voiture";
    transportConstraint = "flightPrice = coût estimé carburant + péages aller-retour. Privilégier les destinations accessibles en voiture (même continent).";
  } else if (form.transport === "train") {
    transportLine = "- Transport : train";
    transportConstraint = "flightPrice = prix billet de train aller-retour. Ne proposer que des destinations bien desservies par le train.";
  } else if (form.transport === "plane") {
    transportLine = "- Transport : avion";
    transportConstraint = "flightPrice = prix d'un vol aller-retour.";
  } else {
    transportLine = "- Transport : peu importe";
    transportConstraint = "flightPrice = prix du transport aller-retour (avion, train ou autre selon la destination).";
  }

  const hasCity = form.city.trim().length > 0;
  const hasDates = form.dateFrom && form.dateTo;
  const hasOnlyDeparture = form.dateFrom && !form.dateTo;

  const cityLine = hasCity
    ? `- Départ depuis : ${form.city}`
    : "- Départ depuis : non précisé (propose des destinations accessibles depuis l'Europe de l'Ouest)";

  const datesLine = hasDates
    ? `- Dates : du ${form.dateFrom} au ${form.dateTo}`
    : hasOnlyDeparture
      ? `- Date de départ : ${form.dateFrom}, retour flexible`
      : "- Dates : flexibles (propose des périodes optimales)";

  const weatherRule = hasDates
    ? "7. Météo cohérente avec la saison réelle aux dates données"
    : "7. Météo cohérente avec la meilleure période pour chaque destination";

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
- Contrainte : ${budgetPart}. ${durationPart}
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
    "tempMin": 22,
    "tempMax": 28,
    "weatherIcon": "sun",
    "matchScore": 92,
    "matchedInterests": ["soleil", "gastronomie", "culture"],
    "why": "Soleil garanti en juin, gastronomie exceptionnelle et budget imbattable depuis Paris.",
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
10. JSON UNIQUEMENT — aucun texte avant ou après${budgetFilter}`;
}
