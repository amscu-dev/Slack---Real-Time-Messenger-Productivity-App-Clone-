import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCallback, useMemo, useState } from "react";

type ResponseType = string | null;
// În acest type Options, proprietățile onSuccess, onError și onSettled sunt funcții definite ca proprietăți opționale ale obiectului options.
// Definirea unei funcții ca proprietate într-un obiect este echivalentă cu definirea unei funcții normale și apelarea acesteia cu un argument.
type Options = {
  onSuccess?: (data: ResponseType) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
};

export const useGenerateUploadUrl = () => {
  const [data, setData] = useState<ResponseType>(null);
  const [error, setError] = useState<Error | null>(null);

  // V1:
  // const [isPending, setIsPending] = useState(false);
  // const [isSuccess, setIsSuccess] = useState(false);
  // const [isError, setIsError] = useState(false);
  // const [isSettled, setIsSettled] = useState(false);

  // V2:
  const [status, setStatus] = useState<
    "success" | "error" | "settled" | "pending" | null
  >(null);
  const isPending = useMemo(() => status === "pending", [status]);
  const isSuccess = useMemo(() => status === "success", [status]);
  const isError = useMemo(() => status === "error", [status]);
  const isSettled = useMemo(() => status === "settled", [status]);

  const mutation = useMutation(api.upload.generateUploadUrl);

  // usecallback in caz ca o vom folosi intr-un useEffect
  const mutate = useCallback(
    async (_values: {}, options?: Options) => {
      try {
        setData(null);
        setError(null);
        // V2:
        setStatus("pending");
        // V1:
        // setIsError(false);
        // setIsSettled(false);
        // setIsSuccess(false);

        // setIsPending(true);
        const response = await mutation();
        options?.onSuccess?.(response);
        return response;
      } catch (error) {
        setStatus("error");
        options?.onError?.(error as Error);
        if (options?.throwError) {
          throw error;
        }
      } finally {
        // V2:
        setStatus("settled");
        // V1:
        // setIsPending(false);
        // setIsSettled(true);
        options?.onSettled?.();
      }
    },
    [mutation]
  );
  return { mutate, data, error, isPending, isSuccess, isError, isSettled };
};
