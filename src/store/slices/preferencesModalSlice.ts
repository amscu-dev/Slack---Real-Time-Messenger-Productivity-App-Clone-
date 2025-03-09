import { createSlice } from "@reduxjs/toolkit";

type ModalState = {
  isOpen: boolean;
};

const initialState: ModalState = {
  isOpen: false,
};

export const preferencesModalSlice = createSlice({
  name: "preferencesModal",
  initialState,
  reducers: {
    onOpenPreferencesModal: (state) => {
      state.isOpen = true;
    },
    onClosePreferencesModal: (state) => {
      state.isOpen = false;
    },
    togglePreferencesModal: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const {
  onOpenPreferencesModal,
  onClosePreferencesModal,
  togglePreferencesModal,
} = preferencesModalSlice.actions;
export default preferencesModalSlice.reducer;
