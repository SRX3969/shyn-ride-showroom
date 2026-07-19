import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { ConvexClientProvider } from "@/integrations/convex/ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

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

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="shyn-ride-theme">
      <ConvexClientProvider>
        <QueryClientProvider client={queryClient}>
          <Outlet />
          <Toaster position="bottom-center" />
        </QueryClientProvider>
      </ConvexClientProvider>
    </ThemeProvider>
  );
}
