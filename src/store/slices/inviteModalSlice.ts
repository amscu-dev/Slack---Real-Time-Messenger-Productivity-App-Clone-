import { createSlice } from "@reduxjs/toolkit";

type ModalState = {
  isOpen: boolean;
};

const initialState: ModalState = {
  isOpen: false,
};

export const inviteModalSlice = createSlice({
  name: "inviteModal",
  initialState,
  reducers: {
    onOpenInviteModal: (state) => {
      state.isOpen = true;
    },
    onCloseInviteModal: (state) => {
      state.isOpen = false;
    },
    toggleInviteModal: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { onOpenInviteModal, onCloseInviteModal, toggleInviteModal } =
  inviteModalSlice.actions;
export default inviteModalSlice.reducer;
