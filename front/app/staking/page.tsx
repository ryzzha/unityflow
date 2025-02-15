"use client"

import { useRouter, useParams } from "next/navigation";

export default function Staking() {
  const { address } = useParams();
  const router = useRouter();

    return <div>Staking page</div>
}