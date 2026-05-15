import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { API_BASE_URL, featureDefinitions, modelMetrics } from "@/lib/car-data";

export default function AboutPage() {
  return (
    <main className="flex-1 bg-muted/30">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <Badge className="w-fit" variant="secondary">
            Project Overview
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Prediction Price Car System
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            Frontend interaktif untuk mendemonstrasikan model Linear Regression
            yang memprediksi harga mobil dari delapan fitur teknis.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Metodologi CRISP-DM</CardTitle>
              <CardDescription>
                Alur kerja yang digunakan dalam project sains data.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {[
                "Business Understanding",
                "Data Understanding",
                "Data Preparation",
                "Modeling",
                "Evaluation",
                "Deployment",
              ].map((phase, index) => (
                <div key={phase} className="rounded-lg border p-4">
                  <Badge variant="outline">0{index + 1}</Badge>
                  <p className="mt-3 font-medium">{phase}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Model</CardTitle>
              <CardDescription>
                Ringkasan teknis model prediksi.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">Algoritma</span>
                <span className="font-medium">Linear Regression</span>
              </div>
              <Separator />
              <div className="grid gap-3">
                {modelMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="text-sm text-muted-foreground">
                      {metric.label}
                    </span>
                    <span className="font-semibold">{metric.value}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex flex-wrap gap-2">
                {featureDefinitions.map((feature) => (
                  <Badge key={feature.key} variant="secondary">
                    {feature.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Integrasi API</CardTitle>
              <CardDescription>
                Website memakai endpoint Flask yang sudah tersedia.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2">
                <span className="text-muted-foreground">Base URL</span>
                <code className="truncate font-mono">{API_BASE_URL}</code>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2">
                <span className="text-muted-foreground">Health</span>
                <code className="font-mono">GET /health</code>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2">
                <span className="text-muted-foreground">Prediction</span>
                <code className="font-mono">POST /predict</code>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Creator</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 md:gap-4">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nama</p>
                  <p className="font-medium">Muhamad Raihan Nurhidayat</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NPM</p>
                  <p className="font-medium">237006108</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mata Kuliah</p>
                  <p className="font-medium">Sains Data - Semester 6</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Repository Backend
                  </p>
                  <Link
                    className="font-medium underline underline-offset-4"
                    href="https://github.com/raihannurhidayat/data-science-prediction-price-car-system"
                    target="_blank"
                    rel="noreferrer"
                  >
                    prediction-price-car-system
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Frontend Backend
                  </p>
                  <Link
                    className="font-medium underline underline-offset-4"
                    href="https://github.com/raihannurhidayat/data-science-prediction-price-car-website"
                    target="_blank"
                    rel="noreferrer"
                  >
                    prediction-price-car-website
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
