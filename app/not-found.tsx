import Link from "next/link";

export default function NotFound() {
  return (
    <section className="space-y-4 py-20 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">404</p>
      <h1 className="font-display text-5xl text-ink">Page not found</h1>
      <Link className="text-sm underline underline-offset-4" href="/">
        Return home
      </Link>
    </section>
  );
}
