// Importăm funcțiile necesare din librăria React-Redux pentru a accesa store-ul Redux
import { useDispatch, useSelector } from "react-redux";
// Importăm tipurile pentru a asigura tipizarea corectă în aplicațiile TypeScript
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";

// Creăm o variantă tipizată a funcției `useDispatch` pentru a utiliza corect tipul `AppDispatch`
// Acesta va fi folosit pentru a trimite acțiuni către Redux store
export const useAppDispatch: () => AppDispatch = useDispatch;

// Creăm o variantă tipizată a funcției `useSelector` pentru a utiliza corect tipul `RootState`
// Acesta va fi folosit pentru a obține starea din Redux store
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
