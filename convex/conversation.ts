import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createOrGet = mutation({
  args: {
    memberId: v.id("members"), // ID-ul membrului cu care se inițiază conversația
    workspaceId: v.id("workspaces"), // ID-ul workspace-ului în care are loc conversația
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx); // Obține ID-ul utilizatorului autentificat
    if (!userId) {
      throw new Error("Unauthorized"); // Aruncă eroare dacă utilizatorul nu este autentificat
    }

    // Verifică dacă utilizatorul autentificat este membru al workspace-ului
    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    const otherMember = await ctx.db.get(args.memberId); // Obține detaliile celuilalt membru

    if (!currentMember || !otherMember) {
      throw new Error("Member not found"); // Aruncă eroare dacă unul dintre membri nu există
    }

    // Verifică dacă există deja o conversație între acești doi membri în același workspace
    const existingConversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("memberOneId"), currentMember._id),
            q.eq(q.field("memberTwoId"), otherMember._id)
          ),
          q.and(
            q.eq(q.field("memberOneId"), otherMember._id),
            q.eq(q.field("memberTwoId"), currentMember._id)
          )
        )
      )
      .unique();

    if (existingConversation) {
      return existingConversation._id; // Returnează ID-ul conversației existente dacă aceasta există deja
    }

    // Creează o nouă conversație dacă nu există deja
    const conversationId = await ctx.db.insert("conversations", {
      workspaceId: args.workspaceId,
      memberOneId: currentMember._id,
      memberTwoId: otherMember._id,
    });

    return conversationId; // Returnează ID-ul noii conversații
  },
});
