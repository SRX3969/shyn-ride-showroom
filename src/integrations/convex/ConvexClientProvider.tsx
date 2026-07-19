import { ConvexProvider, ConvexReactClient } from "convex/react";
import { type ReactNode } from "react";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string;

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl text-foreground">Configuration Error</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The <code className="rounded bg-muted px-1">VITE_CONVEX_URL</code> environment variable is missing.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Please add it to your environment variables (e.g., in Vercel project settings) and redeploy.
          </p>
        </div>
      </div>
    );
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
