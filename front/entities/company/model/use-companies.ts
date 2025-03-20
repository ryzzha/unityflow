import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/shared/store";
import { setCompanies, addCompany } from "./company-slice";

export const useCompanies = () => {
  const dispatch = useDispatch<AppDispatch>();
  const companies = useSelector((state: RootState) => state.companies);

  const setAllCompanies = (data: any[]) => dispatch(setCompanies(data));
  const addNewCompany = (company: any) => dispatch(addCompany(company));

  return { companies, setAllCompanies, addNewCompany };
};
