import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, 
  images: {
    domains: ['loremflickr.com', "picsum.photos"], 
  },
};

export default nextConfig;
