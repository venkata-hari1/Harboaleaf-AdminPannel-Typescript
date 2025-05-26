import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { baseURL, endpoints } from "../../../Utils/Config";
import networkCall from "../../../Utils/NetworkCalls";
const initialState = {
  loading: false,
  data:[]
}

export const SignIn = createAsyncThunk(
  "auth/signin",
  async (payload: { data }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const {data}=payload
      console.log(data)
      const response = await fetch(`${baseURL}/${endpoints.SIGNIN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("token", result.token);
        return fulfillWithValue(result);
      } else {
        return rejectWithValue(result);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);
export const Auth_Slice = createSlice({
  name: "AuthSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {}
})
export default Auth_Slice.reducer