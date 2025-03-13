/* eslint-disable @typescript-eslint/no-unused-vars */

import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

// Helpers

// Funcție pentru a popula informațiile despre un thread (fir de discuție).
const populateThread = async (ctx: QueryCtx, messageId: Id<"messages">) => {
  const messages = await ctx.db
    .query("messages")
    .withIndex(
      "by_parent_message_id",
      (q) => q.eq("parentMessageId", messageId) // Interogare pentru a găsi mesajele răspuns la un alt mesaj.
    )
    .collect();

  if (messages.length === 0) {
    // Dacă nu sunt mesaje, întoarce un obiect gol.
    return {
      count: 0,
      image: undefined,
      timeStamp: 0,
      name: "",
    };
  }

  const lastMessage = messages[messages.length - 1]; // Ultimul mesaj din thread.
  const lastMessageMember = await populateMember(ctx, lastMessage.memberId); // Populează informațiile despre membrul care a trimis ultimul mesaj.

  if (!lastMessageMember) {
    // Dacă nu găsește membrul, întoarce un obiect gol.
    return {
      count: 0,
      image: undefined,
      timeStamp: 0,
      name: "",
    };
  }

  const lastMessageUser = await populateUser(ctx, lastMessageMember.userId); // Populează informațiile utilizatorului care a trimis ultimul mesaj.
  return {
    count: messages.length, // Numărul de mesaje din thread.
    image: lastMessageUser?.image, // Imaginea utilizatorului care a trimis ultimul mesaj.
    timeStamp: lastMessage._creationTime, // Timpul la care a fost creat ultimul mesaj.
    name: lastMessageUser?.name, // Numele utilizatorului.
  };
};

// Funcție pentru a popula reacțiile unui mesaj.
const populateReactions = (ctx: QueryCtx, messageId: Id<"messages">) => {
  return ctx.db
    .query("reactions")
    .withIndex("by_message_id", (q) => q.eq("messageId", messageId)) // Interogare pentru a găsi reacțiile asociate unui mesaj.
    .collect();
};

// Funcție pentru a popula informațiile utilizatorului.
const populateUser = (ctx: QueryCtx, userId: Id<"users">) => {
  return ctx.db.get(userId);
};

// Funcție pentru a popula informațiile despre un membru.
const populateMember = (ctx: QueryCtx, memberId: Id<"members">) => {
  return ctx.db.get(memberId);
};

// DB-query
// Funcție pentru a obține membrul unui workspace.
const getMember = async (
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">
) => {
  return ctx.db
    .query("members")
    .withIndex(
      "by_workspace_id_user_id",
      (q) => q.eq("workspaceId", workspaceId).eq("userId", userId) // Interogare pentru a găsi un membru în cadrul unui workspace specific.
    )
    .unique(); // Asigură-te că obții un singur rezultat.
};

// Mutație pentru actualizarea(editarea) unui mesaj.
export const update = mutation({
  args: {
    id: v.id("messages"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx); // Obține ID-ul utilizatorului autentificat.
    if (!userId) {
      throw new Error("Unauthorized"); // Dacă utilizatorul nu este autentificat, aruncă eroare.
    }

    const message = await ctx.db.get(args.id); // Obține mesajul pe care vrei să-l actualizezi.
    if (!message) {
      throw new Error("Message not found"); // Dacă mesajul nu există, aruncă eroare.
    }

    const member = await getMember(ctx, message.workspaceId, userId); // Verifică dacă utilizatorul este membru al workspace-ului.
    if (!member || member._id !== message.memberId) {
      throw new Error("Unauthorized"); // Dacă utilizatorul nu este autorul mesajului, aruncă eroare.
    }

    await ctx.db.patch(args.id, {
      body: args.body, // Actualizează corpul mesajului.
      updatedAt: Date.now(), // Actualizează data ultimei modificări.
    });

    return args.id; // Returnează ID-ul mesajului actualizat.
  },
});

