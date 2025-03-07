import { configureStore } from "@reduxjs/toolkit";
// commandSlice.reducer il redenumim in:
// import commandReducer from "./slices/commandSlice";
import workspaceModalReducer from "@/store/slices/workspaceModalSlice";
export const store = configureStore({
  reducer: {
    // command: commandReducer,
    workspaceModal: workspaceModalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
