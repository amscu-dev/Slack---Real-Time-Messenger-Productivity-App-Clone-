import { configureStore } from "@reduxjs/toolkit";
// commandSlice.reducer il redenumim in:
// import commandReducer from "./slices/commandSlice";
import workspaceModalReducer from "@/store/slices/workspaceModalSlice";
import preferencesModalReducer from "@/store/slices/preferencesModalSlice";
import channelModalReducer from "@/store/slices/channelModalSlice";
import inviteModalReducer from "@/store/slices/inviteModalSlice";
export const store = configureStore({
  reducer: {
    workspaceModal: workspaceModalReducer,
    preferencesModal: preferencesModalReducer,
    channelModal: channelModalReducer,
    inviteModal: inviteModalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
