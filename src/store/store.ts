import { configureStore } from "@reduxjs/toolkit";
// commandSlice.reducer il redenumim in:
// import commandReducer from "./slices/commandSlice";
import workspaceModalReducer from "@/store/slices/workspaceModalSlice";
import preferencesModalReducer from "@/store/slices/preferencesModalSlice";
export const store = configureStore({
  reducer: {
    // command: commandReducer,
    workspaceModal: workspaceModalReducer,
    preferencesModal: preferencesModalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
