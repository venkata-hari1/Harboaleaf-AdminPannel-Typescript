// Redux/Reducers/UserMangement.ts

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { endpoints, baseURL } from "../../../Utils/Config";

// --- Initial State ---
const initialState = {
  loading: false,
  error: null as string | null,
  data: {},
  reports: {},
  subscription: {},
  monitorCampaigns: {},
};

// --- Common Fetch Handler ---
interface FetchResult<T = any, E = any> {
  response: T | null;
  error: {
    status?: number;
    message: string;
    data?: E;
  } | null;
}

const executeFetch = async <T = any, E = any>(
  fullUrl: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: FormData | object | string,
): Promise<FetchResult<T, E>> => {
  const headers: HeadersInit = { 'Accept': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['token'] = token;

  const options: RequestInit = { method, headers };

  if (body) {
    if (body instanceof FormData) {
      options.body = body;
    } else if (typeof body === 'object') {
      options.body = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
    } else {
      options.body = body;
      headers['Content-Type'] = 'text/plain';
    }
  } else if (['POST', 'PUT', 'PATCH'].includes(method)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(fullUrl, options);
    const data = await res.json().catch(() => ({ message: res.statusText }));
    if (!res.ok) {
      return {
        response: null,
        error: { status: res.status, message: data.message || `Error ${res.status}`, data },
      };
    }
    return { response: data, error: null };
  } catch (err: any) {
    return {
      response: null,
      error: { status: 0, message: err.message || "Network error", data: null },
    };
  }
};

// --- Async Thunks ---

export const Users = createAsyncThunk(
  "Users",
  async (page: string | number, { fulfillWithValue, rejectWithValue }) => {
    const { response, error } = await executeFetch(
      `${baseURL}${endpoints.USERS}?page=${page}&sort=&state=&accountStatus=`, "GET"
    );
    return response ? fulfillWithValue(response) : rejectWithValue(error?.message || "Failed to fetch users.");
  }
);

export const Subscription = createAsyncThunk(
  "Subscription",
  async (
    { page, limit, accountType }: { page: number; limit: number; accountType: string | null },
    { fulfillWithValue, rejectWithValue }
  ) => {
    const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (accountType) queryParams.append('accountType', accountType);

    const { response, error } = await executeFetch(
      `${baseURL}${endpoints.subscription}?${queryParams.toString()}`, "GET"
    );
    return response ? fulfillWithValue(response) : rejectWithValue(error?.message || "Failed to fetch subscriptions.");
  }
);

export const UserReports = createAsyncThunk(
  "UserReports",
  async (page: string | number, { fulfillWithValue, rejectWithValue }) => {
    const { response, error } = await executeFetch(
      `${baseURL}${endpoints.REPORTS}?page=${page}`, "GET"
    );
    return response ? fulfillWithValue(response) : rejectWithValue(error?.message || "Failed to fetch reports.");
  }
);

export const UserSuspended = createAsyncThunk(
  'user/UserSuspended',
  async (suspensionData: { id: string; temSuspended?: boolean; suspended?: boolean }, { fulfillWithValue, rejectWithValue, dispatch }) => {
    const { response, error } = await executeFetch(
      `${baseURL}${endpoints.Suspended}`, 'PATCH', suspensionData
    );
    if (response) {
      dispatch(Users(1)); // Refresh user list
      return fulfillWithValue(response);
    }
    return rejectWithValue(error?.message || "Failed to suspend user.");
  }
);

export const createAdCampaign = createAsyncThunk(
  "adCampaign/create",
  async (formData: FormData, { fulfillWithValue, rejectWithValue }) => {
    const { response, error } = await executeFetch(
      `${baseURL}${endpoints.advertisement}`, "POST", formData
    );
    return response ? fulfillWithValue(response) : rejectWithValue(error?.message || "Failed to create ad campaign.");
  }
);

export const MonitorCampaigns = createAsyncThunk(
  "monitor/campaigns",
  async ({ page, limit }: { page: number; limit: number }, { fulfillWithValue, rejectWithValue }) => {
    const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const { response, error } = await executeFetch(
      `${baseURL}${endpoints.moniteradvertisement}?${queryParams.toString()}`, "GET"
    );
    return response ? fulfillWithValue(response) : rejectWithValue(error?.message || "Failed to fetch campaigns.");
  }
);

// --- Slice ---

const UserMangement_Slice = createSlice({
  name: "UserMangementSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Users
      .addCase(Users.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(Users.fulfilled, (state, action) => {
        state.loading = false; state.data = action.payload; state.error = null;
      })
      .addCase(Users.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string; state.data = {};
      })

      // UserReports
      .addCase(UserReports.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(UserReports.fulfilled, (state, action) => {
        state.loading = false; state.reports = action.payload; state.error = null;
      })
      .addCase(UserReports.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string; state.reports = {};
      })

      // Subscription
      .addCase(Subscription.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(Subscription.fulfilled, (state, action) => {
        state.loading = false; state.subscription = action.payload; state.error = null;
      })
      .addCase(Subscription.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string; state.subscription = {};
      })

      // UserSuspended
      .addCase(UserSuspended.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(UserSuspended.fulfilled, (state) => {
        state.loading = false; state.error = null;
      })
      .addCase(UserSuspended.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })

      // Create Ad Campaign
      .addCase(createAdCampaign.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createAdCampaign.fulfilled, (state) => {
        state.loading = false; state.error = null;
      })
      .addCase(createAdCampaign.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })

      // Monitor Campaigns
      .addCase(MonitorCampaigns.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(MonitorCampaigns.fulfilled, (state, action) => {
        state.loading = false; state.monitorCampaigns = action.payload; state.error = null;
      })
      .addCase(MonitorCampaigns.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string; state.monitorCampaigns = {};
      });
  },
});

export default UserMangement_Slice.reducer;