// Funcția de eliminare a unui mesaj este similară, iar logica de autorizare este aceeași.
export const remove = mutation({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, args) => {
    // Mutație pentru ștergerea unui mesaj.
    const userId = await getAuthUserId(ctx); // Obține ID-ul utilizatorului autentificat.
    if (!userId) {
      throw new Error("Unauthorized"); // Dacă utilizatorul nu este autentificat, aruncă eroare.
    }

    const message = await ctx.db.get(args.id); // Obține mesajul de șters.
    if (!message) {
      throw new Error("Message not found"); // Dacă mesajul nu există, aruncă eroare.
    }

    const member = await getMember(ctx, message.workspaceId, userId); // Verifică dacă utilizatorul este membru al workspace-ului.
    if (!member || member._id !== message.memberId) {
      throw new Error("Unauthorized"); // Dacă utilizatorul nu este autorul mesajului, aruncă eroare.
    }

    await ctx.db.delete(args.id); // Șterge mesajul din baza de date.

    return args.id; // Returnează ID-ul mesajului șters.
  },
});

// Interogare care preia un mesaj specific după ID-ul său
export const getById = query({
  args: {
    id: v.id("messages"), // Parametru obligatoriu pentru ID-ul mesajului
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx); // Obținem ID-ul utilizatorului autentificat
    if (!userId) {
      return null; // Dacă nu există utilizator, returnăm null
    }

    const message = await ctx.db.get(args.id); // Preluăm mesajul din baza de date
    if (!message) {
      return null; // Dacă mesajul nu există, returnăm null
    }

    const currentMember = await getMember(ctx, message.workspaceId, userId); // Verificăm dacă utilizatorul este membru al workspace-ului
    if (!currentMember) {
      return null; // Dacă utilizatorul nu este membru, returnăm null
    }

    const member = await populateMember(ctx, message.memberId); // Preluăm informațiile despre membrul care a postat mesajul
    if (!member) {
      return null; // Dacă membrul nu există, returnăm null
    }

    const user = await populateUser(ctx, member.userId); // Preluăm informațiile despre utilizator
    if (!user) {
      return null; // Dacă utilizatorul nu există, returnăm null
    }

    const reactions = await populateReactions(ctx, message._id); // Preluăm reacțiile pentru mesajul respectiv
    const reactionsWithCounts = reactions.map((reaction) => {
      return {
        ...reaction,
        count: reactions.filter((r) => r.value === reaction.value).length, // Calculăm numărul de reacții de același tip
      };
    });

    // Eliminăm duplicatele și grupăm reacțiile pe baza valorii
    const dedupedReactions = reactionsWithCounts.reduce(
      (acc, reaction) => {
        const existingReaction = acc.find((r) => r.value === reaction.value);
        if (existingReaction) {
          existingReaction.memberIds = Array.from(
            new Set([...existingReaction.memberIds, reaction.memberId]) // Unificăm memberIds pentru fiecare reacție
          );
        } else {
          acc.push({ ...reaction, memberIds: [reaction.memberId] });
        }
        return acc;
      },
      [] as (Doc<"reactions"> & {
        count: number;
        memberIds: Id<"members">[];
      })[] // Returnăm reacțiile deduplicate
    );

    // Eliminăm `memberId` din reacții pentru a le face mai ușor de procesat pe frontend
    const reactionsWithoutMemberIdProperty = dedupedReactions.map(
      ({ memberId, ...rest }) => rest
    );

    return {
      ...message, // Returnăm mesajul original
      image: message.image
        ? await ctx.storage.getUrl(message.image) // Preluăm URL-ul imaginii, dacă există
        : undefined,
      user, // Adăugăm utilizatorul asociat mesajului
      member, // Adăugăm membrul asociat mesajului
      reactions: reactionsWithoutMemberIdProperty, // Adăugăm reacțiile deduplicate
    };
  },
});

