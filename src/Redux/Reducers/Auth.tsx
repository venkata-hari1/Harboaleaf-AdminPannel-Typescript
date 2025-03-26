import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { endpoints } from "../../../Utils/Config";
import networkCall from "../../../Utils/NetworkCalls";
const initialState = {
  loading: false,
  data:[]
}

export const SignIn = createAsyncThunk(
    "SignIn",
    async (payload: { data: Object }, { fulfillWithValue, rejectWithValue }) => {
      try {
        const { data } = payload;
        const { response, error } = await networkCall(
          endpoints.SIGNIN,
          "POST",
          JSON.stringify(data)
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
export const Auth_Slice = createSlice({
  name: "AuthSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {}
})
export default Auth_Slice.reducer