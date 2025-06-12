import { createSlice } from '@reduxjs/toolkit';
import { fetchSubscriptions } from './SubscriptionThunk';

const initialState = {
  data: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  filterType: '',
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setFilterType: (state, action) => {
      state.filterType = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.subscriptions || [];
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setPage, setFilterType } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