// Interogare care preia mai multe mesaje, cu opțiuni de filtrare și paginare
export const get = query({
  args: {
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    parentMessageId: v.optional(v.id("messages")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx); // Obținem ID-ul utilizatorului autentificat
    if (!userId) {
      throw new Error("Unauthorized"); // Aruncăm eroare dacă utilizatorul nu este autentificat
    }

    let _conversationId = args.conversationId;
    if (!args.conversationId && !args.channelId && args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId); // Dacă nu există conversationId și channelId, obținem conversația pe baza mesajului părinte
      if (!parentMessage) {
        throw new Error("Parent message not found"); // Aruncăm eroare dacă mesajul părinte nu există
      }
      _conversationId = parentMessage.conversationId;
    }

    const results = await ctx.db
      .query("messages")
      .withIndex(
        "by_channel_id_parent_message_id_conversation_id",
        (q) =>
          q
            .eq("channelId", args.channelId) // Filtrăm după canal
            .eq("parentMessageId", args.parentMessageId) // Filtrăm după mesajul părinte
            .eq("conversationId", _conversationId) // Filtrăm după conversație
      )
      .order("desc") // Ordonați rezultatele în ordine descrescătoare
      .paginate(args.paginationOpts); // Aplicăm paginarea
    // Folosim Promise.all pentru a gestiona multiple apeluri asincrone
    return {
      ...results,
      page: (
        await Promise.all(
          results.page.map(async (message) => {
            const member = await populateMember(ctx, message.memberId); // Preluăm membrul pentru fiecare mesaj
            const user = member ? await populateUser(ctx, member.userId) : null; // Preluăm utilizatorul asociat membrului
            if (!member && !user) {
              return null; // Dacă nu există membru și utilizator, ignorăm mesajul
            }
            const reactions = await populateReactions(ctx, message._id); // Preluăm reacțiile pentru mesaj
            const thread = await populateThread(ctx, message._id); // Preluăm informațiile despre thread
            const image = message.image
              ? await ctx.storage.getUrl(message.image) // Preluăm URL-ul imaginii, dacă există
              : undefined;

            // Normalizăm reacțiile pe partea de backend pentru a fi ușor de procesat pe frontend
            const reactionsWithCounts = reactions.map((reaction) => {
              return {
                ...reaction,
                count: reactions.filter((r) => r.value === reaction.value)
                  .length, // Calculăm numărul de reacții pentru fiecare tip
              };
            });

            const dedupedReactions = reactionsWithCounts.reduce(
              (acc, reaction) => {
                const existingReaction = acc.find(
                  (r) => r.value === reaction.value
                );
                if (existingReaction) {
                  existingReaction.memberIds = Array.from(
                    new Set([...existingReaction.memberIds, reaction.memberId]) // Grupăm reacțiile pe baza valorii și eliminăm duplicatele
                  );
                } else {
                  acc.push({ ...reaction, memberIds: [reaction.memberId] });
                }
                return acc;
              },
              [] as (Doc<"reactions"> & {
                count: number;
                memberIds: Id<"members">[];
              })[] // Returnăm reacțiile deduplicate
            );

            const reactionsWithoutMemberIdProperty = dedupedReactions.map(
              ({ memberId, ...rest }) => rest
            );

            return {
              ...message,
              image,
              member,
              user,
              reactions: reactionsWithoutMemberIdProperty,
              threadCount: thread.count, // Adăugăm informații despre thread
              threadImage: thread.image,
              threadName: thread.name,
              threadTimestamp: thread.timeStamp,
            };
          })
        )
      ).filter((message) => message !== null), // Filtrăm mesajele nule
    };
  },
});

// Mutație pentru a crea un mesaj nou
export const create = mutation({
  args: {
    body: v.string(), // Textul mesajului
    image: v.optional(v.id("_storage")),
    workspaceId: v.id("workspaces"),
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    parentMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx); // Obținem ID-ul utilizatorului autentificat
    if (!userId) {
      throw new Error("Unauthorized"); // Aruncăm eroare dacă utilizatorul nu este autentificat
    }

    const member = await getMember(ctx, args.workspaceId, userId); // Verificăm dacă utilizatorul este membru al workspace-ului
    if (!member) {
      throw new Error("Unauthorized"); // Aruncăm eroare dacă utilizatorul nu este membru
    }

    let _conversationId = args.conversationId;
    if (!args.conversationId && !args.channelId && args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId); // Obținem conversația pe baza mesajului părinte
      if (!parentMessage) {
        throw new Error("Parent message not found"); // Aruncăm eroare dacă mesajul părinte nu există
      }
      _conversationId = parentMessage.conversationId;
    }

    // Creăm un mesaj nou în baza de date
    const messageId = await ctx.db.insert("messages", {
      memberId: member._id,
      body: args.body,
      image: args.image,
      channelId: args.channelId,
      conversationId: _conversationId,
      workspaceId: args.workspaceId,
      parentMessageId: args.parentMessageId,
    });
    return messageId; // Returnăm ID-ul mesajului creat
  },
});
