// Redux/Reducers/UserMangement.ts

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { endpoints, baseURL } from "../../../Utils/Config";
import { useLocation } from "react-router-dom";

// --- Initial State ---
const initialState = {
  loading: false,
  error: null as string | null,
  data: {},
  reports: [],
  subscription: [],
  monitorCampaigns: {},
  socialUser: null, // New state for social media user data
  socialUserLoading: false, // Loading state for social media user
  socialUserError: null, // Error state for social media user
  GSTUsers: [],
  GSTUserReports: [],
  dashboard: [],
  profile: {},
  emergency: [],
  victiminfo:{},
  budget:''
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
      error: { status: 0, message: err.message || "Network error" },
    };
  }
};

// --- Async Thunks ---

export const Users = createAsyncThunk(
  "Users",
  async (
    payload: { data: { page: number | string; sort: string; filter: string, state } },
    { fulfillWithValue, rejectWithValue }
  ) => {
    try {
      const { page, sort, filter, state } = payload.data;
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${baseURL}api/admin/users?page=${page}&sort=${sort}&state=${state}&accountStatus=${filter}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': `${token}`,
        },
      }
      );

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error);
      }

      const data = await response.json();
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue({ message: error.message || "Something went wrong" });
    }
  }
);

export const Subscription = createAsyncThunk(
  "Subscription",
  async (
    payload: { data: { filter: string; page: number; state: string } },
    { fulfillWithValue, rejectWithValue }
  ) => {
    try {
      const { data } = payload;
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${baseURL}${endpoints.subscription}?page=${data.page}&accountType=${data.filter}&state=${data.state}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'token': `${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result);
      }

      return fulfillWithValue(result);
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'Failed to fetch subscriptions' });
    }
  }
);
export const UserReports = createAsyncThunk(
  "UserReports",
  async (
    payload: { data: { page: number | string; sort: string; filter: string, state: string } },
    { fulfillWithValue, rejectWithValue }
  ) => {
    try {
      const { data } = payload;
      const response = await fetch(
        `${baseURL}${endpoints.REPORTS}?page=${data.page}&sortField=type&sortOrder=${data.sort}&state=${data.state}&accountStatus=${data.filter}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            token: localStorage.getItem('token') || ''
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result);
      }

      return fulfillWithValue(result);
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'Failed to fetch user reports' });
    }
  }
);

