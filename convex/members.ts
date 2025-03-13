import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// Query pentru a obține membrul curent al unui workspace
export const current = query({
  args: { workspaceId: v.id("workspaces") }, // Parametru: workspaceId
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx); // Obține ID-ul utilizatorului autenticat
    if (!userId) {
      return null; // Dacă nu există un utilizator autenticat, returnează null
    }
    // Căutăm în tabelul 'members' membrul care corespunde userId și workspaceId
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique(); // Asigură-te că returnezi doar un singur membru
    if (!member) {
      return null; // Dacă membrul nu există, returnează null
    }
    return member; // Returnează membrul găsit
  },
});

// Funcție pentru a obține informațiile unui utilizator pe baza ID-ului
const populateUser = (ctx: QueryCtx, id: Id<"users">) => {
  return ctx.db.get(id); // Returnează utilizatorul corespunzător ID-ului
};

// Query pentru a obține un membru pe baza ID-ului
export const getById = query({
  args: { id: v.id("members") }, // Parametru: id-ul membrului
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx); // Obține ID-ul utilizatorului autenticat
    if (!userId) {
      return null; // Dacă nu există utilizator autenticat, returnează null
    }

    const member = await ctx.db.get(args.id); // Căutăm membrul în baza de date
    if (!member) {
      return null; // Dacă membrul nu există, returnează null
    }

    // Căutăm dacă utilizatorul curent face parte din workspace-ul membrului
    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      );

    if (!currentMember) {
      return null; // Dacă utilizatorul curent nu este în workspace-ul respectiv, returnează null
    }

    const user = await populateUser(ctx, member.userId); // Populează detaliile utilizatorului
    if (!user) {
      return null; // Dacă utilizatorul nu există, returnează null
    }

    return {
      ...member, // Returnează informațiile complete ale membrului
      user, // Adaugă informațiile utilizatorului
    };
  },
});

// Query pentru a obține toți membrii unui workspace
export const get = query({
  args: { workspaceId: v.id("workspaces") }, // Parametru: workspaceId
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx); // Obține ID-ul utilizatorului autenticat
    if (!userId) {
      return []; // Dacă nu există utilizator autenticat, returnează un array gol
    }
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique(); // Căutăm membrul curent
    if (!member) {
      return []; // Dacă membrul nu există, returnează un array gol
    }

    const data = await ctx.db
      .query("members")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .collect(); // Colectează toți membrii din workspace-ul respectiv

    const members = []; // Array pentru membrii care vor fi returnați
    // Populează fiecare membru cu detalii despre utilizator
    for (const member of data) {
      const user = await populateUser(ctx, member.userId);
      if (user) {
        members.push({ ...member, user }); // Adaugă membrul complet în array
      }
    }

    return members; // Returnează lista completă de membri
  },
});

// Mutation pentru a actualiza rolul unui membru într-un workspace
export const update = mutation({
  args: {
    id: v.id("members"), // Parametru: id-ul membrului
    role: v.union(v.literal("admin"), v.literal("member")), // Parametru: rolul nou (admin sau member)
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx); // Obține ID-ul utilizatorului autenticat
    if (!userId) {
      throw new Error("Unauthorized"); // Dacă utilizatorul nu este autentificat, aruncă eroare
    }

    const member = await ctx.db.get(args.id); // Căutăm membrul care urmează să fie actualizat
    if (!member) {
      throw new Error("Unauthorized"); // Dacă membrul nu există, aruncă eroare
    }

    // Verificăm dacă utilizatorul curent este administratorul workspace-ului
    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!currentMember || currentMember.role !== "admin") {
      throw new Error("Unauthorized"); // Dacă utilizatorul curent nu este admin, aruncă eroare
    }

    await ctx.db.patch(args.id, { role: args.role }); // Actualizează rolul membrului
    return args.id; // Returnează ID-ul membrului actualizat
  },
});

// Mutation pentru a elimina un membru dintr-un workspace
export const remove = mutation({
  args: {
    id: v.id("members"), // Parametru: id-ul membrului de eliminat
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx); // Obține ID-ul utilizatorului autenticat
    if (!userId) {
      throw new Error("Unauthorized"); // Dacă nu este autentificat, aruncă eroare
    }

    const member = await ctx.db.get(args.id); // Căutăm membrul de eliminat
    if (!member) {
      throw new Error("Unauthorized"); // Dacă membrul nu există, aruncă eroare
    }

    // Identificam membrul ce a efectuat request-ul
    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!currentMember) {
      throw new Error("Unauthorized"); // Dacă utilizatorul curent nu există în workspace, aruncă eroare
    }

    const isAdmin = member.role === "admin"; // Verifică dacă membrul este admin
    if (isAdmin) {
      throw new Error("Admin cannot be removed"); // Admin-ul nu poate fi eliminat
    }

    if (currentMember._id === args.id && currentMember.role === "admin") {
      throw new Error("Cannot remove self if self is an admin!"); // Un admin nu se poate elimina pe el insusi dintr-un workspace
    }

    // Șterge mesajele, reacțiile și conversațiile asociate membrului
    const [messages, reactions, conversations] = await Promise.all([
      ctx.db
        .query("messages")
        .withIndex("by_member_id", (q) => q.eq("memberId", member._id))
        .collect(),
      ctx.db
        .query("reactions")
        .withIndex("by_member_id", (q) => q.eq("memberId", member._id))
        .collect(),
      ctx.db
        .query("conversations")
        .filter((q) =>
          q.or(
            q.eq(q.field("memberOneId"), member._id),
            q.eq(q.field("memberTwoId"), member._id)
          )
        )
        .collect(),
    ]);

    // Șterge toate mesajele, reacțiile și conversațiile asociate
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }
    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }

    await ctx.db.delete(args.id); // Șterge membrul din baza de date
    return args.id; // Returnează ID-ul membrului șters
  },
});
