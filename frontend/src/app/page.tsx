import Link from "next/link";
import { DEMO_CASES } from "@/schemas/cases";

/** Person D — case queue skeleton */
export default function HomePage() {
  const cases = DEMO_CASES.filter((c) => c.demo);

  return (
    <main>
      <h2 className="mb-4 text-lg font-semibold text-ink">Open disputes</h2>
      <ul className="space-y-3">
        {cases.map((c) => (
          <li key={c.id}>
            <Link
              href={`/cases/${c.id}`}
              className="block rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm transition hover:border-accent"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-medium text-ink">#{c.id}</span>
                <span className="text-sm text-slate-500">
                  A${c.amount_aud.toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-700">{c.title}</p>
              <p className="mt-2 text-sm italic text-slate-500">
                “{c.customer_message}”
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