export const UserSuspended = createAsyncThunk(
  'user/UserSuspended',
  async (
    payload: { data: { id: string; temSuspended: boolean; suspended: boolean, location: string } },
    { fulfillWithValue, rejectWithValue, dispatch }
  ) => {
    try {
      const { data } = payload
      const response = await fetch(`${baseURL}${endpoints.Suspended}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.getItem('token') || ''

        },
        body: JSON.stringify(payload.data)
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result);
      }

      // Re-fetch updated user list after suspension change
      const page = localStorage.getItem('page') || 1;
      const sort = localStorage.getItem('sort') || 'desc'
      const filter = localStorage.getItem('filter') || ''
      if (data.location === '/admin/user-reports') {
        dispatch(
          UserReports({
            data: {
              state: '',
              page,
              sort,
              filter,
            }
          })
        );
      }
      else if (data.location === '/admin/gst-reports') {
        dispatch(
          GST_User_Reports({
            data: {
              page,
              sort,
              filter,
              state: ''
            }
          })
        );
      }
      else {
        dispatch(
          Users({
            data: {
              state: '',
              page,
              sort,
              filter
            }
          })
        );
      }

      return fulfillWithValue(result);
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'Suspension failed' });
    }
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

export const fetchSocialUser = createAsyncThunk(
  "fetchSocialUser",
  async (userId: string | '', { fulfillWithValue, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token') || '';


      const response = await fetch(
        `${baseURL}api/socialmedia/user?userid=${userId}&type=`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'token': `${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result);
      }

      return fulfillWithValue(result);
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'Failed to fetch user' });
    }
  }
);
// --- Slice ---
export const GSTUSERS = createAsyncThunk(
  "GSTUSERS",
  async (
    payload: { data: { page: number | string; sort: string; state: string } },
    { fulfillWithValue, rejectWithValue }
  ) => {
    try {
      const { data } = payload;
      const response = await fetch(
        `${baseURL}${endpoints.gstusers}?page=${data.page}&limit=5&sortOrder=${data.sort}&state=${data.state}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            token: localStorage.getItem('token') || ''
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result);
      }

      return fulfillWithValue(result);
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'Failed to fetch user reports' });
    }
  }
);

//GST User Reports
export const GST_User_Reports = createAsyncThunk(
  "GST_User_Reports",
  async (
    payload: { data: { page: number | string; sort: string; filter: string, state: string } },
    { fulfillWithValue, rejectWithValue }
  ) => {
    try {
      const { data } = payload;
      const response = await fetch(
        `${baseURL}${endpoints.gstUserReports}?page=${data.page}&sortOrder=${data.sort}&search=&accountStatus=${data.filter}&state=${data.state}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            token: localStorage.getItem('token') || ''
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result);
      }

      return fulfillWithValue(result);
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'Failed to fetch user reports' });
    }
  }
);
//Admin Profile
export const AdminProfile = createAsyncThunk(
  'AdminProfile',
  async (
    __,
    { fulfillWithValue, rejectWithValue, dispatch }
  ) => {
    try {
      const response = await fetch(`${baseURL}${endpoints.adminprofile}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.getItem('token') || ''

        },
      });
      const result = await response.json();
      if (!response.ok) {
        return rejectWithValue(result);
      }
      return fulfillWithValue(result);
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'Suspension failed' });
    }
  }
);
//Admin Dashboard
export const Admin_Dashboard = createAsyncThunk(
  "Admin_Dashboard",
  async (
    payload: { data: { year: number | string } },
    { fulfillWithValue, rejectWithValue }
  ) => {
    try {
      const { data } = payload;
      const response = await fetch(
        `${baseURL}${endpoints.dashboard}?year=${data.year}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            token: localStorage.getItem('token') || ''
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result);
      }

      return fulfillWithValue(result);
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'Failed to fetch user reports' });
    }
  }
);
export const AdminUpdateProfile = createAsyncThunk(
  'AdminUpdateProfile',
  async (
    payload: { data: { firstname: string; mobile: string } },
    { fulfillWithValue, rejectWithValue, dispatch }
  ) => {
    try {
      const { data } = payload
      const response = await fetch(`${baseURL}${endpoints.updateProfile}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.getItem('token') || ''

        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response) {
        dispatch(AdminProfile())
      }
      return fulfillWithValue(result);
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'Suspension failed' });
    }
  }
);
export const AdminUploadProfileImage = createAsyncThunk(
  'AdminUploadProfileImage',
  async (
    formData: FormData,
    { fulfillWithValue, rejectWithValue, dispatch }
  ) => {
    try {
      const response = await fetch(`${baseURL}${endpoints.uploadImage}`, {
        method: 'PATCH',
        headers: {
          token: localStorage.getItem('token') || ''
        },
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        dispatch(AdminProfile());
        return fulfillWithValue(result);
      } else {
        return rejectWithValue(result);
      }
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'Upload failed' });
    }
  }
);

export const DeletePostReel = createAsyncThunk(
  'DeletePostReel',
  async (
    payload: { data: { id: string | number } },
    { fulfillWithValue, rejectWithValue, dispatch }
  ) => {
    try {
      const { data } = payload
      const response = await fetch(`${baseURL}${endpoints.deletePost_Reel}/${data.id}`, {
        method: 'DELETE',
        headers: {
          token: localStorage.getItem('token') || ''
        },

      });
      const page = localStorage.getItem('page') || 1;
      const sort = localStorage.getItem('sort') || 'desc';
      const filter = localStorage.getItem('filter') || ''
      const result = await response.json();
      if (response.ok) {
        dispatch(
          UserReports({
            data: {
              state: '',
              page,
              sort,
              filter,
            }
          })
        );
        return fulfillWithValue(result);
      } else {
        return rejectWithValue(result);
      }
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'Upload failed' });
    }
  }
);

export const Emergency_Management = createAsyncThunk(
  'Emergency_Management',
  async (
    payload: { data: { page: string | number, state: string ,sort:string} },
    { fulfillWithValue, rejectWithValue, dispatch }
  ) => {
    try {
      const { data } = payload
      const response = await fetch(`${baseURL}${endpoints.emergency_management}?page=${data.page}&state=${data.state}&sort=${data.sort}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.getItem('token') || ''

        },
      });

      const result = await response.json();

      if (response) {
        dispatch(AdminProfile())
      }
      return fulfillWithValue(result);
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'Suspension failed' });
    }
  }
);

