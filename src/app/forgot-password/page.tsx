"use client";

import { ForgotPasswordView } from "@/modules/auth/ui/views/ForgotPasswordView";
import { HttpAuthRepository } from "@/modules/auth/infrastructure/HttpAuthRepository";

export default function ForgotPasswordPage() {
  const repository = new HttpAuthRepository();
  return <ForgotPasswordView repository={repository} />;
}
