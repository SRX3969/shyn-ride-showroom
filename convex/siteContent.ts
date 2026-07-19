import { query } from "./_generated/server";

export const getAll = query({
  handler: async (ctx) => {
    const rows = await ctx.db.query("site_content").collect();
    const out: Record<string, any> = {};
    for (const r of rows) {
      out[r.key] = r.value;
    }
    return out;
  },
});
