"use client";

import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks/redux-store-hooks";
import { onOpenWorkspaceModal } from "@/store/slices/workspaceModalSlice";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function Home() {
  const router = useRouter();
  const { isOpen } = useAppSelector((state) => state.workspaceModal);
  const dispatch = useAppDispatch(); // Inițializează dispatch-ul pentru Redux
  const { data, isLoading } = useGetWorkspaces(); // Obține workspace-urile și starea de încărcare
  const workspaceId = useMemo(() => data?.[0]?._id, [data]); // Memorizează ID-ul primului workspace disponibil

  // Dacă workspace-ul este încărcat și există, redirecționează către detaliile workspace-ului
  // Dacă nu există niciun workspace și modalul nu este deschis, deschide-l
  useEffect(() => {
    if (isLoading) return; // Dacă datele sunt încă încărcate, nu face nimic
    if (workspaceId) {
      router.replace(`/workspace/${workspaceId}`); // Redirecționează către workspace-ul selectat
    } else if (!isOpen) {
      dispatch(onOpenWorkspaceModal()); // Deschide modalul dacă nu există workspace-uri și modalul nu este deschis
    }
  }, [workspaceId, isLoading, isOpen, dispatch, router]);

  // Dacă informațiile utilizatorului sunt încărcate, arată loader-ul
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-customBgNav">
        <Loader className="!size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="h-full flex items-center justify-center bg-customBgNav"></div>
  );
}
