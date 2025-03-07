import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
// Deprecated :
// import { auth } from "./auth";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    // Deprecated:
    // const userId = await auth.gerUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});
