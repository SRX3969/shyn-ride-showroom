import { QueryCtx, MutationCtx } from "../_generated/server";

export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
  token: string
) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .first();

  if (!session) throw new Error("Not authenticated");
  if (session.expires_at < Date.now()) throw new Error("Session expired");

  const user = await ctx.db.get(session.admin_id);
  if (!user) throw new Error("Not authenticated");

  return user; // { username, role, ... }
}
