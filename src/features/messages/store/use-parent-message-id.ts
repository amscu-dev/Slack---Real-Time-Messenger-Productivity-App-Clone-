"use client"; // Only works in client components

import { useQueryState } from "nuqs";

export const useParentMessageId = () => {
  return useQueryState("parentMessageId");
};
