"use client";

import { Suspense } from "react";
import { LinkAccountView } from "@/modules/auth/ui/views/LinkAccountView";
import { HttpAuthRepository } from "@/modules/auth/infrastructure/HttpAuthRepository";

function LinkAccountPageContent() {
  const repository = new HttpAuthRepository();
  return <LinkAccountView repository={repository} />;
}

export default function LinkAccountPage() {
  return (
    <Suspense fallback={null}>
      <LinkAccountPageContent />
    </Suspense>
  );
}
