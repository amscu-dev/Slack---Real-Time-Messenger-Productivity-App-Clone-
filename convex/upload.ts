import { mutation } from "./_generated/server";

// Mutație pentru generarea unui URL de încărcare
export const generateUploadUrl = mutation(async (ctx) => {
  // Generează și returnează un URL temporar pentru încărcarea fișierelor
  return await ctx.storage.generateUploadUrl(); // Apel la metoda `generateUploadUrl` din serviciul de stocare
});