export const Victim_Info = createAsyncThunk(
  'Victim_Info',
  async (
    payload: { data: { id:string} },
    { fulfillWithValue, rejectWithValue, dispatch }
  ) => {
    try {
      const { data } = payload
      const response = await fetch(`${baseURL}${endpoints.victim_info}/${data.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.getItem('token') || ''

        },
      });

      const result = await response.json();

      if (response) {
        dispatch(AdminProfile())
      }
      return fulfillWithValue(result);
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'Suspension failed' });
    }
  }
);
const UserMangement_Slice = createSlice({
  name: "UserMangementSlice",
  initialState,
  reducers: {
    setBudget:(state,action)=>{
      state.budget=action.payload
    }
  },
  extraReducers: (builder) => {
    // Users
    builder
      .addCase(Users.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(Users.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(Users.rejected, (state, action) => {
        state.loading = false;
        state.data = {};
        state.error = action.payload as string;
      });

    // User Reports
    builder
      .addCase(UserReports.pending, (state) => {
        state.loading = true;
      })
      .addCase(UserReports.fulfilled, (state, action) => {
        state.reports = action.payload;
        state.loading = false;
      })
      .addCase(UserReports.rejected, (state) => {
        state.loading = false;
      });

    // Subscription
    builder
      .addCase(Subscription.pending, (state) => {
        state.loading = true;
      })
      .addCase(Subscription.fulfilled, (state, action) => {
        state.subscription = action.payload;
        state.loading = false;
      })
      .addCase(Subscription.rejected, (state) => {
        state.loading = false;
      });

    // User Suspended
    builder
      .addCase(UserSuspended.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(UserSuspended.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(UserSuspended.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Ad Campaign
    builder
      .addCase(createAdCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdCampaign.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createAdCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Monitor Campaigns
    builder
      .addCase(MonitorCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(MonitorCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.monitorCampaigns = action.payload;
        state.error = null;
      })
      .addCase(MonitorCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.monitorCampaigns = {};
      });

    // Fetch Social User
    builder
      .addCase(fetchSocialUser.pending, (state) => {
        state.socialUserLoading = true;
        state.socialUserError = null;
      })
      .addCase(fetchSocialUser.fulfilled, (state, action) => {
        state.socialUser = action.payload;
        state.socialUserLoading = false;
      })
      .addCase(fetchSocialUser.rejected, (state, action) => {
        state.socialUserLoading = false;
      });

    // GST Users
    builder
      .addCase(GSTUSERS.pending, (state) => {
        state.loading = true
      })
      .addCase(GSTUSERS.fulfilled, (state, action) => {
        state.GSTUsers = action.payload;
        state.loading = false;
      })
      .addCase(GSTUSERS.rejected, (state, action) => {
        state.loading = false;

      });
    // GST Users Reports
    builder
      .addCase(GST_User_Reports.pending, (state) => {
        state.loading = true
      })
      .addCase(GST_User_Reports.fulfilled, (state, action) => {
        state.GSTUserReports = action.payload;
        state.loading = false;
      })
      .addCase(GST_User_Reports.rejected, (state, action) => {
        state.loading = false;

      });
    //Admin Dashboard
    builder
      .addCase(Admin_Dashboard.pending, (state) => {
        state.loading = true
      })
      .addCase(Admin_Dashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload;
        state.loading = false;
      })
      .addCase(Admin_Dashboard.rejected, (state, action) => {
        state.loading = false;

      });
    //Admin Profile
    builder
      .addCase(AdminProfile.pending, (state) => {
        state.loading = true
      })
      .addCase(AdminProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(AdminProfile.rejected, (state, action) => {
        state.loading = false;
      });
    //Emergency Management
    builder
      .addCase(Emergency_Management.pending, (state) => {
        state.loading = true
      })
      .addCase(Emergency_Management.fulfilled, (state, action) => {
        state.emergency = action.payload;
        state.loading = false;
      })
      .addCase(Emergency_Management.rejected, (state, action) => {
        state.loading = false;

      });

      builder
      .addCase(Victim_Info.pending, (state) => {
        state.loading = true
      })
      .addCase(Victim_Info.fulfilled, (state, action) => {
        state.victiminfo = action.payload;
        state.loading = false;
      })
      .addCase(Victim_Info.rejected, (state, action) => {
        state.loading = false;

      });
  },
});

export const {setBudget}=UserMangement_Slice.actions
export default UserMangement_Slice.reducer;
