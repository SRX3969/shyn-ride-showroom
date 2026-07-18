import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Admin Sign In — SHYN RIDE" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    navigate({ to: "/admin", replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="font-display text-2xl">
          SHYN <span className="text-champagne">RIDE</span>
        </Link>
        <div className="mt-12">
          <div className="text-xs uppercase tracking-[0.3em] text-champagne">Admin</div>
          <h1 className="mt-3 font-display text-3xl">Sign in.</h1>
        </div>
        <form onSubmit={submit} className="mt-10 space-y-5">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Email</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm focus:border-champagne focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm focus:border-champagne focus:outline-none"
            />
          </div>
          {error && <div className="text-xs text-destructive">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-champagne px-6 py-3 text-xs uppercase tracking-widest text-primary-foreground disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-champagne">← Back to site</Link>
        </div>
      </div>
    </div>
  );
}
