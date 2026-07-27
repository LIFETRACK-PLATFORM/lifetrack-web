"use client";

import { RegisterView } from "@/modules/auth/ui/views/RegisterView";
import { HttpAuthRepository } from "@/modules/auth/infrastructure/HttpAuthRepository";

export default function RegisterPage() {
  const repository = new HttpAuthRepository();
  return <RegisterView repository={repository} />;
}
