import { createSlice } from "@reduxjs/toolkit";

type ModalState = {
  isOpen: boolean;
};

const initialState: ModalState = {
  isOpen: false,
};

export const workspaceModalSlice = createSlice({
  name: "workspaceModal",
  initialState,
  reducers: {
    onOpenWorkspaceModal: (state) => {
      state.isOpen = true;
    },
    onCloseWorkspaceModal: (state) => {
      state.isOpen = false;
    },
    toggleWorkspaceModal: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const {
  onOpenWorkspaceModal,
  onCloseWorkspaceModal,
  toggleWorkspaceModal,
} = workspaceModalSlice.actions;
export default workspaceModalSlice.reducer;
