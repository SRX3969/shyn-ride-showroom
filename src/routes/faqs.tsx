import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { Header, Footer } from "@/components/site-chrome";
import { getSiteContent } from "@/lib/cars.functions";

const contentQuery = queryOptions({
  queryKey: ["site-content"],
  queryFn: () => getSiteContent(),
});

export const Route = createFileRoute("/faqs")({
  loader: ({ context }) => context.queryClient.ensureQueryData(contentQuery),
  component: FaqPage,
  head: () => ({
    meta: [
      { title: "FAQs — SHYN RIDE" },
      {
        name: "description",
        content:
          "Answers about buying and selling pre-owned luxury cars with SHYN RIDE in Bangalore — inspections, finance, RTO paperwork.",
      },
      { property: "og:title", content: "FAQs — SHYN RIDE" },
      { property: "og:url", content: "/faqs" },
    ],
    links: [{ rel: "canonical", href: "/faqs" }],
  }),
});

function FaqPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Suspense fallback={<div className="h-screen" />}>
        <FaqContent />
      </Suspense>
      <Footer />
    </div>
  );
}

function FaqContent() {
  const { data } = useSuspenseQuery(contentQuery);
  const faqs: { q: string; a: string }[] = data.faqs ?? [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <div className="text-xs uppercase tracking-[0.3em] text-champagne">FAQs</div>
      <h1 className="mt-4 font-display text-5xl">Common questions.</h1>
      <div className="mt-16 divide-y divide-border border-y border-border">
        {faqs.map((f, i) => (
          <FaqItem key={i} q={f.q} a={f.a} />
        ))}
      </div>
    </main>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-6 py-6 text-left"
      >
        <span className="font-display text-xl text-foreground">{q}</span>
        <span className="mt-1 text-champagne transition-transform" style={{ transform: open ? "rotate(45deg)" : "none" }}>
          +
        </span>
      </button>
      {open && <div className="pb-8 pr-10 text-base leading-relaxed text-muted-foreground">{a}</div>}
    </div>
  );
}
