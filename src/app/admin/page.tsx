"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/adminAuth";

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAdminLoggedIn()) {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/admin/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-sans text-sm">
      Loading Admin Portal...
    </div>
  );
}
