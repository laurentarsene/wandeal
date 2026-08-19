interface CityEntry {
  city: string;
  country: string;
  /**
   * IATA code of the airport serving this city.
   *
   * Resolved once and stored here on purpose: the departure city gates every
   * flight link on the results page, and looking it up over the network meant a
   * single failed or throttled request silently stripped the flight CTA from all
   * eight cards at once.
   */
  iata: string;
}

const airportCities: CityEntry[] = [
  // Belgique
  { city: "Bruxelles", country: "Belgique", iata: "BRU" },
  { city: "Charleroi", country: "Belgique", iata: "CRL" },
  { city: "Anvers", country: "Belgique", iata: "ANR" },
  { city: "Liège", country: "Belgique", iata: "LIL" },
  { city: "Ostende", country: "Belgique", iata: "OST" },

  // France
  { city: "Paris", country: "France", iata: "PAR" },
  { city: "Lyon", country: "France", iata: "LYS" },
  { city: "Marseille", country: "France", iata: "MRS" },
  { city: "Nice", country: "France", iata: "NCE" },
  { city: "Toulouse", country: "France", iata: "TLS" },
  { city: "Bordeaux", country: "France", iata: "BOD" },
  { city: "Nantes", country: "France", iata: "NTE" },
  { city: "Strasbourg", country: "France", iata: "SXB" },
  { city: "Lille", country: "France", iata: "LIL" },
  { city: "Montpellier", country: "France", iata: "MPL" },
  { city: "Rennes", country: "France", iata: "RNS" },
  { city: "Grenoble", country: "France", iata: "GNB" },
  { city: "Biarritz", country: "France", iata: "BIQ" },
  { city: "Ajaccio", country: "France", iata: "AJA" },
  { city: "Bastia", country: "France", iata: "BIA" },
  { city: "La Réunion", country: "France", iata: "RUN" },
  { city: "Fort-de-France", country: "France", iata: "FDF" },
  { city: "Pointe-à-Pitre", country: "France", iata: "PTP" },

  // Suisse
  { city: "Genève", country: "Suisse", iata: "GVA" },
  { city: "Zurich", country: "Suisse", iata: "ZRH" },
  { city: "Bâle", country: "Suisse", iata: "EAP" },
  { city: "Berne", country: "Suisse", iata: "BGO" },
  { city: "Lausanne", country: "Suisse", iata: "GVA" },

  // Luxembourg
  { city: "Luxembourg", country: "Luxembourg", iata: "LUX" },

  // Pays-Bas
  { city: "Amsterdam", country: "Pays-Bas", iata: "AMS" },
  { city: "Rotterdam", country: "Pays-Bas", iata: "RTM" },
  { city: "Eindhoven", country: "Pays-Bas", iata: "EIN" },

  // Allemagne
  { city: "Berlin", country: "Allemagne", iata: "BER" },
  { city: "Munich", country: "Allemagne", iata: "MUC" },
  { city: "Francfort", country: "Allemagne", iata: "FRA" },
  { city: "Düsseldorf", country: "Allemagne", iata: "DUS" },
  { city: "Hambourg", country: "Allemagne", iata: "HAM" },
  { city: "Cologne", country: "Allemagne", iata: "CGN" },
  { city: "Stuttgart", country: "Allemagne", iata: "STR" },

  // Royaume-Uni
  { city: "Londres", country: "Royaume-Uni", iata: "LON" },
  { city: "Manchester", country: "Royaume-Uni", iata: "MAN" },
  { city: "Birmingham", country: "Royaume-Uni", iata: "BHX" },
  { city: "Édimbourg", country: "Royaume-Uni", iata: "EDI" },
  { city: "Glasgow", country: "Royaume-Uni", iata: "GLA" },
  { city: "Bristol", country: "Royaume-Uni", iata: "BRS" },
  { city: "Liverpool", country: "Royaume-Uni", iata: "LPL" },

  // Irlande
  { city: "Dublin", country: "Irlande", iata: "DUB" },
  { city: "Cork", country: "Irlande", iata: "ORK" },

  // Espagne
  { city: "Madrid", country: "Espagne", iata: "MAD" },
  { city: "Barcelone", country: "Espagne", iata: "BCN" },
  { city: "Malaga", country: "Espagne", iata: "AGP" },
  { city: "Séville", country: "Espagne", iata: "SVQ" },
  { city: "Valence", country: "Espagne", iata: "VLC" },
  { city: "Palma de Majorque", country: "Espagne", iata: "PMI" },
  { city: "Ibiza", country: "Espagne", iata: "IBZ" },
  { city: "Tenerife", country: "Espagne", iata: "TCI" },
  { city: "Las Palmas", country: "Espagne", iata: "LPA" },
  { city: "Bilbao", country: "Espagne", iata: "BIO" },
  { city: "Alicante", country: "Espagne", iata: "ALC" },

  // Portugal
  { city: "Lisbonne", country: "Portugal", iata: "LIS" },
  { city: "Porto", country: "Portugal", iata: "OPO" },
  { city: "Faro", country: "Portugal", iata: "FAO" },
  { city: "Funchal", country: "Portugal", iata: "FNC" },
  { city: "Ponta Delgada", country: "Portugal", iata: "PDL" },

  // Italie
  { city: "Rome", country: "Italie", iata: "ROM" },
  { city: "Milan", country: "Italie", iata: "MIL" },
  { city: "Naples", country: "Italie", iata: "NAP" },
  { city: "Venise", country: "Italie", iata: "VCE" },
  { city: "Florence", country: "Italie", iata: "FLR" },
  { city: "Bologne", country: "Italie", iata: "BLQ" },
  { city: "Catane", country: "Italie", iata: "CTA" },
  { city: "Palerme", country: "Italie", iata: "PMO" },
  { city: "Turin", country: "Italie", iata: "TRN" },
  { city: "Bari", country: "Italie", iata: "BRI" },
  { city: "Cagliari", country: "Italie", iata: "CAG" },

  // Grèce
  { city: "Athènes", country: "Grèce", iata: "ATH" },
  { city: "Thessalonique", country: "Grèce", iata: "SKG" },
  { city: "Héraklion", country: "Grèce", iata: "HER" },
  { city: "Santorin", country: "Grèce", iata: "JTR" },
  { city: "Mykonos", country: "Grèce", iata: "JMK" },
  { city: "Rhodes", country: "Grèce", iata: "RHO" },
  { city: "Corfou", country: "Grèce", iata: "CFU" },

  // Turquie
  { city: "Istanbul", country: "Turquie", iata: "IST" },
  { city: "Antalya", country: "Turquie", iata: "AYT" },
  { city: "Izmir", country: "Turquie", iata: "IZM" },
  { city: "Bodrum", country: "Turquie", iata: "BJV" },

  // Croatie
  { city: "Zagreb", country: "Croatie", iata: "ZAG" },
  { city: "Split", country: "Croatie", iata: "SPU" },
  { city: "Dubrovnik", country: "Croatie", iata: "DBV" },

  // Europe de l'Est / Balkans
  { city: "Prague", country: "Tchéquie", iata: "PRG" },
  { city: "Budapest", country: "Hongrie", iata: "BUD" },
  { city: "Varsovie", country: "Pologne", iata: "WAW" },
  { city: "Cracovie", country: "Pologne", iata: "KRK" },
  { city: "Vienne", country: "Autriche", iata: "VIE" },
  { city: "Bucarest", country: "Roumanie", iata: "BUH" },
  { city: "Sofia", country: "Bulgarie", iata: "SOF" },
  { city: "Belgrade", country: "Serbie", iata: "BEG" },
  { city: "Tirana", country: "Albanie", iata: "TIA" },
  { city: "Sarajevo", country: "Bosnie-Herzégovine", iata: "SJJ" },
  { city: "Podgorica", country: "Monténégro", iata: "TGD" },
  { city: "Skopje", country: "Macédoine du Nord", iata: "SKP" },
  { city: "Ljubljana", country: "Slovénie", iata: "LJU" },
  { city: "Bratislava", country: "Slovaquie", iata: "BTS" },
  { city: "Plovdiv", country: "Bulgarie", iata: "PDV" },

  // Scandinavie / Baltique
  { city: "Copenhague", country: "Danemark", iata: "CPH" },
  { city: "Stockholm", country: "Suède", iata: "STO" },
  { city: "Oslo", country: "Norvège", iata: "OSL" },
  { city: "Helsinki", country: "Finlande", iata: "HEL" },
  { city: "Reykjavik", country: "Islande", iata: "REK" },
  { city: "Riga", country: "Lettonie", iata: "RIX" },
  { city: "Tallinn", country: "Estonie", iata: "TLL" },
  { city: "Vilnius", country: "Lituanie", iata: "VNO" },

  // Caucase / Asie centrale
  { city: "Tbilissi", country: "Géorgie", iata: "TBS" },
  { city: "Erevan", country: "Arménie", iata: "EVN" },
  { city: "Bakou", country: "Azerbaïdjan", iata: "BAK" },

  // Afrique du Nord
  { city: "Casablanca", country: "Maroc", iata: "CMN" },
  { city: "Marrakech", country: "Maroc", iata: "RAK" },
  { city: "Agadir", country: "Maroc", iata: "AGA" },
  { city: "Fès", country: "Maroc", iata: "FEZ" },
  { city: "Tanger", country: "Maroc", iata: "TNG" },
  { city: "Tunis", country: "Tunisie", iata: "TUN" },
  { city: "Djerba", country: "Tunisie", iata: "DJE" },
  { city: "Alger", country: "Algérie", iata: "ALG" },
  { city: "Oran", country: "Algérie", iata: "ORN" },
  { city: "Le Caire", country: "Égypte", iata: "CAI" },
  { city: "Hurghada", country: "Égypte", iata: "HRG" },
  { city: "Charm el-Cheikh", country: "Égypte", iata: "SSH" },
  { city: "Louxor", country: "Égypte", iata: "LXR" },

  // Afrique subsaharienne
  { city: "Dakar", country: "Sénégal", iata: "DKR" },
  { city: "Abidjan", country: "Côte d'Ivoire", iata: "ABJ" },
  { city: "Kinshasa", country: "RD Congo", iata: "FIH" },
  { city: "Douala", country: "Cameroun", iata: "DLA" },
  { city: "Yaoundé", country: "Cameroun", iata: "YAO" },
  { city: "Lomé", country: "Togo", iata: "LFW" },
  { city: "Cotonou", country: "Bénin", iata: "COO" },
  { city: "Ouagadougou", country: "Burkina Faso", iata: "OUA" },
  { city: "Bamako", country: "Mali", iata: "BKO" },
  { city: "Conakry", country: "Guinée", iata: "CKY" },
  { city: "Libreville", country: "Gabon", iata: "LBV" },
  { city: "Brazzaville", country: "Congo", iata: "BZV" },
  { city: "Antananarivo", country: "Madagascar", iata: "TNR" },
  { city: "Nosy Be", country: "Madagascar", iata: "NOS" },
  { city: "Nairobi", country: "Kenya", iata: "NBO" },
  { city: "Mombasa", country: "Kenya", iata: "MBA" },
  { city: "Zanzibar", country: "Tanzanie", iata: "ZNZ" },
  { city: "Dar es Salaam", country: "Tanzanie", iata: "DAR" },
  { city: "Le Cap", country: "Afrique du Sud", iata: "CPT" },
  { city: "Johannesburg", country: "Afrique du Sud", iata: "JNB" },
  { city: "Île Maurice", country: "Maurice", iata: "MRU" },
  { city: "Windhoek", country: "Namibie", iata: "WDH" },
  { city: "Accra", country: "Ghana", iata: "ACC" },
  { city: "Lagos", country: "Nigeria", iata: "LOS" },
  { city: "Addis-Abeba", country: "Éthiopie", iata: "ADD" },
  { city: "Kigali", country: "Rwanda", iata: "KGL" },

  // Moyen-Orient
  { city: "Dubaï", country: "Émirats arabes unis", iata: "DXB" },
  { city: "Abu Dhabi", country: "Émirats arabes unis", iata: "AUH" },
  { city: "Doha", country: "Qatar", iata: "DOH" },
  { city: "Mascate", country: "Oman", iata: "MCT" },
  { city: "Tel-Aviv", country: "Israël", iata: "TLV" },
  { city: "Amman", country: "Jordanie", iata: "AMM" },
  { city: "Beyrouth", country: "Liban", iata: "BEY" },
  { city: "Riyad", country: "Arabie saoudite", iata: "RUH" },
  { city: "Djeddah", country: "Arabie saoudite", iata: "JED" },

  // Asie
  { city: "Bangkok", country: "Thaïlande", iata: "BKK" },
  { city: "Phuket", country: "Thaïlande", iata: "HKT" },
  { city: "Chiang Mai", country: "Thaïlande", iata: "CNX" },
  { city: "Bali", country: "Indonésie", iata: "DPS" },
  { city: "Jakarta", country: "Indonésie", iata: "JKT" },
  { city: "Singapour", country: "Singapour", iata: "SIN" },
  { city: "Kuala Lumpur", country: "Malaisie", iata: "KUL" },
  { city: "Hanoï", country: "Vietnam", iata: "HAN" },
  { city: "Hô Chi Minh-Ville", country: "Vietnam", iata: "SGN" },
  { city: "Manille", country: "Philippines", iata: "MNL" },
  { city: "Colombo", country: "Sri Lanka", iata: "CMB" },
  { city: "Katmandou", country: "Népal", iata: "KTM" },
  { city: "New Delhi", country: "Inde", iata: "DEL" },
  { city: "Mumbai", country: "Inde", iata: "DXB" },
  { city: "Goa", country: "Inde", iata: "GOI" },
  { city: "Tokyo", country: "Japon", iata: "TYO" },
  { city: "Osaka", country: "Japon", iata: "OSA" },
  { city: "Séoul", country: "Corée du Sud", iata: "SEL" },
  { city: "Pékin", country: "Chine", iata: "BJS" },
  { city: "Shanghai", country: "Chine", iata: "SHA" },
  { city: "Hong Kong", country: "Chine", iata: "HKG" },

  // Océanie
  { city: "Sydney", country: "Australie", iata: "SYD" },
  { city: "Melbourne", country: "Australie", iata: "MEL" },
  { city: "Auckland", country: "Nouvelle-Zélande", iata: "AKL" },

  // Amériques
  { city: "New York", country: "États-Unis", iata: "NYC" },
  { city: "Los Angeles", country: "États-Unis", iata: "LAX" },
  { city: "Miami", country: "États-Unis", iata: "MIA" },
  { city: "San Francisco", country: "États-Unis", iata: "SFO" },
  { city: "Chicago", country: "États-Unis", iata: "CHI" },
  { city: "Washington", country: "États-Unis", iata: "WAS" },
  { city: "Boston", country: "États-Unis", iata: "BOS" },
  { city: "Las Vegas", country: "États-Unis", iata: "LAS" },
  { city: "Montréal", country: "Canada", iata: "YMQ" },
  { city: "Toronto", country: "Canada", iata: "YTO" },
  { city: "Vancouver", country: "Canada", iata: "YVR" },
  { city: "Québec", country: "Canada", iata: "YQB" },
  { city: "Mexico", country: "Mexique", iata: "MEX" },
  { city: "Cancún", country: "Mexique", iata: "CUN" },
  { city: "La Havane", country: "Cuba", iata: "HAV" },
  { city: "Punta Cana", country: "République dominicaine", iata: "PUJ" },
  { city: "Bogotá", country: "Colombie", iata: "BOG" },
  { city: "Medellín", country: "Colombie", iata: "MDE" },
  { city: "Lima", country: "Pérou", iata: "LIM" },
  { city: "Buenos Aires", country: "Argentine", iata: "BUE" },
  { city: "Santiago", country: "Chili", iata: "SCL" },
  { city: "São Paulo", country: "Brésil", iata: "SAO" },
  { city: "Rio de Janeiro", country: "Brésil", iata: "RIO" },
  { city: "Salvador de Bahia", country: "Brésil", iata: "SSA" },

  // Îles
  { city: "Sal", country: "Cap-Vert", iata: "SAL" },
  { city: "Praia", country: "Cap-Vert", iata: "RAI" },
  { city: "Malé", country: "Maldives", iata: "MLE" },
  { city: "Mahé", country: "Seychelles", iata: "SEZ" },
];

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** IATA code for a city from the curated departure list, if we know it. */
export function cityIata(name: string): string | null {
  const q = normalize(name.trim());
  if (!q) return null;
  const hit =
    airportCities.find((e) => normalize(e.city) === q) ||
    airportCities.find((e) => normalize(e.city).startsWith(q));
  return hit?.iata || null;
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
