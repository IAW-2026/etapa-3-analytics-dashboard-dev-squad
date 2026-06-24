"use client";

import { useClerk } from "@clerk/nextjs";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  const { signOut } = useClerk();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center max-w-sm">
        <ShieldX className="w-16 h-16 mx-auto mb-4 opacity-40" />
        <h1 className="text-xl font-bold mb-2">Acceso denegado</h1>
        <p className="text-sm opacity-60 mb-6">
          No tenés permisos de administrador para acceder a esta sección.
        </p>
        <button
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
          className="px-5 py-2 rounded-lg border border-[var(--border)] text-sm font-medium hover:bg-[var(--muted)] transition-colors cursor-pointer"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
