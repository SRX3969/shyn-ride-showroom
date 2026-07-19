import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";
import { ConvexClientProvider } from "@/integrations/convex/ConvexClientProvider";

import appCss from "../styles.css?url";

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl text-foreground">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page didn't load. Try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-sm bg-champagne px-4 py-2 text-xs font-medium uppercase tracking-widest text-primary-foreground btn-shine"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-sm border border-border px-4 py-2 text-xs uppercase tracking-widest text-foreground"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-6xl text-gradient-gold">404</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          This page doesn't exist. Perhaps it has already been sold.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="rounded-sm bg-champagne px-4 py-2 text-xs font-medium uppercase tracking-widest text-primary-foreground btn-shine"
          >
            Return home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "SHYN RIDE — Pre-Owned Luxury Cars, Bangalore" },
        {
          name: "description",
          content:
            "A curated pre-owned luxury car showroom in Bangalore. Certified, transparent, unhurried. Mercedes-Benz, BMW, Audi, Land Rover, Porsche and more.",
        },
        { property: "og:site_name", content: "SHYN RIDE" },
        {
          property: "og:title",
          content: "SHYN RIDE — Pre-Owned Luxury Cars, Bangalore",
        },
        {
          property: "og:description",
          content: "A curated pre-owned luxury car showroom in Bangalore.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap",
        },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <ConvexClientProvider>
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    </ConvexClientProvider>
  );
}
