"use client"; // Only works in client components

import { useQueryState } from "nuqs";

export const useProfileMemberId = () => {
  return useQueryState("profileMemberId");
};
