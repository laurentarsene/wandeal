import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
      <p className="font-display text-6xl text-[#1C48CD]">404</p>
      <h1 className="mt-2 text-xl font-extrabold text-[#111]">Page introuvable</h1>
      <p className="mt-2 max-w-sm text-sm text-[#4B5563]">
        Cette page n&apos;existe pas (ou plus). Le voyage continue ailleurs.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C48CD] text-white text-sm font-semibold hover:bg-[#173BA8] transition-colors"
      >
        <ArrowLeft size={15} />
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
