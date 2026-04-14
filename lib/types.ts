export type DateConstraintTag = "weekend" | "holidays-wb" | "holidays-fl" | "off-holidays" | "bridge";
export type TransportMode = "plane" | "train" | "car" | "bike";
export type AccommodationType = "hotel" | "hostel" | "airbnb" | "camping";
export type ComfortLevel = "budget" | "standard" | "premium";
export type WeatherIcon = "sun" | "cloud" | "snow" | "rain";
export type ColorTheme =
  | "teal"
  | "amber"
  | "blue"
  | "coral"
  | "purple"
  | "green"
  | "slate";

export interface SearchFormData {
  city: string;
  dateFrom: string;
  dateTo: string;
  dateConstraints: DateConstraintTag[];
  travelers: number;
  budgetEnabled: boolean;
  budget: number;
  durationEnabled: boolean;
  duration: number;
  transport: TransportMode[];
  accommodation: AccommodationType[];
  comfort: ComfortLevel;
  interests: string[];
}

export interface Destination {
  name: string;
  country: string;
  flag: string;
  colorTheme: ColorTheme;
  flightPrice: number;
  hotelPerNight: number;
  totalPerPerson: number;
  nights: number;
  tempMin: number;
  tempMax: number;
  weatherIcon: WeatherIcon;
  matchScore: number;
  matchedInterests: string[];
  why: string;
  activities: string[];
  mealPrice: number;      // prix moyen d'un repas sur place en €
  fritesPrice: number;    // prix d'un cornet de frites 🍟
  dateFrom: string;       // YYYY-MM-DD — dates choisies ou suggérées par l'IA
  dateTo: string;         // YYYY-MM-DD
  datePeriodLabel?: string; // ex: "Pont de l'Ascension", "Weekend (ven→dim)", "Toussaint 2026"
  isLocal: boolean;
  isSurprise: boolean;
  transportMode?: "plane" | "train" | "car" | "bike"; // mode de transport choisi par l'IA
  distanceKm?: number;    // distance route/vélo depuis l'origin en km
  travelHours?: number;   // temps de trajet estimé en heures
  originIata?: string;    // code IATA de la ville de départ (ex: BRU)
  destIata?: string;      // code IATA de la destination (ex: LIS)
  bookingUrl?: string;
  photoUrl?: string;
}

export const defaultForm: SearchFormData = {
  city: "",
  dateFrom: "",
  dateTo: "",
  dateConstraints: [],
  travelers: 1,
  budgetEnabled: false,
  budget: 500,
  durationEnabled: false,
  duration: 7,
  transport: [],
  accommodation: [],
  comfort: "standard",
  interests: [],
};

export type InterestIcon =
  | "sun"
  | "waves"
  | "mountain"
  | "footprints"
  | "wine"
  | "music"
  | "users"
  | "landmark"
  | "sparkles"
  | "tree-pine"
  | "building";

export interface InterestOption {
  label: string;
  icon: InterestIcon;
  value: string;
}

export const interestOptions: InterestOption[] = [
  { label: "Soleil", icon: "sun", value: "soleil" },
  { label: "Plage", icon: "waves", value: "plage" },
  { label: "Ski", icon: "mountain", value: "ski" },
  { label: "Trek", icon: "footprints", value: "trek" },
  { label: "Gastronomie", icon: "wine", value: "gastronomie" },
  { label: "Teuf", icon: "music", value: "teuf" },
  { label: "Famille", icon: "users", value: "famille" },
  { label: "Culture", icon: "landmark", value: "culture" },
  { label: "Détente", icon: "sparkles", value: "detente" },
  { label: "Nature", icon: "tree-pine", value: "nature" },
  { label: "City break", icon: "building", value: "citybreak" },
];

export const durationOptions = [3, 5, 7, 10, 14, 21];

export const loadingMessages = [
  "Analyse de vos envies en cours...",
  "Vérification météo sur vos dates...",
  "Calcul des meilleures offres...",
  "Dénichage de pépites inattendues...",
  "Finalisation des recommandations...",
];

export const colorThemes: Record<
  ColorTheme,
  { bg: string; stripe: string; text: string }
> = {
  amber: { bg: "#FFF7E0", stripe: "#F59E0B", text: "#78350F" },
  teal: { bg: "#E6FAF5", stripe: "#14B8A6", text: "#0F4F46" },
  blue: { bg: "#E8F0FE", stripe: "#3B82F6", text: "#1E3A8A" },
  coral: { bg: "#FFE4E8", stripe: "#F43F5E", text: "#881337" },
  purple: { bg: "#F3E8FF", stripe: "#8B5CF6", text: "#4C1D95" },
  green: { bg: "#DCFCE7", stripe: "#22C55E", text: "#14532D" },
  slate: { bg: "#F1F5F9", stripe: "#64748B", text: "#0F172A" },
};
