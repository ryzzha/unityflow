"use client"

import { useRouter, useParams } from "next/navigation";

export default function Account() {
  const { address } = useParams();
  const router = useRouter();

    return <div>Account page</div>
}