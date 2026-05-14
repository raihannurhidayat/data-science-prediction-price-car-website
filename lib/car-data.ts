// export const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL ?? "https://data-science-prediction-price-car-system.vercel.app";

export const API_BASE_URL = "http://localhost:8080";

export type FeatureKey =
  | "Engine_size"
  | "Horsepower"
  | "Wheelbase"
  | "Width"
  | "Length"
  | "Curb_weight"
  | "Fuel_capacity"
  | "Fuel_efficiency";

export type PredictionFeatures = Record<FeatureKey, number>;

export type PredictionHistoryItem = {
  id: string;
  createdAt: string;
  predictedPrice: number;
  currency: string;
  features: PredictionFeatures;
};

export const HISTORY_STORAGE_KEY = "car-price-prediction-history";

export const featureDefinitions: Array<{
  key: FeatureKey;
  label: string;
  unit: string;
  placeholder: string;
  min: number;
  max: number;
  sample: number;
}> = [
  {
    key: "Engine_size",
    label: "Engine Size",
    unit: "L",
    placeholder: "2.4",
    min: 0.1,
    max: 8,
    sample: 2.4,
  },
  {
    key: "Horsepower",
    label: "Horsepower",
    unit: "HP",
    placeholder: "180",
    min: 1,
    max: 900,
    sample: 180,
  },
  {
    key: "Wheelbase",
    label: "Wheelbase",
    unit: "in",
    placeholder: "106.5",
    min: 50,
    max: 160,
    sample: 106.5,
  },
  {
    key: "Width",
    label: "Width",
    unit: "in",
    placeholder: "71.2",
    min: 30,
    max: 100,
    sample: 71.2,
  },
  {
    key: "Length",
    label: "Length",
    unit: "in",
    placeholder: "188.8",
    min: 80,
    max: 260,
    sample: 188.8,
  },
  {
    key: "Curb_weight",
    label: "Curb Weight",
    unit: "k lbs",
    placeholder: "3.2",
    min: 0.5,
    max: 8,
    sample: 3.2,
  },
  {
    key: "Fuel_capacity",
    label: "Fuel Capacity",
    unit: "gal",
    placeholder: "16.5",
    min: 1,
    max: 40,
    sample: 16.5,
  },
  {
    key: "Fuel_efficiency",
    label: "Fuel Efficiency",
    unit: "mpg",
    placeholder: "28",
    min: 1,
    max: 100,
    sample: 28,
  },
];

export const defaultFeatures = featureDefinitions.reduce(
  (acc, feature) => {
    acc[feature.key] = "";
    return acc;
  },
  {} as Record<FeatureKey, string>,
);

export const modelMetrics = [
  {
    label: "R2 Score",
    value: "0.7459",
    detail: "Akurasi regresi pada data uji",
  },
  { label: "RMSE", value: "7.39", detail: "Rata-rata galat dalam ribuan USD" },
  { label: "Dataset", value: "157", detail: "Record car sales Kaggle" },
];

export const priceDistribution = [
  { range: "10-15k", cars: 18 },
  { range: "15-20k", cars: 31 },
  { range: "20-25k", cars: 37 },
  { range: "25-30k", cars: 24 },
  { range: "30-40k", cars: 21 },
  { range: "40k+", cars: 26 },
];

export const featureScatter = [
  { horsepower: 96, price: 13.9 },
  { horsepower: 120, price: 17.4 },
  { horsepower: 150, price: 21.8 },
  { horsepower: 180, price: 27.1 },
  { horsepower: 210, price: 31.6 },
  { horsepower: 250, price: 39.7 },
  { horsepower: 300, price: 49.2 },
  { horsepower: 340, price: 58.4 },
];

export const topCars = [
  { model: "Toyota Camry", sales: 247994, segment: "Sedan" },
  { model: "Honda Accord", sales: 230902, segment: "Sedan" },
  { model: "Ford Taurus", sales: 245815, segment: "Sedan" },
  { model: "Chevrolet Impala", sales: 174391, segment: "Sedan" },
  { model: "Toyota Corolla", sales: 142535, segment: "Compact" },
  { model: "Honda Civic", sales: 199685, segment: "Compact" },
  { model: "Dodge Neon", sales: 76311, segment: "Compact" },
  { model: "Ford Focus", sales: 175670, segment: "Compact" },
  { model: "Nissan Maxima", sales: 88674, segment: "Sedan" },
  { model: "Volkswagen Jetta", sales: 83624, segment: "Compact" },
];

export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function normalizePredictedPrice(value: number) {
  if (value >= 1_000_000) {
    return value / 1000;
  }

  return value;
}

export function compactFeatureSummary(features: PredictionFeatures) {
  return featureDefinitions.map((feature) => ({
    label: feature.label,
    value: `${features[feature.key]} ${feature.unit}`,
  }));
}
