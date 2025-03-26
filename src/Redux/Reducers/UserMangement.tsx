import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import networkCall from "../../../Utils/NetworkCalls";
import { endpoints } from "../../../Utils/Config";
const initialState = {
  loading: false,
  data:[]
}

export const Users = createAsyncThunk(
  "Users",
  async (page: string | number, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { response, error } = await networkCall(
        `${endpoints.USERS}?page=${page}`,
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
export const UserMangement_Slice = createSlice({
  name: "UserMangementSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(Users.pending, (state, action) => {
      state.loading = true
    })
    builder.addCase(Users.fulfilled, (state, action) => {
      state.data = action.payload
      state.loading = false
    })
    builder.addCase(Users.rejected, (state, action) => {
      state.loading = true
    })
  
  }
})
export default UserMangement_Slice.reducer