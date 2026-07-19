import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

// Queries

export const verifySession = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!session) return null;
    if (session.expires_at < Date.now()) return null;

    const user = await ctx.db.get(session.admin_id);
    if (!user) return null;

    return {
      id: user._id,
      username: user.username,
      role: user.role,
    };
  },
});

export const getAdminByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    return await ctx.db
      .query("admin_users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
  },
});

// Mutations

export const createSession = mutation({
  args: { admin_id: v.id("admin_users"), token: v.string(), expires_in_days: v.number() },
  handler: async (ctx, { admin_id, token, expires_in_days }) => {
    const expires_at = Date.now() + expires_in_days * 24 * 60 * 60 * 1000;
    await ctx.db.insert("sessions", {
      token,
      admin_id,
      expires_at,
    });
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

export const logActivity = mutation({
  args: {
    action: v.string(),
    entity: v.string(),
    entity_id: v.string(),
    admin_user: v.string(),
    detail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activity_logs", args);
  },
});

export const recordLoginAttempt = mutation({
  args: {
    username: v.string(),
    ip: v.string(),
    successful: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("login_attempts", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const getRecentLoginAttempts = query({
  args: { ip: v.string(), username: v.string() },
  handler: async (ctx, { ip, username }) => {
    // Lock out if 5 failed attempts in the last 10 minutes
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    
    // We check by IP or by username
    const byIp = await ctx.db
      .query("login_attempts")
      .withIndex("by_ip", (q) => q.eq("ip", ip))
      .filter((q) => q.gte(q.field("timestamp"), tenMinutesAgo))
      .collect();

    const byUsername = await ctx.db
      .query("login_attempts")
      .withIndex("by_username", (q) => q.eq("username", username))
      .filter((q) => q.gte(q.field("timestamp"), tenMinutesAgo))
      .collect();

    const failedIpCount = byIp.filter((a) => !a.successful).length;
    const failedUserCount = byUsername.filter((a) => !a.successful).length;

    return Math.max(failedIpCount, failedUserCount);
  },
});

// Setup Initial Admin (Run this once or via a secure seed script)
export const bootstrapAdmin = action({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, { username, password }) => {
    const existing = await ctx.runQuery(api.admin.getAdminByUsername, { username });
    if (existing) throw new Error("Admin already exists");

    const password_hash = await bcrypt.hash(password, 12);
    
    await ctx.runMutation(api.admin.createAdminUser, {
      username,
      password_hash,
      role: "owner",
    });
  },
});

export const createAdminUser = mutation({
  args: { username: v.string(), password_hash: v.string(), role: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("admin_users", args);
  },
});

export const login = action({
  args: { username: v.string(), password: v.string(), ip: v.string() },
  handler: async (ctx, { username, password, ip }) => {
    // Check rate limit first
    const failedAttempts = await ctx.runQuery(api.admin.getRecentLoginAttempts, { ip, username });
    if (failedAttempts >= 5) {
      throw new Error("Too many failed login attempts. Please try again later.");
    }

    const admin = await ctx.runQuery(api.admin.getAdminByUsername, { username });
    if (!admin) {
      await ctx.runMutation(api.admin.recordLoginAttempt, { username, ip, successful: false });
      throw new Error("Invalid username or password");
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      await ctx.runMutation(api.admin.recordLoginAttempt, { username, ip, successful: false });
      throw new Error("Invalid username or password");
    }

    // Success! Record attempt
    await ctx.runMutation(api.admin.recordLoginAttempt, { username, ip, successful: true });

    // Generate session token
    const token = crypto.randomUUID();
    await ctx.runMutation(api.admin.createSession, {
      admin_id: admin._id,
      token,
      expires_in_days: 7, // 1 week session
    });

    return token;
  },
});

export const listAdmins = query({
  handler: async (ctx) => {
    return await ctx.db.query("admin_users").collect();
  },
});

export const deleteAdmin = mutation({
  args: { id: v.id("admin_users") },
  handler: async (ctx, { id }) => {
    // Prevent deleting the last owner
    const allAdmins = await ctx.db.query("admin_users").collect();
    const target = await ctx.db.get(id);
    if (!target) throw new Error("Admin not found");
    
    if (target.role === "owner") {
      const owners = allAdmins.filter(a => a.role === "owner");
      if (owners.length <= 1) {
        throw new Error("Cannot delete the last owner");
      }
    }
    
    await ctx.db.delete(id);
  },
});

export const changePassword = action({
  args: { id: v.id("admin_users"), new_password: v.string() },
  handler: async (ctx, { id, new_password }) => {
    const password_hash = await bcrypt.hash(new_password, 12);
    await ctx.runMutation(api.admin.updateAdminPassword, { id, password_hash });
  },
});

export const updateAdminPassword = mutation({
  args: { id: v.id("admin_users"), password_hash: v.string() },
  handler: async (ctx, { id, password_hash }) => {
    await ctx.db.patch(id, { password_hash });
  },
});
