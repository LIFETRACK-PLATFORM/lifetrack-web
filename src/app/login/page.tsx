"use client";

import { LoginView } from "@/modules/auth/ui/views/LoginView";
import { HttpAuthRepository } from "@/modules/auth/infrastructure/HttpAuthRepository";

export default function LoginPage() {
  const repository = new HttpAuthRepository();
  return <LoginView repository={repository} />;
}
