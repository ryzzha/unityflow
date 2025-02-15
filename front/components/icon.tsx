import React from "react";
import Image from "next/image";

import EthIcon from "@/assets/ethereum.png";
import UnityFlowIcon from "@/assets/unityflow.svg";

const icons = {
  eth: EthIcon,
  uf: UnityFlowIcon,
};

type IconProps = {
  name: keyof typeof icons;
  size?: number;
  className?: string;
};

export const Icon: React.FC<IconProps> = ({ name, size = 20, className = "" }) => {
  const IconSrc = icons[name];

  return <Image src={IconSrc} alt={name} width={size} height={size} className={className} />;
};
