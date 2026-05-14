"use client";

import { useEffect, useState } from "react";
import { Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HISTORY_STORAGE_KEY,
  PredictionHistoryItem,
  featureDefinitions,
  formatCurrency,
} from "@/lib/car-data";

function readHistory(): PredictionHistoryItem[] {
  try {
    const value = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    return value ? (JSON.parse(value) as PredictionHistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function HistoryContent() {
  const [items, setItems] = useState<PredictionHistoryItem[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setItems(readHistory());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const persist = (nextItems: PredictionHistoryItem[]) => {
    setItems(nextItems);
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextItems));
  };

  const removeItem = (id: string) => {
    persist(items.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    persist([]);
  };

  return (
    <main className="flex-1 bg-muted/30">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <Badge className="w-fit" variant="secondary">LocalStorage</Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Riwayat Prediksi</h1>
            <p className="max-w-2xl text-muted-foreground">
              Bandingkan skenario prediksi yang pernah berhasil dijalankan di browser ini.
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={items.length === 0}>
                <Trash2Icon data-icon="inline-start" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus semua riwayat?</AlertDialogTitle>
                <AlertDialogDescription>
                  Semua prediksi yang tersimpan di browser ini akan dihapus.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={clearAll}>Hapus</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{items.length} Prediksi Tersimpan</CardTitle>
            <CardDescription>Maksimal 100 prediksi terbaru disimpan secara lokal.</CardDescription>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
                <p className="font-medium">Belum ada riwayat</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Jalankan prediksi dari halaman utama untuk melihat hasilnya di sini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Fitur Input</TableHead>
                      <TableHead className="text-right">Prediksi</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="min-w-40">
                          {new Intl.DateTimeFormat("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(item.createdAt))}
                        </TableCell>
                        <TableCell className="min-w-96">
                          <div className="flex flex-wrap gap-2">
                            {featureDefinitions.slice(0, 4).map((feature) => (
                              <Badge key={feature.key} variant="outline">
                                {feature.label}: {item.features[feature.key]} {feature.unit}
                              </Badge>
                            ))}
                            <Badge variant="secondary">+4 fitur</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {formatCurrency(item.predictedPrice, item.currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} aria-label="Hapus riwayat">
                            <Trash2Icon />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
