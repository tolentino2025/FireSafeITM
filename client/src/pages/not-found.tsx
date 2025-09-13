import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">404 Página Não Encontrada</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Você esqueceu de adicionar a página ao roteador?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
