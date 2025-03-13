import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

// Definirea schemei bazei de date Convex
const schema = defineSchema({
  // Include tabelele de autentificare predefinite de Convex
  ...authTables,

  // Tabel pentru spațiile de lucru
  workspaces: defineTable({
    name: v.string(), // Numele workspace-ului
    userId: v.id("users"), // ID-ul utilizatorului care a creat workspace-ul
    joinCode: v.string(), // Codul de alăturare pentru workspace
  }),

  // Tabel pentru membri unui workspace
  members: defineTable({
    userId: v.id("users"), // ID-ul utilizatorului
    workspaceId: v.id("workspaces"), // ID-ul workspace-ului din care face parte
    role: v.union(v.literal("admin"), v.literal("member")), // Rolul utilizatorului în workspace
  })
    // Indexuri pentru optimizarea interogărilor
    .index("by_user_id", ["userId"])
    .index("by_workspace_id", ["workspaceId"])
    .index("by_workspace_id_user_id", ["workspaceId", "userId"]),

  // Tabel pentru canale de comunicare într-un workspace
  channels: defineTable({
    name: v.string(), // Numele canalului
    workspaceId: v.id("workspaces"), // ID-ul workspace-ului
  }).index("by_workspace_id", ["workspaceId"]),

  // Tabel pentru conversații private între doi membri
  conversations: defineTable({
    workspaceId: v.id("workspaces"), // ID-ul workspace-ului
    memberOneId: v.id("members"), // ID-ul primului membru
    memberTwoId: v.id("members"), // ID-ul celui de-al doilea membru
  }).index("by_workspace_id", ["workspaceId"]),

  // Tabel pentru mesaje
  messages: defineTable({
    body: v.string(), // Conținutul mesajului
    image: v.optional(v.id("_storage")), // Opțional, ID-ul imaginii atașate
    memberId: v.id("members"), // ID-ul utilizatorului care a trimis mesajul
    workspaceId: v.id("workspaces"), // ID-ul workspace-ului
    channelId: v.optional(v.id("channels")), // ID-ul canalului (dacă este un mesaj dintr-un canal)
    parentMessageId: v.optional(v.id("messages")), // ID-ul mesajului părinte (pentru thread-uri)
    updatedAt: v.optional(v.number()), // Timestamp pentru actualizări
    conversationId: v.optional(v.id("conversations")), // ID-ul conversației (pentru mesaje directe)
  })
    // Indexuri pentru optimizarea interogărilor
    .index("by_workspace_id", ["workspaceId"])
    .index("by_member_id", ["memberId"])
    .index("by_channel_id", ["channelId"])
    .index("by_conversation_id", ["conversationId"])
    .index("by_parent_message_id", ["parentMessageId"])
    .index("by_channel_id_parent_message_id_conversation_id", [
      "channelId",
      "parentMessageId",
      "conversationId",
    ]),

  // Tabel pentru reacții la mesaje
  reactions: defineTable({
    workspaceId: v.id("workspaces"), // ID-ul workspace-ului
    messageId: v.id("messages"), // ID-ul mesajului la care se adaugă reacția
    memberId: v.id("members"), // ID-ul utilizatorului care reacționează
    value: v.string(), // Valoarea reacției (emoji, text, etc.)
  })
    // Indexuri pentru interogări rapide
    .index("by_workspace_id", ["workspaceId"])
    .index("by_message_id", ["messageId"])
    .index("by_member_id", ["memberId"]),
});

export default schema;
