import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../Utils/SubscriptionAPI';

interface FetchParams {
  page: number;
  accountType?: string; // make optional
}

export const fetchSubscriptions = createAsyncThunk(
  'subscription/fetchSubscriptions',
  async ({ page, accountType }: FetchParams) => {
    const url = accountType
      ? `/admin/subscription?page=${page}&accountType=${accountType}`
      : `/admin/subscription?page=${page}`; // exclude accountType if blank

    const response = await axiosInstance.get(url);
    return response.data;
  }
);
