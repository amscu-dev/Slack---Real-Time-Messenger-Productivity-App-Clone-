import { createSlice } from "@reduxjs/toolkit";

type ModalState = {
  isOpen: boolean;
};

const initialState: ModalState = {
  isOpen: false,
};

export const channelModalSlice = createSlice({
  name: "channelModal",
  initialState,
  reducers: {
    onOpenChannelModal: (state) => {
      state.isOpen = true;
    },
    onCloseChannelModal: (state) => {
      state.isOpen = false;
    },
    toggleChannelModal: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { onOpenChannelModal, onCloseChannelModal, toggleChannelModal } =
  channelModalSlice.actions;
export default channelModalSlice.reducer;
