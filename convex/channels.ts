import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Query pentru a obține toate canalele unui workspace, doar dacă utilizatorul este membru
export const get = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Verifică dacă utilizatorul este membru al workspace-ului
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member) {
      return [];
    }

    // Returnează toate canalele din workspace-ul specificat
    return await ctx.db
      .query("channels")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .collect();
  },
});

// Mutatie pentru actualizarea numelui unui canal, doar de către un administrator
export const update = mutation({
  args: {
    id: v.id("channels"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verifică dacă canalul există
    const channel = await ctx.db.get(args.id);
    if (!channel) {
      throw new Error("Channel not found");
    }

    // Verifică dacă utilizatorul este administrator în workspace-ul canalului
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", channel.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Actualizează numele canalului
    await ctx.db.patch(args.id, {
      name: args.name,
    });
    return args.id;
  },
});

// Mutatie pentru ștergerea unui canal, doar de către un administrator
export const remove = mutation({
  args: {
    id: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verifică dacă canalul există
    const channel = await ctx.db.get(args.id);
    if (!channel) {
      throw new Error("Channel not found");
    }

    // Verifică dacă utilizatorul este administrator
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", channel.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Șterge toate mesajele asociate canalului
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel_id", (q) => q.eq("channelId", args.id))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Șterge canalul
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Mutatie pentru crearea unui nou canal, doar de către un administrator
export const create = mutation({
  args: { name: v.string(), workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthorized");
    }

    // Verifică dacă utilizatorul este administrator în workspace
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Normalizează numele canalului (fără spații, lowercase) -- Ne asiguram de acest lucru, repetand acest procest si pe partea de server.
    const parsedName = args.name.replace(/\s+/g, "-").toLowerCase();

    // Creează canalul în baza de date
    return await ctx.db.insert("channels", {
      name: parsedName,
      workspaceId: args.workspaceId,
    });
  },
});

// Query pentru a obține un canal după ID, doar dacă utilizatorul este membru
export const getById = query({
  args: { id: v.id("channels") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Verifică dacă canalul există
    const channel = await ctx.db.get(args.id);
    if (!channel) {
      return null;
    }

    // Verifică dacă utilizatorul este membru al workspace-ului canalului
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", channel.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member) {
      return null;
    }

    return channel;
  },
});
