import React from 'react';
import { ethers, formatEther } from "ethers";
import { IFundraisingCampaign } from '@/shared/interfaces';
import { daysLeft } from '@/utils';
import CategoryIcon from '../../../components/icons/category-icon';
import { unityFlowUser } from '@/assets';
import Image from 'next/image';

const FundraisingCampaign = ({ campaign }: { campaign: IFundraisingCampaign }) => {
  const { organizer, title, description, category, goalAmount, collected, deadline, image } = campaign;
  const remainingDays = daysLeft(deadline);

  return (
    <div 
      className="sm:max-w-[320px] p-3 w-full rounded-[15px] bg-[#FFFCE7] bg-opacity-25 shadow-md hover:shadow-lg transition-shadow cursor-pointer" 
      onClick={() => {}}
    >
      <img 
        src={image} 
        alt="fund" 
        className="w-full h-[158px] object-cover rounded-[15px]"
      />

      <div className="flex flex-col">
        <div className="flex flex-row items-center my-[8px]">
         <CategoryIcon />
          <p className="ml-[7px] mt-[2px] font-epilogue font-medium text-[12px] text-[#6b7280]">
            {category}
          </p>
        </div>

        <div>
          <h3 className="font-epilogue font-semibold text-[16px] leading-[26px] truncate">
            {title}
          </h3>
          <p className="mt-[5px] font-epilogue font-normal text-sm text-[#6b7280] leading-[18px] truncate">
            {description}
          </p>
        </div>

        <div className="flex justify-between flex-wrap mt-[15px] gap-2">
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#374151] leading-[22px]">
              {formatEther(collected.toString())}
            </h4>
            <p className="mt-[2px] font-epilogue font-normal text-[12px] text-[#6b7280] leading-[18px] truncate">
              Raised of {formatEther(goalAmount.toString())}
            </p>
          </div>
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#374151] leading-[22px]">
              {remainingDays}
            </h4>
            <p className="mt-[2px] font-epilogue font-normal text-[12px] text-[#6b7280] leading-[18px] truncate">
              Days Left
            </p>
          </div>
        </div>

        <div className="flex items-center mt-[20px] gap-[12px]">
          <div className=" rounded-full flex justify-center items-center bg-[#e5e7eb]">
            <Image
              src={unityFlowUser}
              alt="user"
              width={35}
              height={35}
              className="w-[30px] h-[30px] object-cover rounded-full"
            />
          </div>
          <p className="flex-1 font-epilogue font-normal text-[12px] text-[#6b7280] truncate">
            by <span className="text-[#111827] font-semibold">{organizer.slice(0, 10)}...{organizer.slice(-4)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FundraisingCampaign;
