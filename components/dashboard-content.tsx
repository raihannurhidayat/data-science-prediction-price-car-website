"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  featureScatter,
  modelMetrics,
  priceDistribution,
  topCars,
} from "@/lib/car-data";

const priceChartConfig = {
  cars: {
    label: "Jumlah Mobil",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const scatterChartConfig = {
  price: {
    label: "Harga",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function DashboardContent() {
  return (
    <main className="flex-1 bg-muted/30">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <Badge className="w-fit" variant="secondary">
            Dataset Insight
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Dashboard Statistik
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Ringkasan visualisasi data dan performa model.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {modelMetrics.map((metric) => (
            <Card key={metric.label}>
              <CardHeader>
                <CardDescription>{metric.label}</CardDescription>
                <CardTitle className="text-3xl">{metric.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{metric.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Harga Mobil</CardTitle>
              <CardDescription>
                Histogram harga dari dataset car sales.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={priceChartConfig}
                className="min-h-72 w-full"
              >
                <BarChart data={priceDistribution} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="range"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis tickLine={false} axisLine={false} width={36} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="cars" fill="var(--color-cars)" radius={6} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horsepower vs Harga</CardTitle>
              <CardDescription>
                Contoh hubungan fitur teknis dengan harga mobil.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={scatterChartConfig}
                className="min-h-72 w-full"
              >
                <ScatterChart data={featureScatter} accessibilityLayer>
                  <CartesianGrid />
                  <XAxis
                    dataKey="horsepower"
                    name="Horsepower"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    type="number"
                    unit=" HP"
                  />
                  <YAxis
                    dataKey="price"
                    name="Harga"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    type="number"
                    unit="k"
                    width={38}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Scatter dataKey="price" fill="var(--color-price)" />
                </ScatterChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Mobil Terlaris</CardTitle>
            <CardDescription>
              Data statis untuk mendukung narasi dataset saat presentasi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCars.map((car) => (
                    <TableRow key={car.model}>
                      <TableCell className="font-medium">{car.model}</TableCell>
                      <TableCell>{car.segment}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {car.sales.toLocaleString("en-US")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
