"use client";

import { useMemo, useState } from "react";
import {
  CalculatorIcon,
  CarFrontIcon,
  RotateCcwIcon,
  SaveIcon,
} from "lucide-react";
import { FieldErrors, Resolver, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  API_BASE_URL,
  HISTORY_STORAGE_KEY,
  PredictionFeatures,
  PredictionHistoryItem,
  compactFeatureSummary,
  defaultFeatures,
  featureDefinitions,
  formatCurrency,
  modelMetrics,
  normalizePredictedPrice,
} from "@/lib/car-data";

const positiveNumberField = (label: string) =>
  z
    .string()
    .min(1, `${label} wajib diisi.`)
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, {
      message: `${label} wajib angka positif.`,
    })
    .transform(Number);

const predictionSchema = z.object({
  Engine_size: positiveNumberField("Engine Size"),
  Horsepower: positiveNumberField("Horsepower"),
  Wheelbase: positiveNumberField("Wheelbase"),
  Width: positiveNumberField("Width"),
  Length: positiveNumberField("Length"),
  Curb_weight: positiveNumberField("Curb Weight"),
  Fuel_capacity: positiveNumberField("Fuel Capacity"),
  Fuel_efficiency: positiveNumberField("Fuel Efficiency"),
});

type PredictionFormInput = z.input<typeof predictionSchema>;
type PredictionFormValues = z.output<typeof predictionSchema>;

const predictionResolver: Resolver<
  PredictionFormInput,
  undefined,
  PredictionFormValues
> = async (values) => {
  const parsed = predictionSchema.safeParse(values);

  if (parsed.success) {
    return {
      values: parsed.data,
      errors: {},
    };
  }

  const errors = parsed.error.issues.reduce((acc, issue) => {
    const name = issue.path[0] as keyof PredictionFormInput;

    if (name) {
      acc[name] = {
        type: "validation",
        message: issue.message,
      };
    }

    return acc;
  }, {} as FieldErrors<PredictionFormInput>);

  return {
    values: {},
    errors,
  };
};

type PredictionResult = {
  predictedPrice: number;
  currency: string;
  features: PredictionFeatures;
};

type PredictResponse = {
  predicted_price?: number;
  prediction?: number;
  price?: number;
  currency?: string;
  input_features?: PredictionFeatures;
};

function toPositiveFeatureValues(
  values: PredictionFormValues,
): PredictionFeatures {
  return {
    Engine_size: values.Engine_size,
    Horsepower: values.Horsepower,
    Wheelbase: values.Wheelbase,
    Width: values.Width,
    Length: values.Length,
    Curb_weight:
      values.Curb_weight > 100 ? values.Curb_weight / 1000 : values.Curb_weight,
    Fuel_capacity: values.Fuel_capacity,
    Fuel_efficiency: values.Fuel_efficiency,
  };
}

async function predictPrice(
  features: PredictionFeatures,
): Promise<PredictionResult> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(features),
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error("Input belum sesuai format yang dibutuhkan model.");
      }

      if (response.status === 503) {
        throw new Error("Model sedang tidak tersedia. Coba lagi nanti.");
      }

      throw new Error("Prediksi gagal diproses oleh server.");
    }

    const data = (await response.json()) as PredictResponse;
    const predictedPrice = Number(
      data.predicted_price ?? data.prediction ?? data.price,
    );

    if (!Number.isFinite(predictedPrice)) {
      throw new Error("Response API tidak memuat nilai prediksi yang valid.");
    }

    return {
      predictedPrice: normalizePredictedPrice(predictedPrice),
      currency: data.currency ?? "USD",
      features: data.input_features ?? features,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Server tidak merespons. Coba lagi.");
    }

    if (error instanceof TypeError) {
      throw new Error("Gagal terhubung ke server. Periksa koneksi Anda.");
    }

    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

function saveHistory(result: PredictionResult) {
  const current = window.localStorage.getItem(HISTORY_STORAGE_KEY);
  const parsed = current
    ? (JSON.parse(current) as PredictionHistoryItem[])
    : [];
  const item: PredictionHistoryItem = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    predictedPrice: result.predictedPrice,
    currency: result.currency,
    features: result.features,
  };

  window.localStorage.setItem(
    HISTORY_STORAGE_KEY,
    JSON.stringify([item, ...parsed].slice(0, 100)),
  );
}

