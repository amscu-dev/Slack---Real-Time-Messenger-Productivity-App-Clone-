"use client";

import { Button } from "@/components/ui/button";
import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";
import { useJoin } from "@/features/workspaces/api/use-join";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import VerificationInput from "react-verification-input";
import { toast } from "sonner";

function JoinPage() {
  const router = useRouter();
  const workspaceId = useWorkspaceId(); // Obține ID-ul workspace-ului curent

  // Obține informațiile workspace-ului
  const { data: workspaceInfo, isLoading: workspaceInfoLoading } =
    useGetWorkspaceInfo({ id: workspaceId });

  // Hook-ul pentru alăturarea la workspace
  const { mutate, isPending } = useJoin();

  // Verifică dacă utilizatorul este deja membru al workspace-ului
  const isMember = useMemo(
    () => workspaceInfo?.isMember,
    [workspaceInfo?.isMember]
  );

  // Dacă utilizatorul este deja membru, redirecționează-l
  useEffect(() => {
    if (isMember) {
      router.replace(`/workspace/${workspaceId}`);
    }
  }, [isMember, router, workspaceId]);

  // Handle pentru completarea codului de alăturare
  const handleComplete = (value: string) => {
    mutate(
      { workspaceId, joinCode: value },
      {
        // La succes, notifică utilizatorul și navighează programatic
        onSuccess: (id) => {
          toast.success("Successfully joined.");
          router.replace(`/workspace/${id}`);
        },
        // La eroare, notifică utilizatorul
        onError: () => {
          toast.error("Failed to join workspace.");
        },
      }
    );
  };

  // Dacă informațiile workspace-ului sunt încărcate, arată loader-ul
  if (workspaceInfoLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="!size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-y-8 items-center justify-center bg-white p-8 rounded-lg shadow-md">
      {/* Logo-ul aplicației */}
      <Image src="/globe.svg" width={60} height={60} alt="Logo image" />
      {/* Titlu și descriere */}
      <div className="flex flex-col gap-y-4 items-center justify-center max-w-md">
        <div className="flex flex-col gap-y-2 items-center justify-center">
          <h1 className="text-2xl font-bold">Join {workspaceInfo?.name}</h1>
          <p className="text-md text-muted-foreground">
            Enter workspace code to join
          </p>
        </div>
        {/* Componenta de input pentru codul de verificare */}
        <VerificationInput
          classNames={{
            container: cn(
              "flex gap-x-2",
              isPending && "opacity-50 cursor-not-allowed"
            ),
            character:
              "uppercase h-auto rounded-md border border-gray-300 flex items-center justify-center text-lg font-medium text-gray-500",
            characterInactive: "bg-muted",
            characterSelected: "bg-white text-black",
            characterFilled: "bg-white text-black",
          }}
          autoFocus
          length={6}
          onComplete={handleComplete}
        />
      </div>
      {/* Buton pentru a reveni pe pagina principală */}
      <div className="flex gap-x-4">
        <Button size="lg" variant="outline" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}

export default JoinPage;
