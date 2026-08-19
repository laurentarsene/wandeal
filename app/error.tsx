"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-2xl font-extrabold text-[#111]">Oups.</h1>
      <p className="mt-2 max-w-sm text-sm text-[#4B5563]">
        Quelque chose s&apos;est mal passé de notre côté. Réessayez — si ça persiste,
        revenez dans quelques minutes.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C48CD] text-white text-sm font-semibold hover:bg-[#173BA8] transition-colors cursor-pointer"
      >
        <RotateCcw size={15} />
        Réessayer
      </button>
    </main>
  );
}
