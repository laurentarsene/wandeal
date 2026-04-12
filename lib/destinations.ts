import type { SearchFormData } from "./types";

export function buildPrompt(form: SearchFormData): string {
  const budgetPart = form.budgetEnabled
    ? `Budget max ${form.budget}€/personne tout compris (transport + hébergement)`
    : "Pas de contrainte de budget";
  const durationPart = form.durationEnabled
    ? `Durée souhaitée : environ ${form.duration} jours (+/- 3 jours)`
    : "Pas de contrainte de durée";
  const constraint = `${budgetPart}. ${durationPart}`;

  const interests =
    form.interests.length > 0 ? form.interests.join(", ") : "voyage général";

  const transportLabels: Record<string, string> = { plane: "avion", train: "train", car: "voiture", bike: "vélo" };
  const transportLine = form.transport
    ? `- Transport : ${transportLabels[form.transport]}`
    : "- Transport : peu importe (proposer le meilleur rapport qualité/prix)";

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

  const transportPriceNote =
    form.transport === "car"
      ? "flightPrice représente le coût estimé en carburant/péage pour un trajet en voiture"
      : form.transport === "train"
        ? "flightPrice représente le prix d'un billet de train aller-retour, proposer des destinations bien desservies en train"
        : form.transport === "bike"
          ? "flightPrice = 0 (vélo), proposer uniquement des destinations accessibles à vélo depuis le point de départ (max ~300-500km)"
          : form.transport === "plane"
            ? "flightPrice = prix d'un vol aller-retour"
            : "flightPrice = prix du transport aller-retour (avion, train ou autre selon la destination)";

  const priceRule = hasCity
    ? hasDates
      ? `6. Prix réalistes depuis ${form.city} aux dates données. ${transportPriceNote}`
      : `6. Prix réalistes depuis ${form.city} en moyenne saison. ${transportPriceNote}`
    : `6. Prix réalistes depuis une grande ville européenne. ${transportPriceNote}`;

  const localRule = hasCity
    ? `4. TOUJOURS exactement 1 destination avec isLocal: true → rester dans ou près de ${form.city}, proposer un hôtel 4-5★ + expériences premium locales que les habitants eux-mêmes font rarement`
    : "4. TOUJOURS exactement 1 destination avec isLocal: true → proposer un séjour local dans une grande ville européenne (Paris, Bruxelles, Amsterdam…) avec un hôtel 4-5★ + expériences premium";

  return `Tu es un expert en voyages et en bons plans. Génère des recommandations de vacances personnalisées et réalistes.

Voyageur :
${cityLine}
${datesLine}
- Nombre de voyageurs : ${form.travelers}
${transportLine}
- Contrainte : ${constraint}
- Envies : ${interests}

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
5. TOUJOURS exactement 1 destination avec isSurprise: true → destination vraiment inattendue et originale (ex: Tbilissi, Açores, Oman, Plovdiv, Cap-Vert…)
${priceRule}
${weatherRule}
8. Varier les continents et les types de voyage
9. Si budget serré (< 400€), proposer des destinations vraiment accessibles (Portugal, Maroc, Balkans, vols low-cost…)
10. JSON UNIQUEMENT — aucun texte avant ou après`;
}
