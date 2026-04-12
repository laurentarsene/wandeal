interface CityEntry {
  city: string;
  country: string;
}

const airportCities: CityEntry[] = [
  // Belgique
  { city: "Bruxelles", country: "Belgique" },
  { city: "Charleroi", country: "Belgique" },
  { city: "Anvers", country: "Belgique" },
  { city: "Liège", country: "Belgique" },
  { city: "Ostende", country: "Belgique" },

  // France
  { city: "Paris", country: "France" },
  { city: "Lyon", country: "France" },
  { city: "Marseille", country: "France" },
  { city: "Nice", country: "France" },
  { city: "Toulouse", country: "France" },
  { city: "Bordeaux", country: "France" },
  { city: "Nantes", country: "France" },
  { city: "Strasbourg", country: "France" },
  { city: "Lille", country: "France" },
  { city: "Montpellier", country: "France" },
  { city: "Rennes", country: "France" },
  { city: "Grenoble", country: "France" },
  { city: "Biarritz", country: "France" },
  { city: "Ajaccio", country: "France" },
  { city: "Bastia", country: "France" },
  { city: "La Réunion", country: "France" },
  { city: "Fort-de-France", country: "France" },
  { city: "Pointe-à-Pitre", country: "France" },

  // Suisse
  { city: "Genève", country: "Suisse" },
  { city: "Zurich", country: "Suisse" },
  { city: "Bâle", country: "Suisse" },
  { city: "Berne", country: "Suisse" },
  { city: "Lausanne", country: "Suisse" },

  // Luxembourg
  { city: "Luxembourg", country: "Luxembourg" },

  // Pays-Bas
  { city: "Amsterdam", country: "Pays-Bas" },
  { city: "Rotterdam", country: "Pays-Bas" },
  { city: "Eindhoven", country: "Pays-Bas" },

  // Allemagne
  { city: "Berlin", country: "Allemagne" },
  { city: "Munich", country: "Allemagne" },
  { city: "Francfort", country: "Allemagne" },
  { city: "Düsseldorf", country: "Allemagne" },
  { city: "Hambourg", country: "Allemagne" },
  { city: "Cologne", country: "Allemagne" },
  { city: "Stuttgart", country: "Allemagne" },

  // Royaume-Uni
  { city: "Londres", country: "Royaume-Uni" },
  { city: "Manchester", country: "Royaume-Uni" },
  { city: "Birmingham", country: "Royaume-Uni" },
  { city: "Édimbourg", country: "Royaume-Uni" },
  { city: "Glasgow", country: "Royaume-Uni" },
  { city: "Bristol", country: "Royaume-Uni" },
  { city: "Liverpool", country: "Royaume-Uni" },

  // Irlande
  { city: "Dublin", country: "Irlande" },
  { city: "Cork", country: "Irlande" },

  // Espagne
  { city: "Madrid", country: "Espagne" },
  { city: "Barcelone", country: "Espagne" },
  { city: "Malaga", country: "Espagne" },
  { city: "Séville", country: "Espagne" },
  { city: "Valence", country: "Espagne" },
  { city: "Palma de Majorque", country: "Espagne" },
  { city: "Ibiza", country: "Espagne" },
  { city: "Tenerife", country: "Espagne" },
  { city: "Las Palmas", country: "Espagne" },
  { city: "Bilbao", country: "Espagne" },
  { city: "Alicante", country: "Espagne" },

  // Portugal
  { city: "Lisbonne", country: "Portugal" },
  { city: "Porto", country: "Portugal" },
  { city: "Faro", country: "Portugal" },
  { city: "Funchal", country: "Portugal" },
  { city: "Ponta Delgada", country: "Portugal" },

  // Italie
  { city: "Rome", country: "Italie" },
  { city: "Milan", country: "Italie" },
  { city: "Naples", country: "Italie" },
  { city: "Venise", country: "Italie" },
  { city: "Florence", country: "Italie" },
  { city: "Bologne", country: "Italie" },
  { city: "Catane", country: "Italie" },
  { city: "Palerme", country: "Italie" },
  { city: "Turin", country: "Italie" },
  { city: "Bari", country: "Italie" },
  { city: "Cagliari", country: "Italie" },

  // Grèce
  { city: "Athènes", country: "Grèce" },
  { city: "Thessalonique", country: "Grèce" },
  { city: "Héraklion", country: "Grèce" },
  { city: "Santorin", country: "Grèce" },
  { city: "Mykonos", country: "Grèce" },
  { city: "Rhodes", country: "Grèce" },
  { city: "Corfou", country: "Grèce" },

  // Turquie
  { city: "Istanbul", country: "Turquie" },
  { city: "Antalya", country: "Turquie" },
  { city: "Izmir", country: "Turquie" },
  { city: "Bodrum", country: "Turquie" },

  // Croatie
  { city: "Zagreb", country: "Croatie" },
  { city: "Split", country: "Croatie" },
  { city: "Dubrovnik", country: "Croatie" },

  // Europe de l'Est / Balkans
  { city: "Prague", country: "Tchéquie" },
  { city: "Budapest", country: "Hongrie" },
  { city: "Varsovie", country: "Pologne" },
  { city: "Cracovie", country: "Pologne" },
  { city: "Vienne", country: "Autriche" },
  { city: "Bucarest", country: "Roumanie" },
  { city: "Sofia", country: "Bulgarie" },
  { city: "Belgrade", country: "Serbie" },
  { city: "Tirana", country: "Albanie" },
  { city: "Sarajevo", country: "Bosnie-Herzégovine" },
  { city: "Podgorica", country: "Monténégro" },
  { city: "Skopje", country: "Macédoine du Nord" },
  { city: "Ljubljana", country: "Slovénie" },
  { city: "Bratislava", country: "Slovaquie" },
  { city: "Plovdiv", country: "Bulgarie" },

  // Scandinavie / Baltique
  { city: "Copenhague", country: "Danemark" },
  { city: "Stockholm", country: "Suède" },
  { city: "Oslo", country: "Norvège" },
  { city: "Helsinki", country: "Finlande" },
  { city: "Reykjavik", country: "Islande" },
  { city: "Riga", country: "Lettonie" },
  { city: "Tallinn", country: "Estonie" },
  { city: "Vilnius", country: "Lituanie" },

  // Caucase / Asie centrale
  { city: "Tbilissi", country: "Géorgie" },
  { city: "Erevan", country: "Arménie" },
  { city: "Bakou", country: "Azerbaïdjan" },

  // Afrique du Nord
  { city: "Casablanca", country: "Maroc" },
  { city: "Marrakech", country: "Maroc" },
  { city: "Agadir", country: "Maroc" },
  { city: "Fès", country: "Maroc" },
  { city: "Tanger", country: "Maroc" },
  { city: "Tunis", country: "Tunisie" },
  { city: "Djerba", country: "Tunisie" },
  { city: "Alger", country: "Algérie" },
  { city: "Oran", country: "Algérie" },
  { city: "Le Caire", country: "Égypte" },
  { city: "Hurghada", country: "Égypte" },
  { city: "Charm el-Cheikh", country: "Égypte" },
  { city: "Louxor", country: "Égypte" },

  // Afrique subsaharienne
  { city: "Dakar", country: "Sénégal" },
  { city: "Abidjan", country: "Côte d'Ivoire" },
  { city: "Kinshasa", country: "RD Congo" },
  { city: "Douala", country: "Cameroun" },
  { city: "Yaoundé", country: "Cameroun" },
  { city: "Lomé", country: "Togo" },
  { city: "Cotonou", country: "Bénin" },
  { city: "Ouagadougou", country: "Burkina Faso" },
  { city: "Bamako", country: "Mali" },
  { city: "Conakry", country: "Guinée" },
  { city: "Libreville", country: "Gabon" },
  { city: "Brazzaville", country: "Congo" },
  { city: "Antananarivo", country: "Madagascar" },
  { city: "Nosy Be", country: "Madagascar" },
  { city: "Nairobi", country: "Kenya" },
  { city: "Mombasa", country: "Kenya" },
  { city: "Zanzibar", country: "Tanzanie" },
  { city: "Dar es Salaam", country: "Tanzanie" },
  { city: "Le Cap", country: "Afrique du Sud" },
  { city: "Johannesburg", country: "Afrique du Sud" },
  { city: "Île Maurice", country: "Maurice" },
  { city: "Windhoek", country: "Namibie" },
  { city: "Accra", country: "Ghana" },
  { city: "Lagos", country: "Nigeria" },
  { city: "Addis-Abeba", country: "Éthiopie" },
  { city: "Kigali", country: "Rwanda" },

  // Moyen-Orient
  { city: "Dubaï", country: "Émirats arabes unis" },
  { city: "Abu Dhabi", country: "Émirats arabes unis" },
  { city: "Doha", country: "Qatar" },
  { city: "Mascate", country: "Oman" },
  { city: "Tel-Aviv", country: "Israël" },
  { city: "Amman", country: "Jordanie" },
  { city: "Beyrouth", country: "Liban" },
  { city: "Riyad", country: "Arabie saoudite" },
  { city: "Djeddah", country: "Arabie saoudite" },

  // Asie
  { city: "Bangkok", country: "Thaïlande" },
  { city: "Phuket", country: "Thaïlande" },
  { city: "Chiang Mai", country: "Thaïlande" },
  { city: "Bali", country: "Indonésie" },
  { city: "Jakarta", country: "Indonésie" },
  { city: "Singapour", country: "Singapour" },
  { city: "Kuala Lumpur", country: "Malaisie" },
  { city: "Hanoï", country: "Vietnam" },
  { city: "Hô Chi Minh-Ville", country: "Vietnam" },
  { city: "Manille", country: "Philippines" },
  { city: "Colombo", country: "Sri Lanka" },
  { city: "Katmandou", country: "Népal" },
  { city: "New Delhi", country: "Inde" },
  { city: "Mumbai", country: "Inde" },
  { city: "Goa", country: "Inde" },
  { city: "Tokyo", country: "Japon" },
  { city: "Osaka", country: "Japon" },
  { city: "Séoul", country: "Corée du Sud" },
  { city: "Pékin", country: "Chine" },
  { city: "Shanghai", country: "Chine" },
  { city: "Hong Kong", country: "Chine" },

  // Océanie
  { city: "Sydney", country: "Australie" },
  { city: "Melbourne", country: "Australie" },
  { city: "Auckland", country: "Nouvelle-Zélande" },

  // Amériques
  { city: "New York", country: "États-Unis" },
  { city: "Los Angeles", country: "États-Unis" },
  { city: "Miami", country: "États-Unis" },
  { city: "San Francisco", country: "États-Unis" },
  { city: "Chicago", country: "États-Unis" },
  { city: "Washington", country: "États-Unis" },
  { city: "Boston", country: "États-Unis" },
  { city: "Las Vegas", country: "États-Unis" },
  { city: "Montréal", country: "Canada" },
  { city: "Toronto", country: "Canada" },
  { city: "Vancouver", country: "Canada" },
  { city: "Québec", country: "Canada" },
  { city: "Mexico", country: "Mexique" },
  { city: "Cancún", country: "Mexique" },
  { city: "La Havane", country: "Cuba" },
  { city: "Punta Cana", country: "République dominicaine" },
  { city: "Bogotá", country: "Colombie" },
  { city: "Medellín", country: "Colombie" },
  { city: "Lima", country: "Pérou" },
  { city: "Buenos Aires", country: "Argentine" },
  { city: "Santiago", country: "Chili" },
  { city: "São Paulo", country: "Brésil" },
  { city: "Rio de Janeiro", country: "Brésil" },
  { city: "Salvador de Bahia", country: "Brésil" },

  // Îles
  { city: "Sal", country: "Cap-Vert" },
  { city: "Praia", country: "Cap-Vert" },
  { city: "Malé", country: "Maldives" },
  { city: "Mahé", country: "Seychelles" },
];

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function searchCities(query: string): { city: string; country: string }[] {
  if (query.length < 2) return [];
  const q = normalize(query);

  // Check if query matches a country — if so, show all cities in that country
  const countryMatch = airportCities.filter(
    (e) => normalize(e.country).startsWith(q) || normalize(e.country).includes(q)
  );
  if (countryMatch.length > 0 && !airportCities.some((e) => normalize(e.city).startsWith(q))) {
    return countryMatch.slice(0, 8);
  }

  // Otherwise match on city name, prioritize starts-with
  const startsWith = airportCities.filter((e) => normalize(e.city).startsWith(q));
  const contains = airportCities.filter(
    (e) => !normalize(e.city).startsWith(q) && normalize(e.city).includes(q)
  );
  // Also include country matches as secondary results
  const countrySecondary = airportCities.filter(
    (e) =>
      normalize(e.country).startsWith(q) &&
      !startsWith.includes(e) &&
      !contains.includes(e)
  );

  return [...startsWith, ...contains, ...countrySecondary].slice(0, 8);
}
