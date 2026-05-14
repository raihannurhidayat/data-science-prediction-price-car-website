import { Badge } from "@/components/ui/badge";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Project UAS Sains Data - Prediksi Harga Mobil</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Linear Regression</Badge>
          <Badge variant="outline">R2 0.7459</Badge>
          <Badge variant="outline">RMSE 7.39</Badge>
        </div>
      </div>
    </footer>
  );
}
