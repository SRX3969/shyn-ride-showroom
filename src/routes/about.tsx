import { createFileRoute } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — SHYN RIDE" },
      {
        name: "description",
        content:
          "SHYN RIDE is a Bangalore-based curated pre-owned luxury car showroom. Fewer, better cars. Certified, transparent, unhurried.",
      },
      { property: "og:title", content: "About — SHYN RIDE" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-24">
        <div className="text-xs uppercase tracking-[0.3em] text-champagne">About</div>
        <h1 className="mt-4 font-display text-5xl leading-tight">
          Fewer cars, chosen carefully.
        </h1>
        <div className="mt-12 space-y-8 text-lg leading-relaxed text-foreground/90">
          <p>
            SHYN RIDE is a small, deliberate showroom in Bangalore. We keep a tight floor of
            pre-owned luxury cars — Mercedes-Benz, BMW, Audi, Land Rover, Porsche, Jaguar — and we
            only list a car once we would happily own it ourselves.
          </p>
          <p>
            Every car undergoes a 180-point mechanical, cosmetic and paperwork inspection. Service
            history is verified. Odometers are audited. Anything that isn't right is fixed, or the
            car doesn't make it to the floor.
          </p>
          <p>
            We price honestly against the current market, and we tell you what's on the price tag.
            No theatre. No pressure. Come in, sit in the car, drive it. Take your time.
          </p>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-10 border-t border-border pt-16 md:grid-cols-3">
          {[
            { k: "Since", v: "2019" },
            { k: "Cars sold", v: "300+" },
            { k: "Return rate", v: "0.4%" },
          ].map((s) => (
            <div key={s.k}>
              <div className="tabular font-display text-4xl text-champagne">{s.v}</div>
              <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{s.k}</div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
