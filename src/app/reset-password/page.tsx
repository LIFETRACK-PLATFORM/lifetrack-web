"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ResetPasswordView } from "@/modules/auth/ui/views/ResetPasswordView";
import { HttpAuthRepository } from "@/modules/auth/infrastructure/HttpAuthRepository";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const repository = new HttpAuthRepository();
  return <ResetPasswordView repository={repository} token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
