import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-heading text-3xl">Jean introuvable</h1>
      <p className="mt-3 text-muted-foreground">
        Ce modèle n’est pas dans le catalogue Veltrano.
      </p>
      <Link href="/" className="mt-6 inline-block underline">
        Retour à la boutique
      </Link>
    </div>
  );
}