export function PredictionWorkspace() {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<PredictionFormInput, undefined, PredictionFormValues>({
    resolver: predictionResolver,
    mode: "onChange",
    defaultValues: defaultFeatures,
  });

  const isSubmitting = form.formState.isSubmitting;
  const watchedValues = useWatch({ control: form.control });
  const completedFields = useMemo(
    () =>
      featureDefinitions.filter(
        (feature) => String(watchedValues[feature.key] ?? "").length > 0,
      ).length,
    [watchedValues],
  );

  const onSubmit = form.handleSubmit(async (values) => {
    setErrorMessage(null);
    const features = toPositiveFeatureValues(values);
    const prediction = predictPrice(features);

    toast.promise(prediction, {
      loading: "Menghitung estimasi harga mobil...",
      success: "Prediksi harga berhasil disimpan ke riwayat.",
      error: (error) =>
        error instanceof Error ? error.message : "Prediksi gagal.",
    });

    try {
      const nextResult = await prediction;
      setResult(nextResult);
      saveHistory(nextResult);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Prediksi gagal. Coba lagi.",
      );
    }
  });

  const fillSample = () => {
    featureDefinitions.forEach((feature) => {
      form.setValue(feature.key, String(feature.sample), {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  };

  const resetForm = () => {
    form.reset(defaultFeatures);
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <main className="flex-1 bg-muted/30">
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(320px,440px)_1fr] lg:px-8">
        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <CardTitle>Prediksi Harga Mobil</CardTitle>
                <CardDescription>
                  Isi 8 fitur teknis untuk mendapatkan estimasi harga dalam USD.
                </CardDescription>
              </div>
              <Badge variant="secondary">{completedFields}/8</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <form
              id="prediction-form"
              onSubmit={onSubmit}
              className="flex flex-col gap-5"
            >
              <FieldGroup>
                {featureDefinitions.map((feature) => {
                  const fieldError = form.formState.errors[feature.key];

                  return (
                    <Field key={feature.key} data-invalid={Boolean(fieldError)}>
                      <FieldLabel htmlFor={feature.key}>
                        {feature.label}
                      </FieldLabel>
                      <InputGroup className="h-10">
                        <InputGroupInput
                          id={feature.key}
                          type="number"
                          min={feature.min}
                          max={feature.max}
                          step="any"
                          inputMode="decimal"
                          placeholder={feature.placeholder}
                          aria-invalid={Boolean(fieldError)}
                          disabled={isSubmitting}
                          {...form.register(feature.key)}
                        />
                        <InputGroupAddon align="inline-end">
                          {feature.unit}
                        </InputGroupAddon>
                      </InputGroup>
                      {fieldError ? (
                        <FieldError>{fieldError.message}</FieldError>
                      ) : (
                        <FieldDescription>
                          Range wajar {feature.min} - {feature.max}{" "}
                          {feature.unit}
                        </FieldDescription>
                      )}
                    </Field>
                  );
                })}
              </FieldGroup>

              {errorMessage ? (
                <Alert variant="destructive">
                  <AlertTitle>Prediksi belum berhasil</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              ) : null}
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row">
            <Button
              form="prediction-form"
              type="submit"
              disabled={!form.formState.isValid || isSubmitting}
              className="w-full sm:flex-1"
            >
              {isSubmitting ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <CalculatorIcon data-icon="inline-start" />
              )}
              Prediksi Harga
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={fillSample}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              <CarFrontIcon data-icon="inline-start" />
              Contoh
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={resetForm}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              <RotateCcwIcon data-icon="inline-start" />
              Reset
            </Button>
          </CardFooter>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Perkiraan Harga Mobil</CardTitle>
              <CardDescription>
                Hasil prediksi akan muncul setelah model selesai menghitung.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="rounded-lg border bg-card p-6">
                <div className="flex min-h-28 flex-col items-center justify-center gap-3 text-center">
                  {isSubmitting ? (
                    <>
                      <Spinner />
                      <p className="text-sm text-muted-foreground">
                        Mengirim data ke model regresi...
                      </p>
                    </>
                  ) : result ? (
                    <>
                      <p className="text-sm font-medium text-muted-foreground">
                        Estimasi harga
                      </p>
                      <p className="text-4xl font-semibold tracking-tight sm:text-5xl">
                        {formatCurrency(result.predictedPrice, result.currency)}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-muted-foreground">
                        Belum ada prediksi
                      </p>
                      <p className="max-w-md text-sm text-muted-foreground">
                        Lengkapi form di sebelah kiri, lalu jalankan prediksi.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {result ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {compactFeatureSummary(result.features).map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
                    >
                      <span className="text-muted-foreground">
                        {item.label}
                      </span>
                      <span className="font-medium tabular-nums">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
            <CardFooter>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <SaveIcon />
                Prediksi berhasil otomatis tersimpan di riwayat lokal.
              </div>
            </CardFooter>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {modelMetrics.map((metric) => (
              <Card key={metric.label}>
                <CardHeader className="pb-2">
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle className="text-2xl">{metric.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {metric.detail}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sistem ini dibuat oleh</CardTitle>
              <CardDescription>
                Identitas pembuat dapat disesuaikan di halaman About.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Nama</p>
                <p className="font-medium">Muhamad Raihan Nurhidayat</p>
              </div>
              <div>
                <p className="text-muted-foreground">Project</p>
                <p className="font-medium">Prediction Price Car System</p>
              </div>
              <div>
                <p className="text-muted-foreground">NPM</p>
                <p className="font-medium">237006108</p>
              </div>
            </CardContent>
            <Separator />
            <CardFooter className="text-sm text-muted-foreground">
              Next.js 15, shadcn/ui, Sonner, dan Flask Linear Regression API.
            </CardFooter>
          </Card>
        </div>
      </section>
    </main>
  );
}
