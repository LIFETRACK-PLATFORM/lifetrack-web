"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ConfirmEmailView } from "@/modules/auth/ui/views/ConfirmEmailView";
import { HttpAuthRepository } from "@/modules/auth/infrastructure/HttpAuthRepository";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const repository = new HttpAuthRepository();
  return <ConfirmEmailView repository={repository} token={token} />;
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmEmailContent />
    </Suspense>
  );
}
