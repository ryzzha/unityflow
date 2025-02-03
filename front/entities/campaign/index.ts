import { IFundraisingCampaign, FundCategory } from "./model/types";
import FundraisingCampaign from "./ui/fundraising-campaign";
import {getAllCampaigns} from "./api/get-all-campaigns";


export { FundraisingCampaign, getAllCampaigns }
export type { IFundraisingCampaign, FundCategory };