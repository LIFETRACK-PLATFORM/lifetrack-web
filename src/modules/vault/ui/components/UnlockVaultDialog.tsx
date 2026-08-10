"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, TriangleAlert } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@lifetrack/system-design";

export function UnlockVaultDialog({
  onUnlock,
  unlocking,
  error,
}: {
  onUnlock: (masterPassword: string) => Promise<boolean>;
  unlocking: boolean;
  error: string | null;
}) {
  const [masterPassword, setMasterPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!masterPassword.trim()) {
      setClientError("Ingresá tu contraseña maestra.");
      return;
    }
    if (masterPassword.length < 8) {
      setClientError("La contraseña maestra debe tener al menos 8 caracteres.");
      return;
    }

    const success = await onUnlock(masterPassword);
    if (success) setMasterPassword("");
  };

  return (
    <Card className="w-full max-w-md border-t-[3px] border-t-primary bg-primary/[0.03]">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-[11px] bg-primary/15 text-primary">
            <Lock className="size-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-body-md">Desbloquear bóveda</CardTitle>
            <p className="mt-1 font-label text-label-md text-text-3">
              Zero-knowledge: tus secretos nunca salen cifrados del dispositivo.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Alert variant="warning">
          <TriangleAlert />
          <AlertTitle>Importante</AlertTitle>
          <AlertDescription>
            Si olvidás tu contraseña maestra, no hay forma de recuperar tus
            contraseñas guardadas. No podemos restablecerla por vos.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vault-master-password">Contraseña maestra</Label>
            <div className="relative">
              <Input
                id="vault-master-password"
                type={showPassword ? "text" : "password"}
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                placeholder="Tu contraseña maestra"
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-text-3 hover:text-text-1"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {(clientError || error) && (
            <p className="text-body-md text-error">{clientError ?? error}</p>
          )}

          <Button type="submit" disabled={unlocking} className="w-full">
            {unlocking ? "Desbloqueando…" : "Desbloquear bóveda"}
          </Button>
        </form>

        <div className="border-t border-border pt-4 text-center">
          <Link
            href="/rehab"
            className="inline-flex items-center gap-1.5 font-label text-label-md text-text-3 transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Volver sin desbloquear
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
