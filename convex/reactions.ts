import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Functia pentru a prelua un membru dintr-un workspace pe baza ID-urilor
const getMember = async (
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">
) => {
  return ctx.db
    .query("members")
    .withIndex("by_workspace_id_user_id", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId)
    )
    .unique(); // Asigura ca se returneaza un singur membru
};

// Mutation pentru a schimba reactia unui utilizator pe un mesaj
export const toggle = mutation({
  args: { messageId: v.id("messages"), value: v.string() }, // Definirea parametrilor de intrare: ID-ul mesajului si valoarea reactiei
  handler: async (ctx, args) => {
    // Obtinerea ID-ului utilizatorului autentificat
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized"); // Daca nu este autentificat, arunca eroare
    }

    // Preluarea mesajului
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found"); // Daca mesajul nu exista, arunca eroare
    }

    // Verifica daca utilizatorul este membru in workspace-ul respectiv
    const member = await getMember(ctx, message.workspaceId, userId);
    if (!member) {
      throw new Error("Unauthorized"); // Daca utilizatorul nu este membru, arunca eroare
    }

    // Verifica daca utilizatorul a reactionat deja la acest mesaj
    const existingMessageReactionFromUser = await ctx.db
      .query("reactions")
      .filter((q) =>
        q.and(
          q.eq(q.field("messageId"), args.messageId),
          q.eq(q.field("memberId"), member._id),
          q.eq(q.field("value"), args.value)
        )
      )
      .first(); // Cauta reactia deja existenta a utilizatorului

    // Daca reactia exista deja, o sterge
    if (existingMessageReactionFromUser) {
      await ctx.db.delete(existingMessageReactionFromUser._id); // Sterge reactia
      return existingMessageReactionFromUser._id; // Returneaza ID-ul reactiei sterse
    } else {
      // Daca reactia nu exista, o creeaza
      const newReactionId = await ctx.db.insert("reactions", {
        value: args.value,
        memberId: member._id,
        messageId: message._id,
        workspaceId: message.workspaceId,
      });
      return newReactionId; // Returneaza ID-ul noii reactii
    }
  },
});
