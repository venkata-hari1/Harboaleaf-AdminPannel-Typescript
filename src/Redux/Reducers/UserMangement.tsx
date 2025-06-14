import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import networkCall from "../../../Utils/NetworkCalls";
import { baseURL, endpoints } from "../../../Utils/Config";

const initialState:any = {
  loading: false,
  data: [],
  reports: [],
  subscription: [],
  socialUser: null, // New state for social media user data
  socialUserLoading: false, // Loading state for social media user
  socialUserError: null, // Error state for social media user
};

// Existing thunks (Users, Subscription, UserReports, UserSuspended) remain unchanged
export const Users = createAsyncThunk(
  "Users",
  async (payload: { data: { page: number | string, sort: string, filter: string } }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = payload;
      const { response, error } = await networkCall(
        `${endpoints.USERS}?page=${data.page}&sort=${data.sort}&state=&accountStatus=${data.filter}`,
        "GET"
      );
      if (response) {
        return fulfillWithValue(response);
      } else if (error) {
        return rejectWithValue(error);
      }
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const Subscription = createAsyncThunk(
  "Subscription",
  async (payload: { data: { type: string, currentPage: number } }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = payload;
      const { response, error } = await networkCall(
        `${endpoints.subscription}?page=${data.currentPage}&accountType=${data.type}`,
        "GET"
      );
      if (response) {
        return fulfillWithValue(response);
      } else if (error) {
        return rejectWithValue(error);
      }
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const UserReports = createAsyncThunk(
  "UserReports",
  async (payload: { data: { page: number | string, sort: string, filter: string } }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const {data}=payload
      const { response, error } = await networkCall(
        `${endpoints.REPORTS}?page=${data.page}sortField=type&sortOrder=${data.sort}`,
        "GET"
      );
      if (response) {
        return fulfillWithValue(response);
      } else if (error) {
        return rejectWithValue(error);
      }
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const UserSuspended = createAsyncThunk(
  'user/UserSuspended',
  async (payload: { data: { id: string, temSuspended: boolean, suspended: boolean } }, { fulfillWithValue, rejectWithValue, dispatch }) => {
    try {
      const { response, error } = await networkCall(
        endpoints.Suspended,
        'PATCH',
        JSON.stringify(payload.data)
      );
      if (response) {
        const data = {
          page: localStorage.getItem('page') || 1,
          sort: 'desc',
          filter: ''
        };
        dispatch(Users({ data: data }));
        return fulfillWithValue(response);
      }
      return rejectWithValue(error);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// New thunk for fetching social media user data
export const fetchSocialUser = createAsyncThunk(
  "fetchSocialUser",
  async (userId: string | '', { fulfillWithValue, rejectWithValue }) => {
    try {
      const { response, error } = await networkCall(
        `${baseURL}/api/socialmedia/user?userid=${userId}&type=`,
        "GET"
      );
      if (response) {
        return fulfillWithValue(response);
      } else if (error) {
        return rejectWithValue(error);
      }
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const UserManagement_Slice = createSlice({
  name: "UserManagementSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Existing cases for Users, Subscription, UserReports
    builder.addCase(Users.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(Users.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = false;
    });
    builder.addCase(Users.rejected, (state) => {
      state.loading = false; // Fixed: Set loading to false on rejection
    });
    builder.addCase(UserReports.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(UserReports.fulfilled, (state, action) => {
      state.reports = action.payload;
      state.loading = false;
    });
    builder.addCase(UserReports.rejected, (state) => {
      state.loading = false; // Fixed: Set loading to false on rejection
    });
    builder.addCase(Subscription.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(Subscription.fulfilled, (state, action) => {
      state.subscription = action.payload;
      state.loading = false;
    });
    builder.addCase(Subscription.rejected, (state) => {
      state.loading = false; // Fixed: Set loading to false on rejection
    });

    // New cases for fetchSocialUser
    builder.addCase(fetchSocialUser.pending, (state) => {
      state.socialUserLoading = true;
      state.socialUserError = null;
    });
    builder.addCase(fetchSocialUser.fulfilled, (state, action) => {
      state.socialUser = action.payload;
      state.socialUserLoading = false;
    });
    builder.addCase(fetchSocialUser.rejected, (state, action) => {
      state.socialUserLoading = false;
      state.socialUserError = action.payload || 'Failed to fetch social user data';
    });
  },
});

export default UserManagement_Slice.reducer;