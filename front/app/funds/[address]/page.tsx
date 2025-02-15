"use client"

import { useRouter, useParams } from "next/navigation";

export default function Fund() {
  const { address } = useParams();
  const router = useRouter();

    return <div>{address}</div>
}