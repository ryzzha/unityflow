import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ICompany } from "./types";

interface CompaniesState {
  companies: ICompany[];
}

const initialState: CompaniesState = {
  companies: [],
};

const companySlice = createSlice({
  name: "companies",
  initialState,
  reducers: {
    setCompanies: (state, action: PayloadAction<ICompany[]>) => {
      state.companies = action.payload;
    },
    addCompany: (state, action: PayloadAction<ICompany>) => {
      state.companies.push(action.payload);
    },
  },
});

export const { setCompanies, addCompany } = companySlice.actions;
export default companySlice.reducer;
