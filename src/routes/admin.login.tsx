import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { setSessionToken } from "@/lib/auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CarFront, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const loginAction = useAction(api.admin.login);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Get a pseudo-IP from a public API or just use a dummy string for the client-side
      // In a real edge environment, IP would be passed from headers.
      // Here we just use a static string or let Convex handle it if it could.
      const ip = "client-ip"; 
      
      const token = await loginAction({
        username: data.username,
        password: data.password,
        ip,
      });

      setSessionToken(token);
      toast.success("Logged in successfully");
      
      navigate({ to: "/admin/inventory" });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border/50 bg-surface p-8 shadow-xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-ui/10 text-gold-ui">
            <CarFront className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-text-primary">
            Admin Login
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Sign in to manage SHYN RIDE inventory
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Username
            </label>
            <input
              {...register("username")}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold-ui focus:outline-none focus:ring-1 focus:ring-gold-ui"
              placeholder="Enter username"
            />
            {errors.username && (
              <p className="mt-1.5 text-xs text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold-ui focus:outline-none focus:ring-1 focus:ring-gold-ui"
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gold-ui px-4 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:bg-gold-ui/90 hover:shadow-lg disabled:opacity-50"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
