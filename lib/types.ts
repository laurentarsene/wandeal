export type TransportMode = "plane" | "train" | "car" | "bike";
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
  travelers: number;
  budgetEnabled: boolean;
  budget: number;
  durationEnabled: boolean;
  duration: number;
  transport: TransportMode | null;
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
  isLocal: boolean;
  isSurprise: boolean;
  bookingUrl?: string;
  photoUrl?: string;
}

export const defaultForm: SearchFormData = {
  city: "",
  dateFrom: "",
  dateTo: "",
  travelers: 1,
  budgetEnabled: false,
  budget: 500,
  durationEnabled: false,
  duration: 7,
  transport: null,
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
  amber: { bg: "#FFFBEB", stripe: "#F59E0B", text: "#92400E" },
  teal: { bg: "#F0FDFA", stripe: "#0D9488", text: "#134E4A" },
  blue: { bg: "#EFF6FF", stripe: "#2563EB", text: "#1E3A8A" },
  coral: { bg: "#FFF1F2", stripe: "#E11D48", text: "#881337" },
  purple: { bg: "#FAF5FF", stripe: "#7C3AED", text: "#4C1D95" },
  green: { bg: "#F0FDF4", stripe: "#16A34A", text: "#14532D" },
  slate: { bg: "#F8FAFC", stripe: "#475569", text: "#0F172A" },
};
